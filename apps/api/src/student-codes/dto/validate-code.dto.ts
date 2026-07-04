import { IsString, MaxLength } from 'class-validator';

export class ValidateCodeDto {
  @IsString()
  @MaxLength(50)
  code: string;
}
