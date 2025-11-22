// app/api/locations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const locations = await prisma.location.findMany({
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, shortCode, warehouseId } = await req.json();
    
    const location = await prisma.location.create({
      data: { name, shortCode, warehouseId },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({ success: true, data: location }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}