import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {};

    if (status && status !== 'All') {
      const upperStatus = status.toUpperCase().replace(/\s+/g, '_');
      if (
        [
          'PLACED',
          'ORDER_PLACED',
          'CONFIRMED',
          'PROCESSING',
          'SHIPPED',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
        ].includes(upperStatus)
      ) {
        // Match both 'PLACED' and 'ORDER_PLACED' for flexibility
        if (upperStatus === 'ORDER_PLACED' || upperStatus === 'PLACED') {
          where.OR = [{ status: 'PLACED' }, { status: 'ORDER_PLACED' }];
        } else {
          where.status = upperStatus;
        }
      }
    }

    if (search) {
      const searchOR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { orderItems: { some: { product: { name: { contains: search, mode: 'insensitive' } } } } },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'highest') orderBy = { totalPrice: 'desc' };
    else if (sort === 'lowest') orderBy = { totalPrice: 'asc' };

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            addresses: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
        returnRequests: true,
      },
      orderBy,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin orders' }, { status: 500 });
  }
}
