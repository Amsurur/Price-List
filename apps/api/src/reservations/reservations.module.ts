import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../entities/reservation.entity';
import { ProductsModule } from '../products/products.module';
import { StudentCodesModule } from '../student-codes/student-codes.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    StudentCodesModule,
    ProductsModule,
    TelegramModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
