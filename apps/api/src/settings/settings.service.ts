import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShopSettings } from '../entities/shop-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const ID = 1;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ShopSettings)
    private readonly settings: Repository<ShopSettings>,
  ) {}

  // Created on first read, so a fresh database needs no seed step.
  async get(): Promise<ShopSettings> {
    const existing = await this.settings.findOne({ where: { id: ID } });
    if (existing) return existing;
    return this.settings.save(this.settings.create({ id: ID, holdDays: 3 }));
  }

  async update(dto: UpdateSettingsDto): Promise<ShopSettings> {
    const current = await this.get();
    Object.assign(current, dto);
    return this.settings.save(current);
  }
}
