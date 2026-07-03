import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // Load .env from the repo root so a single file drives web + api + docker.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        const base = {
          type: 'postgres' as const,
          autoLoadEntities: true,
          // M0 dev convenience only. Replaced by migrations in M1.
          synchronize: true,
        };
        if (url) {
          return { ...base, url };
        }
        return {
          ...base,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
          username: config.get<string>('DB_USER', 'softclub'),
          password: config.get<string>('DB_PASSWORD', 'softclub'),
          database: config.get<string>('DB_NAME', 'softclub_store'),
        };
      },
    }),
    AuthModule,
    HealthModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
