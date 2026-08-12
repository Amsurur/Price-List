import {
  ArgumentsHost,
  BadRequestException,
  Body,
  Catch,
  Controller,
  Delete,
  ExceptionFilter,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, memoryStorage } from 'multer';
import type { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductImage } from '../entities/product-image.entity';
import { ProductsService } from './products.service';
import { BulkCreateProductsDto } from './dto/bulk-create-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const ALLOWED_IMAGE = /\.(jpe?g|png|webp|gif)$/i;
const MAX_IMAGE_MB = 15;

// Multer rejects with its own error type, outside Nest's HttpException
// hierarchy, so an oversized photo reaches the admin as a bare 500 with no
// explanation. Phone cameras routinely produce files this big — give it a
// real status and a message the admin can act on.
@Catch(MulterError)
class MulterExceptionFilter implements ExceptionFilter {
  catch(error: MulterError, host: ArgumentsHost) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE';
    const status = tooLarge
      ? HttpStatus.PAYLOAD_TOO_LARGE
      : HttpStatus.BAD_REQUEST;
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({
        statusCode: status,
        message: tooLarge
          ? `Фото больше ${MAX_IMAGE_MB} МБ — выберите файл поменьше`
          : 'Не удалось прочитать файл',
      });
  }
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    @InjectRepository(ProductImage)
    private readonly images: Repository<ProductImage>,
  ) {}

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

  // Save an image's bytes in Postgres (not local disk) and return its public
  // URL. Hosts like Render's free tier have an ephemeral filesystem, so disk
  // storage doesn't survive a redeploy — the DB is the one thing that does.
  @UseGuards(JwtAuthGuard)
  @UseFilters(MulterExceptionFilter)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        ALLOWED_IMAGE.test(file.originalname)
          ? cb(null, true)
          : cb(
              new BadRequestException('Разрешены только JPG, PNG, WEBP и GIF'),
              false,
            ),
    }),
  )
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }
    const image = await this.images.save(
      this.images.create({ data: file.buffer, mimeType: file.mimetype }),
    );
    return { imageUrl: `/api/products/images/${image.id}` };
  }

  // Public — the storefront (no login) needs to load these too.
  @Get('images/:id')
  async getImage(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const image = await this.images.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }
    res.set('Content-Type', image.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
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

  // Bulk upload from the admin's review screen — each row is validated and
  // saved independently, so the response reports per-row success/failure
  // instead of accepting or rejecting the whole batch.
  @UseGuards(JwtAuthGuard)
  @Post('bulk')
  bulkCreate(@Body() dto: BulkCreateProductsDto) {
    return this.products.bulkCreate(dto.items);
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
