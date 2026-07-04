import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCode } from '../entities/student-code.entity';
import { StudentCodesController } from './student-codes.controller';
import { StudentCodesService } from './student-codes.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentCode])],
  controllers: [StudentCodesController],
  providers: [StudentCodesService],
  // ProductsModule imports this to price listings against the applied code.
  exports: [StudentCodesService],
})
export class StudentCodesModule {}
