import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { deliverySchema } from "@/lib/validations/delivery";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const warehouseId = searchParams.get("warehouseId");
        const search = searchParams.get("search");

        // Build where clause
        const where: any = {};

        if (status && status !== "all") {
            where.status = status;
        }

        if (warehouseId && warehouseId !== "all") {
            where.warehouseId = warehouseId;
        }

        if (search) {
            where.OR = [
                {
                    deliveryNumber: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    customerName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        // Query deliveries
        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                stock: true,
                                unitOfMeasure: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Add computed fields
        const deliveriesWithComputed = deliveries.map((delivery) => ({
            ...delivery,
            itemsCount: delivery.items.length,
            totalQuantity: delivery.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            ),
        }));

        return NextResponse.json(deliveriesWithComputed);
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        return NextResponse.json(
            { error: "Failed to fetch deliveries" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Validate request body
        const validation = deliverySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.errors },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Verify warehouse exists
        const warehouse = await prisma.warehouse.findUnique({
            where: { id: data.warehouseId },
        });

        if (!warehouse) {
            return NextResponse.json(
                { error: "Warehouse not found" },
                { status: 404 }
            );
        }

        // Verify all products exist and have sufficient stock
        const stockErrors: string[] = [];
        for (const item of data.items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                stockErrors.push(`Product not found`);
                continue;
            }

            if (product.stock < item.quantity) {
                stockErrors.push(
                    `Insufficient stock for ${product.sku}: Available ${product.stock}, Requested ${item.quantity}`
                );
            }
        }

        if (stockErrors.length > 0) {
            return NextResponse.json(
                { error: "Stock validation failed", details: stockErrors },
                { status: 400 }
            );
        }

        // Generate unique delivery number
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
        const deliveryNumber = `DEL-${Date.now()}-${randomString}`;

        // Create delivery with items in transaction
        const delivery = await prisma.delivery.create({
            data: {
                deliveryNumber,
                customerName: data.customerName,
                customerId: data.customerId || null,
                warehouseId: data.warehouseId,
                status: "DRAFT",
                notes: data.notes || null,
                userId: session.user.id,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                warehouse: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                sku: true,
                                stock: true,
                                unitOfMeasure: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(delivery, { status: 201 });
    } catch (error) {
        console.error("Error creating delivery:", error);
        return NextResponse.json(
            { error: "Failed to create delivery" },
            { status: 500 }
        );
    }
}
