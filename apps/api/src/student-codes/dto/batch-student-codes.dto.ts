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

  // Shared discount override applied to every code in the batch, if set.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  discountOverride?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
