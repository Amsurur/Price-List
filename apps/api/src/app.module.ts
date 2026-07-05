import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { ReservationsModule } from './reservations/reservations.module';
import { StudentCodesModule } from './student-codes/student-codes.module';

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
        // Managed Postgres (e.g. Render's external connection string) requires
        // SSL with a self-signed chain; local/dev and internal-network
        // connections don't need it, so it's opt-in via DB_SSL.
        const ssl =
          config.get<string>('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false;
        const base = {
          type: 'postgres' as const,
          autoLoadEntities: true,
          // M0 dev convenience only. Replaced by migrations in M1.
          synchronize: true,
          ssl,
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
    StudentCodesModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
