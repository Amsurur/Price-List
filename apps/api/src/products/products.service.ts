import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { memberPrice, saving, stockLabel } from '../common/pricing';
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
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  // Compute member price/saving with the product's own standard discount
  // (no student code applies on the admin side).
  private toView(product: Product): ProductView {
    return {
      ...product,
      memberPrice: memberPrice(product, null),
      saving: saving(product, null),
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

    const rows = await qb.getMany();
    return rows.map((p) => this.toView(p));
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
}
