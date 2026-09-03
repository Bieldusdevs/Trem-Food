import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, COOKIE_NAME } from "@/lib/customer";

export const dynamic = "force-dynamic";

const DELIVERY_FEE = 900; // R$ 9,00 em centavos
const STAMPS_PER_REWARD = 5;

const createSchema = z.object({
  address: z.string().min(5).max(500),
  notes: z.string().max(500).optional(),
});

export async function GET() {
  const { customer, token } = await getOrCreateCustomer();
  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  const res = NextResponse.json({ orders });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 90 });
  return res;
}

export async function POST(req: Request) {
  const { customer, token } = await getOrCreateCustomer();
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { customerId: customer.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + DELIVERY_FEE;

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        customerId: customer.id,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        address: parsed.data.address,
        notes: parsed.data.notes,
        status: "CONFIRMED",
        items: {
          create: cartItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.product.price,
            notes: i.notes,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // limpa o carrinho
    await tx.cartItem.deleteMany({ where: { customerId: customer.id } });

    // 1 carimbo de fidelidade por pedido confirmado
    const loyalty = await tx.loyaltyAccount.upsert({
      where: { customerId: customer.id },
      update: {},
      create: { customerId: customer.id },
    });

    const newStamps = loyalty.stamps + 1;
    const justCompletedCycle = newStamps % STAMPS_PER_REWARD === 0;

    await tx.loyaltyAccount.update({
      where: { customerId: customer.id },
      data: {
        stamps: newStamps,
        freeRewards: justCompletedCycle ? { increment: 1 } : undefined,
        history: { create: { type: "STAMP", orderId: createdOrder.id } },
      },
    });

    return createdOrder;
  });

  const res = NextResponse.json({ order });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 90 });
  return res;
}
