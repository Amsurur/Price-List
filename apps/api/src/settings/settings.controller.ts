import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TelegramService } from '../telegram/telegram.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly telegram: TelegramService,
  ) {}

  // Public — the storefront shows the address, phone and hours.
  @Get()
  get() {
    return this.settings.get();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settings.update(dto);
  }

  // Admin sidebar card: are reservation notifications set up?
  @UseGuards(JwtAuthGuard)
  @Get('telegram-status')
  telegramStatus() {
    return this.telegram.status();
  }
}
