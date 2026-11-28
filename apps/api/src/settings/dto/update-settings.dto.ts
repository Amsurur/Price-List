import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Empty strings clear a field (stored as null).
const emptyToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

export class UpdateSettingsDto {
  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(300)
  address?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(50)
  phone?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().replace(/^@/, '') || null : value,
  )
  @IsString()
  @Matches(/^[A-Za-z0-9_]{3,32}$/, {
    message: 'Telegram: только латиница, цифры и _, без @',
  })
  telegram?: string | null;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(200)
  hours?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  holdDays?: number;

  @IsOptional()
  @Transform(emptyToNull)
  @IsString()
  @MaxLength(500)
  @Matches(/^https?:\/\//, {
    message: 'Ссылка на карту должна начинаться с http',
  })
  mapUrl?: string | null;
}
