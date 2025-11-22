import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create default user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@stockmaster.com" },
    update: {},
    create: {
      email: "admin@stockmaster.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log(`Created user: ${user.email}`);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: {
        name: "Electronics",
        description: "Electronic devices and accessories",
      },
    }),
    prisma.category.upsert({
      where: { name: "Furniture" },
      update: {},
      create: {
        name: "Furniture",
        description: "Office and home furniture",
      },
    }),
    prisma.category.upsert({
      where: { name: "Stationery" },
      update: {},
      create: {
        name: "Stationery",
        description: "Office supplies and stationery items",
      },
    }),
    prisma.category.upsert({
      where: { name: "Food & Beverages" },
      update: {},
      create: {
        name: "Food & Beverages",
        description: "Food items and beverages",
      },
    }),
    prisma.category.upsert({
      where: { name: "Clothing" },
      update: {},
      create: {
        name: "Clothing",
        description: "Apparel and accessories",
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create Warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { name: "Main Warehouse" },
      update: {},
      create: {
        name: "Main Warehouse",
        shortCode: "WH001",
        location: "New York, NY",
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { name: "West Coast Hub" },
      update: {},
      create: {
        name: "West Coast Hub",
        shortCode: "WH002",
        location: "Los Angeles, CA",
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { name: "Central Distribution" },
      update: {},
      create: {
        name: "Central Distribution",
        shortCode: "WH003",
        location: "Chicago, IL",
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { name: "East Coast Facility" },
      update: {},
      create: {
        name: "East Coast Facility",
        shortCode: "WH004",
        location: "Boston, MA",
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${warehouses.length} warehouses`);

  // Create Locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { shortCode: "LOC001" },
      update: {},
      create: {
        name: "Zone A",
        shortCode: "LOC001",
        warehouseId: warehouses[0].id,
        isActive: true,
      },
    }),
    prisma.location.upsert({
      where: { shortCode: "LOC002" },
      update: {},
      create: {
        name: "Zone B",
        shortCode: "LOC002",
        warehouseId: warehouses[0].id,
        isActive: true,
      },
    }),
    prisma.location.upsert({
      where: { shortCode: "LOC003" },
      update: {},
      create: {
        name: "Storage Room 1",
        shortCode: "LOC003",
        warehouseId: warehouses[1].id,
        isActive: true,
      },
    }),
    prisma.location.upsert({
      where: { shortCode: "LOC004" },
      update: {},
      create: {
        name: "Loading Dock",
        shortCode: "LOC004",
        warehouseId: warehouses[2].id,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${locations.length} locations`);

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "ELEC-001" },
      update: {},
      create: {
        name: "Laptop Dell XPS 13",
        sku: "ELEC-001",
        description: "13-inch laptop with Intel Core i7",
        categoryId: categories[0].id,
        unitOfMeasure: "pcs",
        stock: 50,
        minStockLevel: 10,
        warehouseId: warehouses[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: "FURN-001" },
      update: {},
      create: {
        name: "Office Desk",
        sku: "FURN-001",
        description: "Ergonomic office desk",
        categoryId: categories[1].id,
        unitOfMeasure: "pcs",
        stock: 25,
        minStockLevel: 5,
        warehouseId: warehouses[0].id,
      },
    }),
    prisma.product.upsert({
      where: { sku: "STAT-001" },
      update: {},
      create: {
        name: "A4 Paper Box",
        sku: "STAT-001",
        description: "500 sheets per box",
        categoryId: categories[2].id,
        unitOfMeasure: "box",
        stock: 100,
        minStockLevel: 20,
        warehouseId: warehouses[1].id,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
