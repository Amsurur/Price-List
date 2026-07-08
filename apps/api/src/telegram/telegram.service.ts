import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Best-effort admin notifications over the Telegram Bot API. Never throws —
// a broken/unconfigured bot must not break reservation creation or status
// updates, which are the actual user-facing actions.
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private warnedMissingConfig = false;

  constructor(private readonly config: ConfigService) {}

  async notify(text: string): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatIds = (this.config.get<string>('TELEGRAM_CHAT_ID') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (!token || chatIds.length === 0) {
      if (!this.warnedMissingConfig) {
        this.logger.warn(
          'Telegram notifications are not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) — skipping.',
        );
        this.warnedMissingConfig = true;
      }
      return;
    }

    // Each recipient is sent independently — one invalid/blocked chat ID
    // must not stop the rest from getting notified.
    await Promise.all(chatIds.map((chatId) => this.send(token, chatId, text)));
  }

  private async send(token: string, chatId: string, text: string): Promise<void> {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        },
      );
      if (!res.ok) {
        this.logger.warn(
          `Telegram sendMessage to ${chatId} failed: ${res.status} ${await res.text()}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Telegram sendMessage to ${chatId} error: ${(err as Error).message}`,
      );
    }
  }
}
