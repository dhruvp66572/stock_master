import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
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

        const transfer = await prisma.transfer.findFirst({
            where: {
                id,
                userId: session.user?.id,
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

        if (!transfer) {
            return NextResponse.json(
                { error: "Transfer not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(transfer);
    } catch (error) {
        console.error("Error fetching transfer:", error);
        return NextResponse.json(
            { error: "Failed to fetch transfer" },
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

        if (!status || !["DRAFT", "IN_TRANSIT", "COMPLETED", "CANCELED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
                { status: 400 }
            );
        }

        const transfer = await prisma.transfer.findUnique({
            where: { id },
        });

        if (!transfer) {
            return NextResponse.json(
                { error: "Transfer not found" },
                { status: 404 }
            );
        }

        // Validate status transitions
        if (transfer.status === "COMPLETED" || transfer.status === "CANCELED") {
            return NextResponse.json(
                { error: `Cannot update a ${transfer.status.toLowerCase()} transfer` },
                { status: 400 }
            );
        }

        const updatedTransfer = await prisma.transfer.update({
            where: { id },
            data: { status },
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

        return NextResponse.json(updatedTransfer);
    } catch (error) {
        console.error("Error updating transfer:", error);
        return NextResponse.json(
            { error: "Failed to update transfer" },
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

        const transfer = await prisma.transfer.findFirst({
            where: {
                id,
                userId: session.user?.id,
            },
        });

        if (!transfer) {
            return NextResponse.json(
                { error: "Transfer not found" },
                { status: 404 }
            );
        }

        // Only allow deleting DRAFT transfers
        if (transfer.status !== "DRAFT") {
            return NextResponse.json(
                { error: "Only DRAFT transfers can be deleted" },
                { status: 400 }
            );
        }

        await prisma.transfer.delete({
            where: {
                id,
                userId: session.user.id,
            },
        });

        return NextResponse.json({
            message: "Transfer deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting transfer:", error);
        return NextResponse.json(
            { error: "Failed to delete transfer" },
            { status: 500 }
        );
    }
}
