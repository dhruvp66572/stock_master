import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch filter options
        const [warehouses, categories] = await Promise.all([
            prisma.warehouse.findMany({
                select: {
                    id: true,
                    name: true,
                    location: true,
                },
                orderBy: {
                    name: "asc",
                },
            }),

            prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                },
                orderBy: {
                    name: "asc",
                },
            }),
        ]);

    // Receipt statuses from Prisma schema
    const receiptStatuses = ["DRAFT", "VALIDATED", "CANCELED"];

    // Delivery statuses from Prisma schema
    const deliveryStatuses = ["DRAFT", "READY", "DONE", "CANCELED"];        const filters = {
            warehouses,
            categories,
            receiptStatuses,
            deliveryStatuses,
        };

        return NextResponse.json(filters);
    } catch (error) {
        console.error("Error fetching dashboard filters:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard filters" },
            { status: 500 }
        );
    }
}
