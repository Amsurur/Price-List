import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateStudentCodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  studentName?: string;

  // null clears the bonus so only the product's own member_discount applies.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(90)
  extraDiscount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  // Toggle off to disable the code instantly.
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
