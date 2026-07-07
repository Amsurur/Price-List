import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { StudentCode } from '../entities/student-code.entity';
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

  private codeLabel(
    codeId: string | null,
    codes: Record<string, string>,
  ): string {
    if (!codeId) return 'Без кода';
    return codes[codeId] ?? '—';
  }

  private async toView(reservation: Reservation): Promise<ReservationView> {
    const codes = await this.studentCodes.findCodeStrings(
      reservation.codeId ? [reservation.codeId] : [],
    );
    return { ...reservation, code: this.codeLabel(reservation.codeId, codes) };
  }

  private async toViews(
    reservations: Reservation[],
  ): Promise<ReservationView[]> {
    const ids = [
      ...new Set(
        reservations
          .map((r) => r.codeId)
          .filter((id): id is string => id != null),
      ),
    ];
    const codes = await this.studentCodes.findCodeStrings(ids);
    return reservations.map((r) => ({
      ...r,
      code: this.codeLabel(r.codeId, codes),
    }));
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

  // The storefront's create step. A code is optional — reserving with a
  // valid code snapshots the member price, reserving without one snapshots
  // the regular price. Either way requires an in-stock product; snapshots
  // the product name + price so later edits never rewrite this
  // reservation's history.
  async create(dto: CreateReservationDto): Promise<ReservationView> {
    const trimmedCode = dto.code?.trim();
    let code: StudentCode | null = null;
    if (trimmedCode) {
      code = await this.studentCodes.findActiveByCode(trimmedCode);
      if (!code) {
        throw new BadRequestException('Код недействителен.');
      }
    }

    const product = await this.products.findOne(dto.productId);
    if (product.stock <= 0) {
      throw new BadRequestException('Этого товара нет в наличии.');
    }

    const entity = this.reservations.create({
      codeId: code?.id ?? null,
      studentName: dto.studentName?.trim() || code?.studentName || null,
      studentContact: dto.studentContact.trim(),
      productId: product.id,
      productName: product.name,
      unitPrice: code
        ? memberPrice(product, { discountOverride: code.discountOverride })
        : product.price,
      quantity: dto.quantity ?? 1,
      status: 'new',
      note: dto.note?.trim() || null,
    });
    const saved = await this.reservations.save(entity);

    // A reservation counts as a "use" of the code, same as validate().
    if (code) {
      await this.studentCodes.recordUse(code.id);
    }

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
      throw new NotFoundException('Бронь не найдена');
    }

    const allowed = ALLOWED_TRANSITIONS[reservation.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Нельзя изменить бронь со статусом «${reservation.status}».`,
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
