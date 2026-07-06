import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateReservationDto {
  // The student's Computerra code — optional. Validated server-side, never
  // trusted as-is. Omitted entirely, the reservation is priced at regular
  // price with no code attached.
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsUUID()
  productId: string;

  // Pre-filled from the code's student name on the storefront, but editable —
  // falls back to the code's own name server-side if omitted.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  studentName?: string;

  @IsString()
  @MaxLength(200)
  studentContact: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
