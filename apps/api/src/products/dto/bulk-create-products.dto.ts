import { ArrayMaxSize, ArrayMinSize, IsArray } from 'class-validator';

// Deliberately not `@ValidateNested` against CreateProductDto — that would
// make the global ValidationPipe reject the whole request if a single row
// is invalid. Each row is validated individually in the service instead, so
// a batch can partially succeed (see ProductsService.bulkCreate).
export class BulkCreateProductsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  items: Record<string, unknown>[];
}
