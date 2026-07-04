import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { StudentCodesModule } from '../student-codes/student-codes.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), StudentCodesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
