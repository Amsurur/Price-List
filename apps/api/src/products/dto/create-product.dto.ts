import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductColorDto {
  @IsString()
  @MaxLength(60)
  name: string;

  // A CSS hex colour for the swatch, e.g. #C9CCD3.
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'Цвет должен быть в формате #RRGGBB',
  })
  hex: string;

  @IsInt()
  @Min(0)
  extraPrice: number;

  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number | null;
}

export class ProductConfigDto {
  @IsString()
  @MaxLength(80)
  label: string;

  @IsInt()
  @Min(0)
  extraPrice: number;
}

export class ProductSpecDto {
  @IsString()
  @MaxLength(80)
  label: string;

  @IsString()
  @MaxLength(300)
  value: string;
}

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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  // Lowercase and trim tags; drop empties.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value
          .map((t: unknown) => String(t).trim().toLowerCase())
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

  // A sale for everyone, stacked with memberDiscount (total clamped to 90).
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  salePercent?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? value.map((t: unknown) => String(t).trim()).filter((t: string) => t)
      : value,
  )
  audience?: string[];

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

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  colors?: ProductColorDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => ProductConfigDto)
  configs?: ProductConfigDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => ProductSpecDto)
  specs?: ProductSpecDto[];
}
