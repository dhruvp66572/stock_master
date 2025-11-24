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

    // Fetch transfer with items and products
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    // Only DRAFT or IN_TRANSIT transfers can be completed
    if (transfer.status !== "DRAFT" && transfer.status !== "IN_TRANSIT") {
      return NextResponse.json(
        { error: "Only DRAFT or IN_TRANSIT transfers can be completed" },
        { status: 400 }
      );
    }

    // Check stock availability for all items in source warehouse
    const stockErrors: string[] = [];
    for (const item of transfer.items) {
      if (item.product.warehouseId !== transfer.fromWarehouseId) {
        stockErrors.push(
          `Product ${item.product.sku} is not in the source warehouse`
        );
        continue;
      }

      if (item.product.stock < item.quantity) {
        stockErrors.push(
          `Insufficient stock for ${item.product.sku}: Available ${item.product.stock}, Requested ${item.quantity}`
        );
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Insufficient stock for transfer completion",
          details: stockErrors,
        },
        { status: 400 }
      );
    }

    // Execute transaction: update transfer, move stock, create stock movements
    const updatedTransfer = await prisma.$transaction(
      async (tx) => {
        // 1. Update transfer status to COMPLETED
        const transferUpdatePromise = tx.transfer.update({
          where: { id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });

        // 2. Update product stock and warehouse (decrease from source)
        const stockUpdatePromises = transfer.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        );

        // 3. Create stock movement records for source warehouse (negative)
        const sourceMovementPromises = transfer.items.map((item) =>
          tx.stockMovement.create({
            data: {
              type: "TRANSFER",
              quantity: -item.quantity,
              referenceId: transfer.id,
              productId: item.productId,
              warehouseId: transfer.fromWarehouseId,
              userId: session.user.id,
              notes: `Transfer ${transfer.transferNumber} - Out to ${transfer.toWarehouseId}`,
            },
          })
        );

        // 4. Check if products exist in destination warehouse and update/create
        const destinationUpdatePromises = transfer.items.map(async (item) => {
          // Check if product already exists in destination warehouse
          const existingProduct = await tx.product.findFirst({
            where: {
              sku: item.product.sku,
              warehouseId: transfer.toWarehouseId,
            },
          });

          if (existingProduct) {
            // Update existing product stock
            await tx.product.update({
              where: { id: existingProduct.id },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });

            // Create stock movement for destination warehouse
            return tx.stockMovement.create({
              data: {
                type: "TRANSFER",
                quantity: item.quantity,
                referenceId: transfer.id,
                productId: existingProduct.id,
                warehouseId: transfer.toWarehouseId,
                userId: session.user.id,
                notes: `Transfer ${transfer.transferNumber} - In from ${transfer.fromWarehouseId}`,
              },
            });
          } else {
            // Find unique SKU for destination warehouse
            let newSku = item.product.sku;
            let suffix = 1;
            while (await tx.product.findFirst({ where: { sku: newSku, warehouseId: transfer.toWarehouseId } })) {
              newSku = `${item.product.sku}-W${suffix}`;
              suffix++;
            }

            // Create new product in destination warehouse
            const newProduct = await tx.product.create({
              data: {
                name: item.product.name,
                sku: newSku,
                description: item.product.description,
                categoryId: item.product.categoryId,
                unitOfMeasure: item.product.unitOfMeasure,
                stock: item.quantity,
                minStockLevel: item.product.minStockLevel,
                warehouseId: transfer.toWarehouseId,
              },
            });

            // Create stock movement for new product
            return tx.stockMovement.create({
              data: {
                type: "TRANSFER",
                quantity: item.quantity,
                referenceId: transfer.id,
                productId: newProduct.id,
                warehouseId: transfer.toWarehouseId,
                userId: session.user.id,
                notes: `Transfer ${transfer.transferNumber} - In from ${transfer.fromWarehouseId} (new product)`,
              },
            });
          }
        });

        // Execute all operations in parallel
        await Promise.all([
          transferUpdatePromise,
          ...stockUpdatePromises,
          ...sourceMovementPromises,
          ...destinationUpdatePromises,
        ]);

        // Fetch updated transfer with includes
        return tx.transfer.findUnique({
          where: { id },
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
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    return NextResponse.json(updatedTransfer);
  } catch (error) {
    console.error("Error completing transfer:", error);
    return NextResponse.json(
      { error: "Failed to complete transfer" },
      { status: 500 }
    );
  }
}
