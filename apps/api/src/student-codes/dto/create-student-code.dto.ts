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

  // If set, this % stacks on top of each product's own member discount
  // (see pricing.ts).
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
