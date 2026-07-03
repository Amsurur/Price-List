import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { StudentCode } from './entities/student-code.entity';
import { Reservation } from './entities/reservation.entity';

// Load the repo-root .env so the standalone seed script uses the same DB as the app.
config({ path: join(process.cwd(), '../../.env') });
config({ path: join(process.cwd(), '.env') });

// A plain DataSource for scripts (seed, future migrations) — the running app
// still configures TypeORM through Nest in app.module.ts.
const url = process.env.DATABASE_URL;

export const dataSource = new DataSource({
  type: 'postgres',
  ...(url
    ? { url }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER ?? 'softclub',
        password: process.env.DB_PASSWORD ?? 'softclub',
        database: process.env.DB_NAME ?? 'softclub_store',
      }),
  entities: [Product, StudentCode, Reservation],
  synchronize: true,
});
