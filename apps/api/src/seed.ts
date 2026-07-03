import { dataSource } from './data-source';
import { Product } from './entities/product.entity';
import { StudentCode } from './entities/student-code.entity';

// Sample catalogue + example codes so development screens aren't empty.
// Idempotent: clears products and student_codes, then re-inserts. Run: npm run db:seed.

const products: Partial<Product>[] = [
  {
    name: 'Design Laptop — Core i7',
    description: '15" laptop tuned for design work: fast CPU, crisp display.',
    category: 'Laptops',
    tags: ['laptop', 'design', 'i7'],
    price: 1200,
    memberDiscount: 15,
    stock: 6,
  },
  {
    name: 'Student Laptop — Core i5',
    description: 'Reliable everyday laptop for coursework and browsing.',
    category: 'Laptops',
    tags: ['laptop', 'student', 'i5'],
    price: 750,
    memberDiscount: 15,
    stock: 2,
  },
  {
    name: 'Creator Desktop PC',
    description: 'Tower PC with a dedicated GPU for 3D and video.',
    category: 'Desktops',
    tags: ['desktop', 'pc', 'gpu'],
    price: 1500,
    memberDiscount: 20,
    stock: 3,
  },
  {
    name: '27" 4K Monitor',
    description: 'Colour-accurate 4K panel, great for a second screen.',
    category: 'Monitors',
    tags: ['monitor', '4k', 'display'],
    price: 420,
    memberDiscount: 10,
    stock: 10,
  },
  {
    name: 'Colour Laser Printer',
    description: 'Fast colour laser printer for a small studio.',
    category: 'Printers',
    tags: ['printer', 'laser', 'colour'],
    price: 320,
    memberDiscount: 12,
    stock: 0,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Compact mechanical keyboard, tactile switches.',
    category: 'Accessories',
    tags: ['keyboard', 'accessory'],
    price: 90,
    memberDiscount: 15,
    stock: 25,
  },
];

const codes: Partial<StudentCode>[] = [
  { code: 'SOFT-7K2Q', studentName: 'Standard student', note: 'Uses each product’s standard discount.' },
  { code: 'SOFT-VIP1', studentName: 'Ali (top student)', discountOverride: 25, note: '25% on everything.' },
  { code: 'SOFT-OFF0', studentName: 'Disabled example', active: false, note: 'Toggled off to test rejection.' },
];

async function run() {
  await dataSource.initialize();
  try {
    const productRepo = dataSource.getRepository(Product);
    const codeRepo = dataSource.getRepository(StudentCode);

    // Clear so re-seeding stays clean (reservations reference these; none in dev yet).
    await dataSource.query(
      'TRUNCATE TABLE reservations, student_codes, products RESTART IDENTITY CASCADE',
    );

    await productRepo.save(productRepo.create(products));
    await codeRepo.save(codeRepo.create(codes));

    // eslint-disable-next-line no-console
    console.log(`Seeded ${products.length} products and ${codes.length} codes.`);
  } finally {
    await dataSource.destroy();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
