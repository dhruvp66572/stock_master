// app/api/warehouses/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Lazy-import prisma
    const { prisma } = await import("@/lib/prisma");

    const warehouses = await prisma.warehouse.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: warehouses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, shortCode, location } = await req.json();

    // Lazy-import prisma
    const { prisma } = await import("@/lib/prisma");

    const warehouse = await prisma.warehouse.create({
      data: { name, shortCode, location },
    });

    return NextResponse.json(
      { success: true, data: warehouse },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
