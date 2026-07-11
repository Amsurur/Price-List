import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class BatchStudentCodesDto {
  // How many codes to generate at once.
  @IsInt()
  @Min(1)
  @Max(200)
  count: number;

  // Shared extra discount applied to every code in the batch, if set.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  extraDiscount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
