import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

// The full, ordered list of every product id — position in the array is the
// new sort_order. Enforced to cover every existing product (see
// ProductsService.reorder) so a stale client can't silently drop one.
export class ReorderProductsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}
