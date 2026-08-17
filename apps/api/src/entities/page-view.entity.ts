import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// A single storefront page load, recorded by the client-side beacon. This is
// an append-only log — never updated after insert, so there's no updatedAt.
@Entity('page_views')
export class PageView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  path: string;

  // Client-generated (crypto.randomUUID(), persisted in localStorage) —
  // not tied to any real identity, just distinguishes repeat visitors.
  @Column('text', { name: 'visitor_id', nullable: true })
  visitorId: string | null;

  @Column('text', { nullable: true })
  referrer: string | null;

  @Column('text', { name: 'user_agent', nullable: true })
  userAgent: string | null;

  // Every summary query range-filters on this column.
  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
