import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethod, shippingAddress } = await req.json();

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }

    // Fetch user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const totalPrice = Math.round(subtotal * 1.18); // Including GST 18%

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const estDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: session.user.id,
        status: 'PLACED',
        totalPrice,
        estDeliveryDate,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            color: 'Standard',
            price: item.product.price,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear cart after checkout
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        order,
        paymentMethod,
        paymentStatus: 'SUCCESS',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process checkout and payment' }, { status: 500 });
  }
}
