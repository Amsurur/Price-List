import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ReservationStatus = 'new' | 'contacted' | 'completed' | 'cancelled';

// A student's reserve-for-pickup request. product_name and unit_price are
// SNAPSHOTS taken at creation so later product edits never rewrite history.
// See documents/03-data-model.md and documents/04-business-logic.md.
@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Which student reserved (FK → student_codes.id).
  @Column('uuid', { name: 'code_id' })
  codeId: string;

  @Column('text', { name: 'student_name', nullable: true })
  studentName: string | null;

  @Column('text', { name: 'student_contact' })
  studentContact: string;

  // Reference (FK → products.id) — may later change or be deleted.
  @Column('uuid', { name: 'product_id', nullable: true })
  productId: string | null;

  // Snapshot of the product name at reservation time.
  @Column('text', { name: 'product_name' })
  productName: string;

  // Snapshot of the member price paid (whole-unit integer).
  @Column('integer', { name: 'unit_price' })
  unitPrice: number;

  @Column('integer', { default: 1 })
  quantity: number;

  @Column('text', { default: 'new' })
  status: ReservationStatus;

  @Column('text', { nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
