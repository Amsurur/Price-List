import { dataSource } from '../data-source';

// One-off: copy each product's legacy single image_url into the new images
// array so it can eventually be dropped. Safe to run more than once — only
// touches rows that still have an empty images array. Run: npm run db:backfill-images.

async function run() {
  await dataSource.initialize();
  try {
    const result = await dataSource.query(
      `UPDATE products
       SET images = ARRAY[image_url]
       WHERE image_url IS NOT NULL AND images = '{}'`,
    );
    console.log(`Backfilled images for ${result[1] ?? 0} product(s).`);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
