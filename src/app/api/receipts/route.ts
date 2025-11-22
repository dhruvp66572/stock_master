import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import {
  createReceiptSchema,
  getReceiptsQuerySchema,
} from "@/lib/validations/receipt";

// POST - create a new receipt (DRAFT)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = createReceiptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { supplierName, warehouseId, notes, items } = validation.data;

    // Generate receipt number
    const random4 = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${Date.now()}-${random4}`;

    const created = await prisma.receipt.create({
      data: {
        receiptNumber,
        supplierName,
        warehouseId,
        notes,
        userId: session.user?.id as string,
        status: "DRAFT",
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        warehouse: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}

// GET - list receipts with optional filters and pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const warehouseId = searchParams.get("warehouseId") ?? undefined;
    const pageRaw = searchParams.get("page");
    const limitRaw = searchParams.get("limit");

    const parsed = getReceiptsQuerySchema.safeParse({
      status,
      warehouseId,
      page: pageRaw,
      limit: limitRaw,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (parsed.data.status) where.status = parsed.data.status;
    if (parsed.data.warehouseId) where.warehouseId = parsed.data.warehouseId;

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { items: true } },
          warehouse: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.receipt.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      receipts,
      pagination: { total, page, limit, totalPages },
    });
  } catch (error) {
    console.error("Error listing receipts:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
      { status: 500 }
    );
  }
}
