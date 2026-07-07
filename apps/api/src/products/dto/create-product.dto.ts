import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  // Lowercase and trim tags; drop empties.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .map((t: string) => String(t).trim().toLowerCase())
          .filter((t: string) => t.length > 0)
      : value,
  )
  tags?: string[];

  @IsInt()
  @Min(0)
  price: number;

  // Standard Softclub discount %, clamped 0–90 (see documents/04-business-logic.md).
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  memberDiscount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  // Photo URLs in display order; the first is the cover. Capped at 8 — a
  // handful of angles is plenty for a shop item.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
