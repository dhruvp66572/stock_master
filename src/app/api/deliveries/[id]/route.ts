// app/api/deliveries/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    const delivery = await prisma.delivery.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, warehouseId, notes, scheduleDate, deliveryAddress, operationType } = body;

    const { prisma } = await import("@/lib/prisma");

    // First verify ownership
    const existingDelivery = await prisma.delivery.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDelivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    const delivery = await prisma.delivery.update({
      where: {
        id: params.id,
      },
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
    if (status === "DONE") {
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
            userId: session.user.id,
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");

    await prisma.delivery.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
