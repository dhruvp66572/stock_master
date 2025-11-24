import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = params.id;

        // Fetch delivery with items and products
        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!delivery) {
            return NextResponse.json(
                { error: "Delivery not found" },
                { status: 404 }
            );
        }

        // Only DRAFT deliveries can be validated
        if (delivery.status !== "DRAFT") {
            return NextResponse.json(
                { error: "Only DRAFT deliveries can be validated" },
                { status: 400 }
            );
        }

        // Check stock availability only for DECREMENT operations
        const stockErrors: string[] = [];
        if (delivery.operationType === "DECREMENT") {
            for (const item of delivery.items) {
                if (item.product.stock < item.quantity) {
                    stockErrors.push(
                        `Insufficient stock for ${item.product.sku}: Available ${item.product.stock}, Requested ${item.quantity}`
                    );
                }
            }

            if (stockErrors.length > 0) {
                return NextResponse.json(
                    {
                        error: "Insufficient stock for delivery validation",
                        details: stockErrors,
                    },
                    { status: 400 }
                );
            }
        }

        // Execute transaction: update delivery, decrease stock, create stock movements
        const updatedDelivery = await prisma.$transaction(
            async (tx) => {
                // 1. Update delivery status to DONE
                const deliveryUpdatePromise = tx.delivery.update({
                    where: { id },
                    data: {
                        status: "DONE",
                        deliveredAt: new Date(),
                    },
                });

                // 2. Update product stock based on operation type (parallel)
                const isIncrement = delivery.operationType === "INCREMENT";
                const stockUpdatePromises = delivery.items.map((item) =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: isIncrement
                                ? { increment: item.quantity }
                                : { decrement: item.quantity },
                        },
                    })
                );

                // 3. Create stock movement records (parallel)
                const stockMovementPromises = delivery.items.map((item) =>
                    tx.stockMovement.create({
                        data: {
                            type: "DELIVERY",
                            quantity: isIncrement ? item.quantity : -item.quantity,
                            referenceId: delivery.id,
                            productId: item.productId,
                            warehouseId: delivery.warehouseId,
                            userId: session.user.id,
                            notes: `Delivery ${delivery.deliveryNumber} validated (${delivery.operationType})`,
                        },
                    })
                );

                // Execute all operations in parallel
                await Promise.all([
                    deliveryUpdatePromise,
                    ...stockUpdatePromises,
                    ...stockMovementPromises,
                ]);

                // Fetch updated delivery with includes
                return tx.delivery.findUnique({
                    where: { id },
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
            },
            {
                maxWait: 10000, // Maximum wait time to start transaction (10 seconds)
                timeout: 15000, // Maximum time for transaction execution (15 seconds)
            }
        );

        return NextResponse.json(updatedDelivery);
    } catch (error) {
        console.error("Error validating delivery:", error);
        return NextResponse.json(
            { error: "Failed to validate delivery" },
            { status: 500 }
        );
    }
}
