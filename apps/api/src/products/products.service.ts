import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import {
  memberPrice,
  PricingCode,
  saving,
  stockLabel,
} from '../common/pricing';
import { StudentCodesService } from '../student-codes/student-codes.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// What the API returns: the stored product plus the computed pricing/stock
// fields, so the web never re-implements the discount maths.
export interface ProductView extends Product {
  memberPrice: number;
  saving: number;
  stockLabel: string | null;
}

export interface FindProductsQuery {
  search?: string;
  tag?: string;
  active?: boolean;
  // A validated student code, to price the listing for that student's
  // discount override (falls back to each product's own discount if unset).
  code?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    private readonly studentCodes: StudentCodesService,
  ) {}

  // With no code, this reflects each product's own standard discount — used
  // as-is by the admin view. The storefront only shows it once a student's
  // code is applied; it decides that gating itself.
  private toView(
    product: Product,
    code: PricingCode | null = null,
  ): ProductView {
    return {
      ...product,
      memberPrice: memberPrice(product, code),
      saving: saving(product, code),
      stockLabel: stockLabel(product.stock),
    };
  }

  async findAll(query: FindProductsQuery = {}): Promise<ProductView[]> {
    const qb = this.products
      .createQueryBuilder('p')
      .orderBy('p.created_at', 'DESC');

    if (query.search) {
      const term = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(p.name) LIKE :term OR LOWER(p.description) LIKE :term OR LOWER(p.category) LIKE :term OR EXISTS (SELECT 1 FROM unnest(p.tags) AS t WHERE t LIKE :term))',
        { term },
      );
    }

    if (query.tag) {
      qb.andWhere(':tag = ANY(p.tags)', { tag: query.tag.toLowerCase() });
    }

    if (query.active !== undefined) {
      qb.andWhere('p.active = :active', { active: query.active });
    }

    const rows = await qb.getMany();
    const code = query.code
      ? await this.studentCodes.findActiveByCode(query.code)
      : null;
    const pricingCode: PricingCode | null = code
      ? { discountOverride: code.discountOverride }
      : null;
    return rows.map((p) => this.toView(p, pricingCode));
  }

  async findOne(id: string): Promise<ProductView> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toView(product);
  }

  async create(dto: CreateProductDto): Promise<ProductView> {
    const product = this.products.create(dto);
    const saved = await this.products.save(product);
    return this.toView(saved);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductView> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    Object.assign(product, dto);
    const saved = await this.products.save(product);
    return this.toView(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.products.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Product not found');
    }
  }

  // Atomic, floor-at-0 decrement — the only place stock ever moves (on a
  // reservation's contacted → completed transition). A single UPDATE avoids
  // a read-then-write race between two reservations completing close together.
  async decrementStock(id: string, qty: number): Promise<void> {
    await this.products
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => 'GREATEST(stock - :qty, 0)' })
      .where('id = :id', { id })
      .setParameter('qty', qty)
      .execute();
  }
}
