// app/api/deliveries/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const deliveries = await prisma.delivery.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          search ? {
            OR: [
              { deliveryNumber: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
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
    const { customerName, warehouseId, items, notes, userId } = body;

    if (!customerName || !warehouseId || !items || items.length === 0) {
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
        customerName,
        warehouseId,
        status: 'DRAFT',
        notes,
        userId,
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