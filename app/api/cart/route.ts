import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, COOKIE_NAME } from "@/lib/customer";

export const dynamic = "force-dynamic";

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
  const { customer, token } = await getOrCreateCustomer();

  const items = await prisma.cartItem.findMany({
    where: { customerId: customer.id },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return withCookie(NextResponse.json({ items, subtotal }), token);
}

const addSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(20).default(1),
  notes: z.string().max(280).optional(),
});

export async function POST(req: Request) {
  const { customer, token } = await getOrCreateCustomer();
  const body = await req.json();
  const parsed = addSchema.safeParse(body);

  if (!parsed.success) {
    return withCookie(
      NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }),
      token
    );
  }

  const { productId, quantity, notes } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    return withCookie(NextResponse.json({ error: "Produto indisponível" }, { status: 404 }), token);
  }

  const item = await prisma.cartItem.upsert({
    where: { customerId_productId: { customerId: customer.id, productId } },
    update: { quantity: { increment: quantity }, notes },
    create: { customerId: customer.id, productId, quantity, notes },
    include: { product: true },
  });

  return withCookie(NextResponse.json({ item }), token);
}

const updateSchema = z.object({
  cartItemId: z.string(),
  quantity: z.number().int().min(0).max(20),
});

export async function PATCH(req: Request) {
  const { customer, token } = await getOrCreateCustomer();
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return withCookie(
      NextResponse.json({ error: parsed.error.flatten() }, { status: 400 }),
      token
    );
  }

  const { cartItemId, quantity } = parsed.data;

  const existing = await prisma.cartItem.findFirst({
    where: { id: cartItemId, customerId: customer.id },
  });
  if (!existing) {
    return withCookie(NextResponse.json({ error: "Item não encontrado" }, { status: 404 }), token);
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return withCookie(NextResponse.json({ removed: true }), token);
  }

  const item = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { product: true },
  });

  return withCookie(NextResponse.json({ item }), token);
}
