import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params || {};
    if (!id) {
      return NextResponse.json(
        { error: "Missing receipt id" },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if ((receipt.status as any) === "DONE") {
      return NextResponse.json(
        { error: "Receipt already completed" },
        { status: 400 }
      );
    }

    if (receipt.status === "CANCELED") {
      return NextResponse.json(
        { error: "Cannot validate canceled receipt" },
        { status: 400 }
      );
    }

    // Two-step flow:
    // - If DRAFT => promote to READY (no stock changes)
    // - If READY => perform transaction to mark DONE, increment stock and create movements
    try {
      if ((receipt.status as any) === "DRAFT") {
        const promoted = await prisma.receipt.update({
          where: { id },
          data: { status: "READY" as any },
          include: {
            items: { include: { product: true } },
            warehouse: true,
            user: { select: { id: true, name: true, email: true } },
          },
        });

        return NextResponse.json(promoted);
      }

      // If READY, run transaction to mark DONE and update stock
      if ((receipt.status as any) === "READY") {
        // prepare stock movement records
        const stockMovements = receipt.items.map((item: any) => ({
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          type: MovementType.RECEIPT,
          quantity: item.quantity,
          referenceId: receipt.id,
          userId: session.user?.id as string,
          notes: `Stock received from receipt ${receipt.receiptNumber}`,
        }));

        const txOperations: any[] = [];

        // 1) update receipt status to DONE
        txOperations.push(
          prisma.receipt.update({
            where: { id },
            data: { status: "DONE" as any, validatedAt: new Date() },
            include: {
              items: { include: { product: true } },
              warehouse: true,
              user: { select: { id: true, name: true, email: true } },
            },
          })
        );

        // 2) increment product stock for each item
        for (const item of receipt.items) {
          txOperations.push(
            prisma.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          );
        }

        // 3) create stock movement records in batch
        if (stockMovements.length > 0) {
          txOperations.push(
            prisma.stockMovement.createMany({ data: stockMovements })
          );
        }

        const results = await prisma.$transaction(txOperations);

        // the first result is the updated receipt
        const updatedReceipt = results[0];

        return NextResponse.json(updatedReceipt);
      }

      return NextResponse.json(
        { error: "Invalid receipt status for this operation" },
        { status: 400 }
      );
    } catch (txError: any) {
      console.error("Transaction error validating receipt:", txError);
      const msg = String(txError?.message || txError);
      if (
        msg.includes("Invalid value for argument `status`") ||
        msg.includes("Expected ReceiptStatus")
      ) {
        return NextResponse.json(
          {
            error:
              "Database enum mismatch for ReceiptStatus. Please run `prisma migrate dev` to update the database enum and regenerate the Prisma client.",
            details: msg,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to validate receipt" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error validating receipt:", error);
    return NextResponse.json(
      { error: "Failed to validate receipt" },
      { status: 500 }
    );
  }
}
