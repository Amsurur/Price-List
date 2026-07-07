import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StudentCode } from '../entities/student-code.entity';
import { CreateStudentCodeDto } from './dto/create-student-code.dto';
import { BatchStudentCodesDto } from './dto/batch-student-codes.dto';
import { UpdateStudentCodeDto } from './dto/update-student-code.dto';

// No ambiguous characters (0/O, 1/I) so codes are easy to read off a printout.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length = 4): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export type ValidateCodeResult =
  | { ok: false; reason: 'empty' | 'invalid' | 'disabled' }
  | { ok: true; studentName: string | null; discountOverride: number | null };

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

@Injectable()
export class StudentCodesService {
  constructor(
    @InjectRepository(StudentCode)
    private readonly codes: Repository<StudentCode>,
  ) {}

  async findAll(query: { search?: string } = {}): Promise<StudentCode[]> {
    const qb = this.codes
      .createQueryBuilder('c')
      .orderBy('c.created_at', 'DESC');

    if (query.search) {
      const term = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(c.code) LIKE :term OR LOWER(c.student_name) LIKE :term OR LOWER(c.note) LIKE :term)',
        { term },
      );
    }

    return qb.getMany();
  }

  // Generates a unique, readable code like SOFT-7K2Q. `exclude` avoids
  // collisions within the same not-yet-saved batch.
  private async generateUniqueCode(
    exclude: Set<string> = new Set(),
  ): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `SOFT-${randomSuffix()}`;
      if (exclude.has(candidate)) continue;
      const taken = await this.codes.exist({ where: { code: candidate } });
      if (!taken) return candidate;
    }
    throw new Error('Could not generate a unique student code');
  }

  async create(dto: CreateStudentCodeDto): Promise<StudentCode> {
    const code = await this.generateUniqueCode();
    const entity = this.codes.create({
      code,
      studentName: dto.studentName?.trim() || null,
      discountOverride: dto.discountOverride ?? null,
      note: dto.note?.trim() || null,
    });
    return this.codes.save(entity);
  }

  async createBatch(dto: BatchStudentCodesDto): Promise<StudentCode[]> {
    const used = new Set<string>();
    const entities: StudentCode[] = [];
    for (let i = 0; i < dto.count; i++) {
      const code = await this.generateUniqueCode(used);
      used.add(code);
      entities.push(
        this.codes.create({
          code,
          discountOverride: dto.discountOverride ?? null,
          note: dto.note?.trim() || null,
        }),
      );
    }
    return this.codes.save(entities);
  }

  async update(id: string, dto: UpdateStudentCodeDto): Promise<StudentCode> {
    const row = await this.codes.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Код студента не найден');
    }
    if (dto.studentName !== undefined) {
      row.studentName = dto.studentName.trim() || null;
    }
    if (dto.discountOverride !== undefined) {
      row.discountOverride = dto.discountOverride;
    }
    if (dto.note !== undefined) {
      row.note = dto.note.trim() || null;
    }
    if (dto.active !== undefined) {
      row.active = dto.active;
    }
    return this.codes.save(row);
  }

  async remove(id: string): Promise<void> {
    const result = await this.codes.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Код студента не найден');
    }
  }

  // The storefront's verification step. Increments uses_count/last_used_at on
  // success — this is the "unlock event", called once per Apply click, never
  // on re-renders or price recomputation.
  async validate(input: string): Promise<ValidateCodeResult> {
    const code = input.trim().toUpperCase();
    if (!code) {
      return { ok: false, reason: 'empty' };
    }
    const row = await this.codes.findOne({ where: { code } });
    if (!row) {
      return { ok: false, reason: 'invalid' };
    }
    if (!row.active) {
      return { ok: false, reason: 'disabled' };
    }
    row.usesCount += 1;
    row.lastUsedAt = new Date();
    await this.codes.save(row);
    return {
      ok: true,
      studentName: row.studentName,
      discountOverride: row.discountOverride,
    };
  }

  // Used by ProductsService to price a listing for the code currently applied
  // in the storefront. Not an unlock event — doesn't touch uses_count.
  async findActiveByCode(input: string): Promise<StudentCode | null> {
    const code = input.trim().toUpperCase();
    if (!code) return null;
    const row = await this.codes.findOne({ where: { code } });
    if (!row || !row.active) return null;
    return row;
  }

  // A reservation also counts as a "use" of the code, same as validate().
  // Atomic update — no read-then-write race with a concurrent unlock/reserve.
  async recordUse(id: string): Promise<void> {
    await this.codes
      .createQueryBuilder()
      .update(StudentCode)
      .set({ usesCount: () => '"uses_count" + 1', lastUsedAt: new Date() })
      .where('id = :id', { id })
      .execute();
  }

  // Batched lookup for the admin reservations list, which shows the human
  // -readable code string rather than the FK.
  async findCodeStrings(ids: string[]): Promise<Record<string, string>> {
    if (ids.length === 0) return {};
    const rows = await this.codes.find({ where: { id: In(ids) } });
    const map: Record<string, string> = {};
    for (const row of rows) map[row.id] = row.code;
    return map;
  }

  async exportCsv(): Promise<string> {
    const rows = await this.findAll();
    const header = [
      'код',
      'имя_студента',
      'персональная_скидка',
      'статус',
      'использований',
      'последнее_использование',
      'комментарий',
    ];
    const lines = rows.map((r) =>
      [
        r.code,
        r.studentName ?? '',
        r.discountOverride != null ? String(r.discountOverride) : '',
        r.active ? 'активен' : 'отключён',
        String(r.usesCount),
        r.lastUsedAt ? r.lastUsedAt.toISOString() : '',
        r.note ?? '',
      ]
        .map(csvEscape)
        .join(','),
    );
    return [header.join(','), ...lines].join('\n');
  }
}
