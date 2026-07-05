import { IsIn } from 'class-validator';

// 'new' is never a valid target — it's only the creation default.
export const RESERVATION_TARGET_STATUSES = [
  'contacted',
  'completed',
  'cancelled',
] as const;

export type ReservationTargetStatus =
  (typeof RESERVATION_TARGET_STATUSES)[number];

export class UpdateReservationStatusDto {
  @IsIn(RESERVATION_TARGET_STATUSES)
  status: ReservationTargetStatus;
}
