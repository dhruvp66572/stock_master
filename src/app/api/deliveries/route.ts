// app/api/deliveries/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const deliveries = await prisma.delivery.findMany({
            where: {
                AND: [
                    { userId: session.user.id },
                    status ? { status: status as any } : {},
                    search ? {
                        OR: [
                            { deliveryNumber: { contains: search, mode: 'insensitive' } },
                            { deliveryAddress: { contains: search, mode: 'insensitive' } },
                        ],
                    } : {},
                ],
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
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ success: true, data: deliveries });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { warehouseId, items, notes, userId, scheduleDate, deliveryAddress, operationType } = body;

        if (!warehouseId || !items || items.length === 0 || !operationType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate delivery number
        const count = await prisma.delivery.count();
        const deliveryNumber = `DEL${String(count + 1).padStart(6, '0')}`;

        const delivery = await prisma.delivery.create({
            data: {
                deliveryNumber,
                warehouseId,
                status: 'DRAFT',
                notes,
                userId,
                scheduleDate: scheduleDate ? new Date(scheduleDate) : null,
                deliveryAddress,
                operationType,
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
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

        return NextResponse.json({ success: true, data: delivery }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}