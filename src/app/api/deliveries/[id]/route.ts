import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    const delivery = await prisma.delivery.findUnique({
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

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["DRAFT", "READY", "DONE", "CANCELED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Fetch delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Validate status transitions
    if (delivery.status === "DONE" || delivery.status === "CANCELED") {
      return NextResponse.json(
        { error: "Cannot modify completed or canceled deliveries" },
        { status: 400 }
      );
    }

    // Update delivery status
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: { status },
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

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error("Error updating delivery:", error);
    return NextResponse.json(
      { error: "Failed to update delivery" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Fetch delivery
    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    // Only DRAFT deliveries can be deleted
    if (delivery.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT deliveries can be deleted" },
        { status: 400 }
      );
    }

    // Delete delivery (cascade deletes items)
    await prisma.delivery.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery" },
      { status: 500 }
    );
  }
}
