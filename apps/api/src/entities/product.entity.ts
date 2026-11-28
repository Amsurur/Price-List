import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// One colour a product comes in. extraPrice is added to the base price;
// images (a subset of the product's photos) show when the colour is picked.
export interface ProductColor {
  name: string;
  hex: string;
  extraPrice: number;
  images: string[];
  // Stock of this colour. Null/absent means "use the product's stock".
  stock?: number | null;
}

// One configuration (e.g. "16 ГБ / 512 ГБ"), priced on top of the base.
export interface ProductConfig {
  label: string;
  extraPrice: number;
}

// One row of the specification table, e.g. { label: 'Экран', value: '13.6″' }.
export interface ProductSpec {
  label: string;
  value: string;
}

// Catalogue item. Money is a whole-unit integer; member_discount is a percent 0–90.
// See documents/03-data-model.md.
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('text', { nullable: true })
  category: string | null;

  // Manufacturer, e.g. "Apple". Drives the storefront's brand tiles.
  @Column('text', { nullable: true })
  brand: string | null;

  // Lowercased tags used by storefront filters, e.g. {laptop, design, i7}.
  @Column('text', { array: true, default: () => "'{}'" })
  tags: string[];

  // Regular price, before any discount.
  @Column('integer')
  price: number;

  // A sale for everyone (the "Акция" badge), stacked with the member
  // discount; 0 means no sale.
  @Column('integer', { name: 'sale_percent', default: 0 })
  salePercent: number;

  // "Кому подойдёт": short audience labels, e.g. {Для учёбы, Для дизайна}.
  @Column('text', { array: true, default: () => "'{}'" })
  audience: string[];

  // Standard Softclub discount % for this item.
  @Column('integer', { name: 'member_discount', default: 15 })
  memberDiscount: number;

  @Column('integer', { default: 0 })
  stock: number;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string | null;

  // Photo URLs in display order; the first is the cover shown on the card.
  // imageUrl is kept for one transitional slice — see toView() in
  // products.service.ts for the derivation used until it's dropped.
  @Column('text', { array: true, default: () => "'{}'" })
  images: string[];

  // Options and specs are small, product-owned lists, so they live as
  // jsonb on the product rather than separate tables. Empty by default, so
  // existing rows are unaffected when the columns are added.
  @Column('jsonb', { default: () => "'[]'" })
  colors: ProductColor[];

  @Column('jsonb', { default: () => "'[]'" })
  configs: ProductConfig[];

  @Column('jsonb', { default: () => "'[]'" })
  specs: ProductSpec[];

  // Hide from the store without deleting.
  @Column('boolean', { default: true })
  active: boolean;

  // Manual display order (admin drag-and-drop). Lower sorts first; ties break
  // on created_at. New products are appended after the current max.
  @Column('integer', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
