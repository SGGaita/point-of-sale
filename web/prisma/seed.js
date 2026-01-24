const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Coffee - Espresso',
        description: 'Premium espresso coffee',
        sku: 'COFFEE-ESP-001',
        price: 3.50,
        cost: 1.20,
        stock: 100,
        category: 'Beverages',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Sandwich - Club',
        description: 'Classic club sandwich',
        sku: 'FOOD-SAND-001',
        price: 8.99,
        cost: 4.50,
        stock: 50,
        category: 'Food',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pastry - Croissant',
        description: 'Butter croissant',
        sku: 'PASTRY-CRO-001',
        price: 4.50,
        cost: 2.00,
        stock: 75,
        category: 'Pastries',
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create sample customer
  const customer = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
    },
  });

  console.log('Created sample customer');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
