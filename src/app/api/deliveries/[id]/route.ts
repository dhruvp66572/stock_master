// app/api/deliveries/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id: params.id },
      include: {
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json({ success: true, data: delivery });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, warehouseId, notes, userId, scheduleDate, deliveryAddress, operationType } = body;

    const delivery = await prisma.delivery.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(warehouseId && { warehouseId }),
        ...(notes !== undefined && { notes }),
        ...(scheduleDate !== undefined && { scheduleDate: scheduleDate ? new Date(scheduleDate) : null }),
        ...(deliveryAddress !== undefined && { deliveryAddress }),
        ...(operationType && { operationType }),
        ...(status === "DONE" && { deliveredAt: new Date() }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });

    // If status changed to DONE, update stock based on operation type
    if (status === "DONE" && userId) {
      for (const item of delivery.items) {
        // Use operationType from updated delivery or from body
        const operation = delivery.operationType || operationType || "DECREMENT";
        const isIncrement = operation === "INCREMENT";

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              [isIncrement ? "increment" : "decrement"]: item.quantity,
            },
          },
        });

        // Create stock movement
        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            warehouseId: delivery.warehouseId,
            type: "DELIVERY",
            quantity: isIncrement ? item.quantity : -item.quantity,
            referenceId: delivery.id,
            userId: userId,
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: delivery });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.delivery.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
