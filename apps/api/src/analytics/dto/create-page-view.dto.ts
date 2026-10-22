import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePageViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  path: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  visitorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string;
}
