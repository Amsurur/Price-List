import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
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

// One row's outcome from a bulk upload — created rows carry the saved
// product, error rows carry a reason so the admin can fix and retry just
// that row without re-submitting the whole batch.
export interface BulkCreateResultItem {
  index: number;
  status: 'created' | 'error';
  product?: ProductView;
  error?: string;
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // New rows land after the current last item instead of colliding at 0.
  private async nextSortOrder(): Promise<number> {
    const row = await this.products
      .createQueryBuilder('p')
      .select('MAX(p.sort_order)', 'max')
      .getRawOne<{ max: string | null }>();
    const max = row?.max;
    return (max === null || max === undefined ? -1 : Number(max)) + 1;
  }

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
      .orderBy('p.sort_order', 'ASC')
      .addOrderBy('p.created_at', 'DESC');

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
    const sortOrder = await this.nextSortOrder();
    const product = this.products.create({ ...dto, sortOrder });
    const saved = await this.products.save(product);
    return this.toView(saved);
  }

  // Bulk upload from the admin's spreadsheet/JSON review screen. Each row is
  // validated and saved independently — one bad row (bad price, missing
  // name) shouldn't block the rest of a 50-row batch, so this doesn't run
  // inside a transaction and never throws for a row-level problem.
  async bulkCreate(
    items: Record<string, unknown>[],
  ): Promise<BulkCreateResultItem[]> {
    const results: BulkCreateResultItem[] = [];
    for (const [index, raw] of items.entries()) {
      const dto = plainToInstance(CreateProductDto, raw);
      const errors = await validate(dto, { whitelist: true });
      if (errors.length > 0) {
        const reason = errors
          .flatMap((e) => Object.values(e.constraints ?? {}))
          .join('; ');
        results.push({
          index,
          status: 'error',
          error: reason || 'Неверные данные',
        });
        continue;
      }
      try {
        const product = await this.create(dto);
        results.push({ index, status: 'created', product });
      } catch {
        results.push({
          index,
          status: 'error',
          error: 'Не удалось сохранить товар',
        });
      }
    }
    return results;
  }

  // Admin drag-and-drop reorder. `ids` must be every product id, in the new
  // display order — unlike bulkCreate, a partial reorder would leave the
  // table in an inconsistent order, so this runs as one transaction and
  // rejects outright if the list doesn't match what's actually in the DB
  // (e.g. a second admin tab added a product mid-drag).
  async reorder(ids: string[]): Promise<void> {
    const total = await this.products.count();
    if (ids.length !== total) {
      throw new BadRequestException('Список товаров устарел — обновите страницу');
    }
    await this.dataSource.transaction(async (manager) => {
      const found = await manager
        .createQueryBuilder(Product, 'p')
        .where('p.id IN (:...ids)', { ids })
        .getCount();
      if (found !== ids.length) {
        throw new BadRequestException('Список товаров устарел — обновите страницу');
      }
      await Promise.all(
        ids.map((id, index) =>
          manager
            .createQueryBuilder()
            .update(Product)
            .set({ sortOrder: index })
            .where('id = :id', { id })
            .execute(),
        ),
      );
    });
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
