import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { UPLOADS_DIR } from './products/products.controller';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // All routes live under /api so the web app can proxy/point cleanly.
  app.setGlobalPrefix('api');

  // Validate + strip request bodies against the DTOs, and coerce query/body
  // types (e.g. numbers from JSON) so class-validator rules apply cleanly.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve uploaded product images from local disk (dev). URLs look like
  // /uploads/<file> — deliberately outside the /api prefix.
  app.useStaticAssets(join(process.cwd(), UPLOADS_DIR), {
    prefix: `/${UPLOADS_DIR}/`,
  });

  // Allow the Next.js dev origin to call the API from the browser.
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}/api`);
}
bootstrap();
