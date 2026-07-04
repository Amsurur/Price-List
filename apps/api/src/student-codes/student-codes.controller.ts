import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StudentCodesService } from './student-codes.service';
import { CreateStudentCodeDto } from './dto/create-student-code.dto';
import { BatchStudentCodesDto } from './dto/batch-student-codes.dto';
import { UpdateStudentCodeDto } from './dto/update-student-code.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';

@Controller('student-codes')
export class StudentCodesController {
  constructor(private readonly codes: StudentCodesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query('search') search?: string) {
    return this.codes.findAll({ search });
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async export(@Res() res: Response) {
    const csv = await this.codes.exportCsv();
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="student-codes.csv"',
    });
    res.send(csv);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateStudentCodeDto) {
    return this.codes.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('batch')
  createBatch(@Body() dto: BatchStudentCodesDto) {
    return this.codes.createBatch(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentCodeDto,
  ) {
    return this.codes.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.codes.remove(id);
  }

  // Public: the storefront's code-entry gate. Never exposes the full table —
  // only what's needed to unlock pricing.
  @Post('validate')
  @HttpCode(200)
  validate(@Body() dto: ValidateCodeDto) {
    return this.codes.validate(dto.code);
  }
}
