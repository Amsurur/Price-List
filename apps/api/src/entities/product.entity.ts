import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  // Lowercased tags used by storefront filters, e.g. {laptop, design, i7}.
  @Column('text', { array: true, default: () => "'{}'" })
  tags: string[];

  // Regular price, before any discount.
  @Column('integer')
  price: number;

  // Standard Softclub discount % for this item.
  @Column('integer', { name: 'member_discount', default: 15 })
  memberDiscount: number;

  @Column('integer', { default: 0 })
  stock: number;

  @Column('text', { name: 'image_url', nullable: true })
  imageUrl: string | null;

  // Hide from the store without deleting.
  @Column('boolean', { default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
