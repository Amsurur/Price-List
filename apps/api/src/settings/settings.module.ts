import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopSettings } from '../entities/shop-settings.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShopSettings]), TelegramModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
