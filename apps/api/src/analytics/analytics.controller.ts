import { Body, Controller, Get, HttpCode, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { CreatePageViewDto } from './dto/create-page-view.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  // Public: fired by the storefront's tracking beacon on every page view.
  @Post('page-views')
  @HttpCode(204)
  async create(@Body() dto: CreatePageViewDto, @Req() req: Request): Promise<void> {
    await this.analytics.recordPageView(dto, req.headers['user-agent']);
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  getSummary(@Query('days') days?: string) {
    return this.analytics.getSummary(days ? parseInt(days, 10) : 30);
  }
}
