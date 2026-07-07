import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ADMIN_COOKIE_NAME } from './auth/auth.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Allow the Next.js origin(s) to call the API from the browser, and let
  // it send/receive the admin auth cookie (credentials). WEB_ORIGIN can be
  // a comma-separated list (e.g. local dev + the deployed Vercel URL) —
  // an Origin header is never a single fixed string across environments.
  const webOrigins = (process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: webOrigins,
    credentials: true,
  });

  // API docs, outside the /api prefix. Admin auth is a cookie, not a header,
  // so "Authorize" in the UI just needs you logged in already (via
  // /api/auth/login) in the same browser tab.
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Softclub Store API')
      .setDescription('API магазина и админ-панели Softclub Store')
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
