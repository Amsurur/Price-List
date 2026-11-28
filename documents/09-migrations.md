# Database migrations

Until the store redesign, the schema was kept up to date by TypeORM's
`DB_SYNCHRONIZE=true`, which rewrites tables to match the entities on every
start. That's convenient in development but risky with real data: a renamed or
removed field can silently drop a column.

The API now has migrations in `apps/api/src/migrations/`.

## The baseline

`*-Baseline.ts` is the full schema as of the redesign. Every statement is
`IF NOT EXISTS`, so it is safe on:

- a **fresh database**: it creates everything;
- the **live database** that synchronize built: it only adds what's missing
  (`products.brand / colors / configs / specs / sale_percent / audience`,
  `reservations.variant / color / config`, and the `shop_settings` table) and
  leaves existing tables, columns and rows alone.

It refuses to be reverted, since undoing it would mean dropping every table.

## Switching production to migrations

1. **Back up the database** (e.g. `pg_dump -Fc "$DATABASE_URL" > backup.dump`).
2. Deploy this version with:
   ```
   DB_SYNCHRONIZE=false
   DB_MIGRATIONS_RUN=true
   ```
   On start the API runs the baseline once and records it in the
   `migrations` table.
3. Check the logs for `Migration Baseline… has been executed successfully`
   and that the storefront loads.

Leaving `DB_SYNCHRONIZE=true` also works for this release (the new columns
have safe defaults), but switching now means future changes are reviewed SQL
instead of automatic.

## Making a change later

1. Edit the entity.
2. Against a local database that's already migrated, run (from `apps/api`):
   ```
   npm run migration:generate -- src/migrations/AddSomething
   ```
3. Read the generated SQL, commit it, deploy. With `DB_MIGRATIONS_RUN=true`
   it applies on start; or run `npm run migration:run` by hand.

Other commands: `npm run migration:show` (what's applied / pending) and
`npm run migration:revert` (undo the last one, never the baseline).
