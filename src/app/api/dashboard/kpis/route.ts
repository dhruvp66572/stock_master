import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const warehouseId = searchParams.get("warehouseId");
        const categoryId = searchParams.get("categoryId");
        const receiptStatus = searchParams.get("receiptStatus");
        const deliveryStatus = searchParams.get("deliveryStatus");

        // Build filter conditions
        const productFilters: any = {};
        if (warehouseId) {
            productFilters.warehouseId = warehouseId;
        }
        if (categoryId) {
            productFilters.categoryId = categoryId;
        }

        const receiptFilters: any = {
            userId: session.user?.id,
        };
        if (receiptStatus && warehouseId) {
            receiptFilters.status = receiptStatus;
            receiptFilters.warehouseId = warehouseId;
        } else if (receiptStatus) {
            receiptFilters.status = receiptStatus;
        } else if (warehouseId) {
            receiptFilters.warehouseId = warehouseId;
        }

        const deliveryFilters: any = {
            userId: session.user?.id,
        };
        if (deliveryStatus && warehouseId) {
            deliveryFilters.status = deliveryStatus;
            deliveryFilters.warehouseId = warehouseId;
        } else if (deliveryStatus) {
            deliveryFilters.status = deliveryStatus;
        } else if (warehouseId) {
            deliveryFilters.warehouseId = warehouseId;
        }

        // Fetch KPIs with Prisma aggregations
        const [
            totalProducts,
            lowStockProducts,
            outOfStockProducts,
            pendingReceipts,
            pendingDeliveries,
            internalTransfers,
        ] = await Promise.all([
            // Total products count
            prisma.product.count({
                where: productFilters,
            }),

            // Low stock items - using raw query to compare two columns
            (async () => {
                let query = `SELECT COUNT(*)::int as count FROM "Product" WHERE "stock" > 0 AND "stock" <= "minStockLevel"`;
                const params: any[] = [];
                let paramIndex = 1;

                if (warehouseId) {
                    query += ` AND "warehouseId" = $${paramIndex}`;
                    params.push(warehouseId);
                    paramIndex++;
                }
                if (categoryId) {
                    query += ` AND "categoryId" = $${paramIndex}`;
                    params.push(categoryId);
                }

                const result = await prisma.$queryRawUnsafe<any[]>(query, ...params);
                return result[0]?.count || 0;
            })(),

            // Out of stock items (stock = 0)
            prisma.product.count({
                where: {
                    ...productFilters,
                    stock: 0,
                },
            }),

            // Pending receipts (DRAFT status)
            prisma.receipt.count({
                where: receiptStatus ? receiptFilters : { status: "DRAFT", userId: session.user?.id },
            }),

            // Pending deliveries (DRAFT status)
            prisma.delivery.count({
                where: deliveryStatus ? deliveryFilters : { status: "DRAFT", userId: session.user?.id },
            }),

            // Internal transfers
            prisma.transfer.count({
                where: {
                    userId: session.user?.id,
                    ...(warehouseId && {
                        OR: [
                            { fromWarehouseId: warehouseId },
                            { toWarehouseId: warehouseId },
                        ],
                    }),
                },
            }),
        ]);

        const kpis = {
            totalProducts,
            lowStockItems: lowStockProducts,
            outOfStockItems: outOfStockProducts,
            pendingReceipts,
            pendingDeliveries,
            internalTransfers,
        };

        return NextResponse.json(kpis);
    } catch (error) {
        console.error("Error fetching dashboard KPIs:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard KPIs" },
            { status: 500 }
        );
    }
}
