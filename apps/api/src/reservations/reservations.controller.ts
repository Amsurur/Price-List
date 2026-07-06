import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import type { ReservationStatus } from '../entities/reservation.entity';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('status') status?: ReservationStatus,
    @Query('search') search?: string,
  ) {
    return this.reservations.findAll({ status, search });
  }

  // Public: the storefront's reservation step. Code is optional — it
  // applies the member price when valid, but reserving works without one.
  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateReservationDto) {
    return this.reservations.create(dto);
  }

  // The only mutation route — snapshot fields are never editable after
  // creation, only the status pipeline moves.
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservations.updateStatus(id, dto);
  }
}
