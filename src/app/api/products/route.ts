// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const warehouseId = searchParams.get("warehouseId");

    const { prisma } = await import("@/lib/prisma");

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
              ],
            }
            : {},
          categoryId ? { categoryId } : {},
          warehouseId ? { warehouseId } : {},
        ],
      },
      include: {
        category: true,
        warehouse: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      sku,
      description,
      categoryId,
      unitOfMeasure,
      stock,
      minStockLevel,
      warehouseId,
    } = body;

    if (!name || !sku || !categoryId || !unitOfMeasure || !warehouseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { prisma } = await import("@/lib/prisma");

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        categoryId,
        unitOfMeasure,
        stock: stock || 0,
        minStockLevel,
        warehouseId,
      },
      include: {
        category: true,
        warehouse: true,
      },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
