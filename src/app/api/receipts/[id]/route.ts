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

        const receipt = await prisma.receipt.findFirst({
            where: {
                id: params.id,
                userId: session.user?.id,
            },
            include: {
                warehouse: {
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
                                unitOfMeasure: true,
                            },
                        },
                    },
                },
            },
        });

        if (!receipt) {
            return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
        }

        return NextResponse.json(receipt);
    } catch (error) {
        console.error("Error fetching receipt:", error);
        return NextResponse.json(
            { error: "Failed to fetch receipt" },
            { status: 500 }
        );
    }
}
