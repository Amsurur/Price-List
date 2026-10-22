import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageView } from '../entities/page-view.entity';
import { CreatePageViewDto } from './dto/create-page-view.dto';

export interface AnalyticsSummary {
  days: number;
  totalViews: number;
  uniqueVisitors: number;
  topPaths: { path: string; views: number }[];
  daily: { date: string; views: number; uniqueVisitors: number }[];
}

// No dedicated bot-detection library exists in this API — this is a
// deliberately small, inline filter, not a robust defense against abuse.
const BOT_USER_AGENT_SUBSTRINGS = [
  'bot',
  'spider',
  'crawl',
  'curl',
  'wget',
  'python-requests',
  'headless',
];

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(PageView)
    private readonly pageViews: Repository<PageView>,
  ) {}

  async recordPageView(dto: CreatePageViewDto, userAgent?: string): Promise<void> {
    if (!userAgent) return;
    const ua = userAgent.toLowerCase();
    if (BOT_USER_AGENT_SUBSTRINGS.some((s) => ua.includes(s))) return;

    await this.pageViews.save(
      this.pageViews.create({
        path: dto.path,
        visitorId: dto.visitorId ?? null,
        referrer: dto.referrer ?? null,
        userAgent: userAgent.slice(0, 500),
      }),
    );
  }

  async getSummary(days: number): Promise<AnalyticsSummary> {
    const clampedDays = Math.min(Math.max(Math.trunc(days) || 30, 1), 365);
    const since = new Date();
    since.setDate(since.getDate() - clampedDays);
    since.setHours(0, 0, 0, 0);

    const scoped = () =>
      this.pageViews
        .createQueryBuilder('pv')
        .where('pv.created_at >= :since', { since });

    const totalViews = await scoped().getCount();

    const uniqueRow = await scoped()
      .select('COUNT(DISTINCT pv.visitor_id)', 'count')
      .getRawOne<{ count: string }>();

    const topPathsRaw = await scoped()
      .select('pv.path', 'path')
      .addSelect('COUNT(*)', 'views')
      .groupBy('pv.path')
      .orderBy('views', 'DESC')
      .limit(10)
      .getRawMany<{ path: string; views: string }>();

    const dailyRaw = await scoped()
      .select("to_char(pv.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'views')
      .addSelect('COUNT(DISTINCT pv.visitor_id)', 'uniqueVisitors')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; views: string; uniqueVisitors: string }>();

    return {
      days: clampedDays,
      totalViews,
      uniqueVisitors: Number(uniqueRow?.count ?? 0),
      topPaths: topPathsRaw.map((r) => ({ path: r.path, views: Number(r.views) })),
      daily: dailyRaw.map((r) => ({
        date: r.date,
        views: Number(r.views),
        uniqueVisitors: Number(r.uniqueVisitors),
      })),
    };
  }
}
