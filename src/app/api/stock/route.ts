// app/api/stock/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        const status = searchParams.get("status");

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
                category: {
                    select: {
                        name: true,
                    },
                },
                warehouse: {
                    select: {
                        name: true,
                        location: true,
                    },
                },
            },
            orderBy: [
                { stock: "asc" }, // Show low stock first
                { name: "asc" },
            ],
        });

        // Add stock status to each product
        const stockRecords = products.map((product: any) => {
            let stockStatus: "out" | "low" | "ok";

            if (product.stock === 0) {
                stockStatus = "out";
            } else if (
                product.minStockLevel !== null &&
                product.stock <= product.minStockLevel
            ) {
                stockStatus = "low";
            } else {
                stockStatus = "ok";
            }

            return {
                ...product,
                stockStatus,
            };
        });

        // Filter by status if provided
        const filteredRecords =
            status && status !== "all"
                ? stockRecords.filter((record: any) => record.stockStatus === status)
                : stockRecords;

        return NextResponse.json({ success: true, data: filteredRecords });
    } catch (error: any) {
        console.error("Error fetching stock records:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
