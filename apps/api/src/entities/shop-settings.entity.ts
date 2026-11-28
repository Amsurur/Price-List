import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

// The shop's public details, edited by the owner in the admin and shown on
// the storefront (footer, product page, reservation confirmation). Exactly
// one row, id = 1.
@Entity('shop_settings')
export class ShopSettings {
  @PrimaryColumn('integer')
  id: number;

  @Column('text', { nullable: true })
  address: string | null;

  @Column('text', { nullable: true })
  phone: string | null;

  // Telegram username without the @, e.g. "computerra_tj".
  @Column('text', { nullable: true })
  telegram: string | null;

  // Free text, e.g. "Пн–Сб 10:00–19:00".
  @Column('text', { nullable: true })
  hours: string | null;

  // How many days a reservation is held for pickup.
  @Column('integer', { name: 'hold_days', default: 3 })
  holdDays: number;

  // Optional link to the shop on a map (2GIS, Google Maps…).
  @Column('text', { name: 'map_url', nullable: true })
  mapUrl: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
