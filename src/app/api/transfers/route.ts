import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { transferSchema } from "@/lib/validations/transfer";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fromWarehouseId = searchParams.get("fromWarehouseId");
    const toWarehouseId = searchParams.get("toWarehouseId");
    const search = searchParams.get("search");

    const where: any = {
      userId: session.user?.id,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    if (fromWarehouseId && fromWarehouseId !== "all") {
      where.fromWarehouseId = fromWarehouseId;
    }

    if (toWarehouseId && toWarehouseId !== "all") {
      where.toWarehouseId = toWarehouseId;
    }

    if (search) {
      where.OR = [
        { transferNumber: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        fromWarehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to include computed fields
    const transfersWithCounts = transfers.map((transfer) => ({
      ...transfer,
      itemsCount: transfer.items.length,
      totalQuantity: transfer.items.reduce((sum, item) => sum + item.quantity, 0),
    }));

    return NextResponse.json(transfersWithCounts);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
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
    const validatedData = transferSchema.parse(body);

    // Check if warehouses exist
    const [fromWarehouse, toWarehouse] = await Promise.all([
      prisma.warehouse.findUnique({
        where: { id: validatedData.fromWarehouseId },
      }),
      prisma.warehouse.findUnique({
        where: { id: validatedData.toWarehouseId },
      }),
    ]);

    if (!fromWarehouse) {
      return NextResponse.json(
        { error: "Source warehouse not found" },
        { status: 404 }
      );
    }

    if (!toWarehouse) {
      return NextResponse.json(
        { error: "Destination warehouse not found" },
        { status: 404 }
      );
    }

    // Validate products exist and have sufficient stock in source warehouse
    const stockErrors: string[] = [];
    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        stockErrors.push(`Product with ID ${item.productId} not found`);
        continue;
      }

      // Check if product is in the source warehouse
      if (product.warehouseId !== validatedData.fromWarehouseId) {
        stockErrors.push(
          `Product ${product.sku} is not in the source warehouse`
        );
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
        {
          error: "Stock validation failed",
          details: stockErrors,
        },
        { status: 400 }
      );
    }

    // Generate unique transfer number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const transferNumber = `TRF-${timestamp}-${random}`;

    // Create transfer
    const transfer = await prisma.transfer.create({
      data: {
        transferNumber,
        fromWarehouseId: validatedData.fromWarehouseId,
        toWarehouseId: validatedData.toWarehouseId,
        notes: validatedData.notes,
        status: "DRAFT",
        userId: session.user.id,
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        fromWarehouse: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        toWarehouse: {
          select: {
            id: true,
            name: true,
            location: true,
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
                warehouseId: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transfer:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
