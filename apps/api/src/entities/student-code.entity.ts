import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// One row per student. The code verifies the student, applies their discount,
// and tracks their activity. See documents/03-data-model.md.
// (No endpoints in Slice 1 — defined now so the schema is whole.)
@Entity('student_codes')
export class StudentCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Readable, e.g. SOFT-7K2Q. Compared case-insensitively in business logic.
  @Column('text', { unique: true })
  code: string;

  @Column('text', { name: 'student_name', nullable: true })
  studentName: string | null;

  // If set, this % stacks on top of each product's own member_discount
  // (e.g. product 10% + code 5% = 15%, clamped at 90); if null, only the
  // product's own discount applies.
  @Column('integer', { name: 'extra_discount', nullable: true })
  extraDiscount: number | null;

  // Toggle off to disable instantly.
  @Column('boolean', { default: true })
  active: boolean;

  @Column('text', { nullable: true })
  note: string | null;

  @Column('integer', { name: 'uses_count', default: 0 })
  usesCount: number;

  @Column('timestamptz', { name: 'last_used_at', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
