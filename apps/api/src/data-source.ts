import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { StudentCode } from './entities/student-code.entity';
import { Reservation } from './entities/reservation.entity';
import { PageView } from './entities/page-view.entity';
import { ShopSettings } from './entities/shop-settings.entity';

// Load the repo-root .env so the standalone seed script uses the same DB as the app.
config({ path: join(process.cwd(), '../../.env') });
config({ path: join(process.cwd(), '.env') });

// A plain DataSource for scripts (seed, migrations CLI) — the running app
// still configures TypeORM through Nest in app.module.ts. The TypeORM
// CLI loads it with `-d src/data-source.ts` (it must stay the only export).
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
  entities: [
    Product,
    ProductImage,
    StudentCode,
    Reservation,
    PageView,
    ShopSettings,
  ],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  // Follows the same switch as the app, so the seed script can still create
  // tables on a fresh dev database, and never alters a migrated one.
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
