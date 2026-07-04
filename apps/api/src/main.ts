import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { AppModule } from './app.module';
import { ADMIN_COOKIE_NAME } from './auth/auth.constants';
import { UPLOADS_DIR } from './products/products.controller';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // All routes live under /api so the web app can proxy/point cleanly.
  app.setGlobalPrefix('api');

  // Parses the admin auth cookie onto req.cookies for the JWT strategy.
  app.use(cookieParser());

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

  // Allow the Next.js dev origin to call the API from the browser, and let
  // it send/receive the admin auth cookie (credentials).
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // API docs, outside the /api prefix like /uploads. Admin auth is a cookie,
  // not a header, so "Authorize" in the UI just needs you logged in already
  // (via /api/auth/login) in the same browser tab.
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Softclub Store API')
      .setDescription('Storefront + admin API for Softclub Store')
      .setVersion('1.0')
      .addCookieAuth(ADMIN_COOKIE_NAME)
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  // Render (and most PaaS hosts) assign the port via $PORT and ignore
  // whatever we ask for, so it takes priority over our own API_PORT.
  const port = process.env.PORT ?? process.env.API_PORT ?? 3001;
  await app.listen(port);

  console.log(`API listening on http://localhost:${port}/api`);
}
bootstrap();
