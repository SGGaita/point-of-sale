const path = require("node:path");
const { config } = require("dotenv");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

config({ path: path.join(__dirname, "..", ".env") });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL or DIRECT_URL is required. Set it in web/.env before seeding."
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  const adminEmail = "admin@restaurant.com";
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "System Administrator",
      email: adminEmail,
      password: passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`Upserted admin user: ${admin.email} (password: ${adminPassword})`);

  // Create sample products (skip if SKU already exists)
  const productData = [
    {
      name: "Coffee - Espresso",
      description: "Premium espresso coffee",
      sku: "COFFEE-ESP-001",
      price: 3.5,
      cost: 1.2,
      stock: 100,
      category: "Beverages",
    },
    {
      name: "Sandwich - Club",
      description: "Classic club sandwich",
      sku: "FOOD-SAND-001",
      price: 8.99,
      cost: 4.5,
      stock: 50,
      category: "Food",
    },
    {
      name: "Pastry - Croissant",
      description: "Butter croissant",
      sku: "PASTRY-CRO-001",
      price: 4.5,
      cost: 2.0,
      stock: 75,
      category: "Pastries",
    },
  ];

  const products = [];
  for (const data of productData) {
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: data,
    });
    products.push(product);
  }

  console.log(`Upserted ${products.length} products`);

  const customer = await prisma.customer.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St, City, State 12345",
    },
  });

  console.log(`Upserted sample customer: ${customer.name}`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
