import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Product photo bytes, stored in Postgres rather than local disk — hosts
// like Render's free tier have an ephemeral filesystem, so anything written
// to disk is lost on the next deploy/restart. Served via
// GET /api/products/images/:id (see products.controller.ts).
@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bytea')
  data: Buffer;

  @Column('text', { name: 'mime_type' })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
