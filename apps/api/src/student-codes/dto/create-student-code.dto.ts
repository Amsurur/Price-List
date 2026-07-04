import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStudentCodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  studentName?: string;

  // If set, this % applies to all products for this student (see pricing.ts).
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
