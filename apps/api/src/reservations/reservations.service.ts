import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { memberPrice } from '../common/pricing';
import { ProductsService } from '../products/products.service';
import { StudentCodesService } from '../student-codes/student-codes.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

// The human-readable code string, joined in for display — never the FK alone.
export interface ReservationView extends Reservation {
  code: string;
}

export interface FindReservationsQuery {
  status?: ReservationStatus;
  search?: string;
}

// The only legal moves. 'completed'/'cancelled' are terminal — this is also
// the idempotency guard for the stock decrement: a second "complete" request
// on an already-completed row has no allowed transition, so it's rejected
// rather than silently re-decrementing stock.
const ALLOWED_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  new: ['contacted', 'cancelled'],
  contacted: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservations: Repository<Reservation>,
    private readonly studentCodes: StudentCodesService,
    private readonly products: ProductsService,
  ) {}

  private async toView(reservation: Reservation): Promise<ReservationView> {
    const codes = await this.studentCodes.findCodeStrings([reservation.codeId]);
    return { ...reservation, code: codes[reservation.codeId] ?? '—' };
  }

  private async toViews(
    reservations: Reservation[],
  ): Promise<ReservationView[]> {
    const codes = await this.studentCodes.findCodeStrings([
      ...new Set(reservations.map((r) => r.codeId)),
    ]);
    return reservations.map((r) => ({ ...r, code: codes[r.codeId] ?? '—' }));
  }

  async findAll(query: FindReservationsQuery = {}): Promise<ReservationView[]> {
    const qb = this.reservations
      .createQueryBuilder('r')
      .orderBy('r.created_at', 'DESC');

    if (query.status) {
      qb.andWhere('r.status = :status', { status: query.status });
    }

    if (query.search) {
      const term = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(r.student_name) LIKE :term OR LOWER(r.student_contact) LIKE :term)',
        { term },
      );
    }

    return this.toViews(await qb.getMany());
  }

  // The storefront's create step. Requires a currently-valid code and an
  // in-stock product; snapshots the product name + member price so later
  // edits never rewrite this reservation's history.
  async create(dto: CreateReservationDto): Promise<ReservationView> {
    const code = await this.studentCodes.findActiveByCode(dto.code);
    if (!code) {
      throw new BadRequestException("That code isn't valid.");
    }

    const product = await this.products.findOne(dto.productId);
    if (product.stock <= 0) {
      throw new BadRequestException('That item is out of stock.');
    }

    const entity = this.reservations.create({
      codeId: code.id,
      studentName: dto.studentName?.trim() || code.studentName,
      studentContact: dto.studentContact.trim(),
      productId: product.id,
      productName: product.name,
      unitPrice: memberPrice(product, {
        discountOverride: code.discountOverride,
      }),
      quantity: dto.quantity ?? 1,
      status: 'new',
      note: dto.note?.trim() || null,
    });
    const saved = await this.reservations.save(entity);

    // A reservation counts as a "use" of the code, same as validate().
    await this.studentCodes.recordUse(code.id);

    return this.toView(saved);
  }

  // The admin status pipeline: new → contacted → completed, cancelled from
  // any non-completed state. Never touches the snapshot fields.
  async updateStatus(
    id: string,
    dto: UpdateReservationStatusDto,
  ): Promise<ReservationView> {
    const reservation = await this.reservations.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const allowed = ALLOWED_TRANSITIONS[reservation.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Can't change a ${reservation.status} reservation.`,
      );
    }

    if (dto.status === 'completed' && reservation.productId) {
      await this.products.decrementStock(
        reservation.productId,
        reservation.quantity,
      );
    }

    reservation.status = dto.status;
    const saved = await this.reservations.save(reservation);
    return this.toView(saved);
  }
}
