import {
  BadRequestException,
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Public URL prefix images are served under — always "/uploads/", regardless
// of where the files physically live on disk (see UPLOADS_DIR below).
export const UPLOADS_URL_PREFIX = 'uploads';

// Where uploaded images land on disk. Served statically in main.ts. Defaults
// to a relative dev path; in production this should point at a persistent
// disk mount (e.g. a Render Disk), since the container's own filesystem is
// wiped on every deploy/restart. May be relative or absolute.
export const UPLOADS_DIR = process.env.UPLOADS_DIR ?? 'uploads';
const ALLOWED_IMAGE = /\.(jpe?g|png|webp|gif)$/i;

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('active') active?: string,
    @Query('code') code?: string,
  ) {
    return this.products.findAll({
      search,
      tag,
      active: active === undefined ? undefined : active === 'true',
      code,
    });
  }

  // Save an image to local disk and return its public URL.
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: resolve(UPLOADS_DIR),
        filename: (_req, file, cb) =>
          cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        ALLOWED_IMAGE.test(file.originalname)
          ? cb(null, true)
          : cb(new BadRequestException('Only image files are allowed'), false),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return { imageUrl: `/${UPLOADS_URL_PREFIX}/${file.filename}` };
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.products.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.remove(id);
  }
}
