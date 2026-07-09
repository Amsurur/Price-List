import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import {
  memberPrice,
  PricingCode,
  saving,
  stockLabel,
} from '../common/pricing';
import { StudentCodesService } from '../student-codes/student-codes.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Pulls the DB image id out of a stored `/api/products/images/<id>` URL —
// used to clean up ProductImage rows once nothing on the product points at
// them anymore, so deleting/replacing a photo doesn't leak blobs forever.
const IMAGE_URL_ID = /\/products\/images\/([0-9a-f-]{36})$/i;

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
  // A validated student code, to price the listing with that student's
  // extra discount stacked on top of each product's own discount.
  code?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImages: Repository<ProductImage>,
    private readonly studentCodes: StudentCodesService,
  ) {}

  private imageIdsOf(product: Product): string[] {
    const urls = [
      ...product.images,
      ...(product.imageUrl ? [product.imageUrl] : []),
    ];
    return urls
      .map((url) => IMAGE_URL_ID.exec(url)?.[1])
      .filter((id): id is string => Boolean(id));
  }

  // With no code, this reflects each product's own standard discount, which
  // is always shown on the storefront. A code adds its own extraDiscount on
  // top of that (see pricing.ts) — bigger for the student, never smaller.
  private toView(
    product: Product,
    code: PricingCode | null = null,
  ): ProductView {
    return {
      ...product,
      // Derived live so correctness never depends on the backfill script's
      // timing: falls back to the legacy single imageUrl until images is
      // populated (see backfill-product-images.ts).
      images:
        product.images.length > 0
          ? product.images
          : product.imageUrl
            ? [product.imageUrl]
            : [],
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
      ? { extraDiscount: code.extraDiscount }
      : null;
    return rows.map((p) => this.toView(p, pricingCode));
  }

  async findOne(id: string): Promise<ProductView> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Товар не найден');
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
      throw new NotFoundException('Товар не найден');
    }
    const beforeIds = this.imageIdsOf(product);
    Object.assign(product, dto);
    const saved = await this.products.save(product);
    const afterIds = new Set(this.imageIdsOf(saved));
    const removedIds = beforeIds.filter((imageId) => !afterIds.has(imageId));
    if (removedIds.length > 0) {
      await this.productImages.delete(removedIds);
    }
    return this.toView(saved);
  }

  async remove(id: string): Promise<void> {
    const product = await this.products.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }
    const imageIds = this.imageIdsOf(product);
    await this.products.delete(id);
    if (imageIds.length > 0) {
      await this.productImages.delete(imageIds);
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
