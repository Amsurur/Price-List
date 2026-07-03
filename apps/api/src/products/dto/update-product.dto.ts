import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// Every field optional; same validation rules as create.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
