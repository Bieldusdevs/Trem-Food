import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, COOKIE_NAME } from "@/lib/customer";

export const dynamic = "force-dynamic";

const DELIVERY_FEE = 900; // R$ 9,00 em centavos
const FREE_DELIVERY_MIN = 5000; // entrega grátis acima de R$ 50,00
const STAMPS_PER_REWARD = 5;

const createSchema = z.object({
  address: z.string().min(5).max(500),
  notes: z.string().max(500).optional(),
});

function withCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return res;
}

export async function GET() {
  try {
    const { customer, token } = await getOrCreateCustomer();
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return withCookie(NextResponse.json({ orders }), token);
  } catch (err) {
    console.error("GET /api/orders", err);
    return NextResponse.json(
      { error: "Não foi possível carregar seus pedidos." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { customer, token } = await getOrCreateCustomer();
    const body = await req.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return withCookie(
        NextResponse.json(
          { error: "Informe um endereço de entrega válido." },
          { status: 400 }
        ),
        token
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { customerId: customer.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return withCookie(
        NextResponse.json({ error: "Sua sacola está vazia." }, { status: 400 }),
        token
      );
    }

    // Valida produtos ativos e estoque antes de criar o pedido
    for (const item of cartItems) {
      if (!item.product.active) {
        return withCookie(
          NextResponse.json(
            { error: `${item.product.name} não está mais disponível.` },
            { status: 409 }
          ),
          token
        );
      }
      if (item.product.stock < item.quantity) {
        return withCookie(
          NextResponse.json(
            {
              error: `Só temos ${item.product.stock} unidade(s) de ${item.product.name}. Ajuste a sacola e tente novamente.`,
            },
            { status: 409 }
          ),
          token
        );
      }
    }

    const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    const order = await prisma.$transaction(async (tx) => {
      // Salva o endereço no cadastro do cliente (persistência real)
      await tx.customer.update({
        where: { id: customer.id },
        data: { address: parsed.data.address },
      });

      const createdOrder = await tx.order.create({
        data: {
          customerId: customer.id,
          subtotal,
          deliveryFee,
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

      // Baixa estoque de verdade
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Limpa o carrinho
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

    return withCookie(NextResponse.json({ order }), token);
  } catch (err) {
    console.error("POST /api/orders", err);
    return NextResponse.json(
      { error: "Não foi possível finalizar o pedido. Tente novamente." },
      { status: 500 }
    );
  }
}
