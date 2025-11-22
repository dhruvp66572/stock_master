import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

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
        location: "New York, NY",
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { name: "West Coast Hub" },
      update: {},
      create: {
        name: "West Coast Hub",
        location: "Los Angeles, CA",
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { name: "Central Distribution" },
      update: {},
      create: {
        name: "Central Distribution",
        location: "Chicago, IL",
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { name: "East Coast Facility" },
      update: {},
      create: {
        name: "East Coast Facility",
        location: "Boston, MA",
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${warehouses.length} warehouses`);

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
