import { MigrationInterface, QueryRunner } from 'typeorm';

// The full schema as of the store redesign. Written to be safe on BOTH a
// fresh database and the live one that DB_SYNCHRONIZE built over time: every
// statement is "IF NOT EXISTS", so on the live database it only adds what's
// missing (the redesign's new columns and the shop_settings table) and leaves
// existing tables, columns and data alone. Later schema changes get their own
// migrations: `npm run migration:generate -- src/migrations/<Name>`.
export class Baseline1795791596959 implements MigrationInterface {
  name = 'Baseline1795791596959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "description" text, "category" text, "brand" text, "tags" text array NOT NULL DEFAULT '{}', "price" integer NOT NULL, "sale_percent" integer NOT NULL DEFAULT '0', "audience" text array NOT NULL DEFAULT '{}', "member_discount" integer NOT NULL DEFAULT '15', "stock" integer NOT NULL DEFAULT '0', "image_url" text, "images" text array NOT NULL DEFAULT '{}', "colors" jsonb NOT NULL DEFAULT '[]', "configs" jsonb NOT NULL DEFAULT '[]', "specs" jsonb NOT NULL DEFAULT '[]', "active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "name" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "tags" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "price" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sale_percent" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "audience" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "member_discount" integer NOT NULL DEFAULT '15'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "stock" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "images" text array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "colors" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "configs" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "specs" jsonb NOT NULL DEFAULT '[]'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data" bytea NOT NULL, "mime_type" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "data" bytea NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "mime_type" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "student_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "student_name" text, "extra_discount" integer, "active" boolean NOT NULL DEFAULT true, "note" text, "uses_count" integer NOT NULL DEFAULT '0', "last_used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_1eafd8852cc5ee148865d6d6b89" UNIQUE ("code"), CONSTRAINT "PK_6d94ad714eedcb4429269e70ead" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "code" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "student_name" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "extra_discount" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "note" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "uses_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "last_used_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_codes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code_id" uuid, "student_name" text, "student_contact" text NOT NULL, "product_id" uuid, "product_name" text NOT NULL, "variant" text, "color" text, "config" text, "unit_price" integer NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "status" text NOT NULL DEFAULT 'new', "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "code_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "student_name" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "student_contact" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "product_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "product_name" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "variant" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "color" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "config" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "unit_price" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "quantity" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'new'`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "note" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "page_views" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" text NOT NULL, "visitor_id" text, "referrer" text, "user_agent" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3b1047277a9c2a8cfd618787671" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "path" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "visitor_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "referrer" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "user_agent" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_views" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "shop_settings" ("id" integer NOT NULL, "address" text, "phone" text, "telegram" text, "hours" text, "hold_days" integer NOT NULL DEFAULT '3', "map_url" text, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_96c0aa2a327de09ebe0fd54ae5a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "address" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "phone" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "telegram" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "hours" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "hold_days" integer NOT NULL DEFAULT '3'`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "map_url" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_settings" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_db58d558e3874d39209a06bd3c" ON "page_views" ("created_at")`,
    );
  }

  // A baseline can't be undone without dropping every table (and all data),
  // so reverting it is refused on purpose.
  public down(): Promise<void> {
    return Promise.reject(
      new Error('The baseline migration cannot be reverted.'),
    );
  }
}
