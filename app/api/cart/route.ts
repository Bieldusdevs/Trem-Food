import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, COOKIE_NAME } from "@/lib/customer";

export const dynamic = "force-dynamic";

const DELIVERY_FEE = 900; // R$ 9,00 em centavos
const FREE_DELIVERY_MIN = 5000; // entrega grátis acima de R$ 50,00

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

function error(res: string, token: string, status = 400) {
  return withCookie(NextResponse.json({ error: res }, { status }), token);
}

export async function GET() {
  try {
    const { customer, token } = await getOrCreateCustomer();

    const items = await prisma.cartItem.findMany({
      where: { customerId: customer.id },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;

    return withCookie(
      NextResponse.json({ items, subtotal, deliveryFee, total: subtotal + deliveryFee }),
      token
    );
  } catch (err) {
    console.error("GET /api/cart", err);
    return NextResponse.json(
      { error: "Não foi possível carregar a sacola." },
      { status: 500 }
    );
  }
}

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
  notes: z.string().max(280).optional(),
});

export async function POST(req: Request) {
  try {
    const { customer, token } = await getOrCreateCustomer();
    const body = await req.json().catch(() => ({}));
    const parsed = addSchema.safeParse(body);

    if (!parsed.success) {
      return error("Dados inválidos para adicionar ao carrinho.", token);
    }

    const { productId, quantity, notes } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) {
      return error("Produto indisponível no momento.", token, 404);
    }
    if (product.stock <= 0) {
      return error(`${product.name} está esgotado no momento.`, token, 409);
    }

    const existing = await prisma.cartItem.findUnique({
      where: { customerId_productId: { customerId: customer.id, productId } },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) {
      return error(
        `Só temos ${product.stock} unidade(s) de ${product.name} em estoque.`,
        token,
        409
      );
    }

    const item = await prisma.cartItem.upsert({
      where: { customerId_productId: { customerId: customer.id, productId } },
      update: { quantity: newQuantity, notes },
      create: { customerId: customer.id, productId, quantity, notes },
      include: { product: true },
    });

    return withCookie(NextResponse.json({ item }), token);
  } catch (err) {
    console.error("POST /api/cart", err);
    return NextResponse.json(
      { error: "Não foi possível adicionar o item. Tente novamente." },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().int().min(0).max(20),
});

export async function PATCH(req: Request) {
  try {
    const { customer, token } = await getOrCreateCustomer();
    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return error("Dados inválidos para atualizar o carrinho.", token);
    }

    const { cartItemId, quantity } = parsed.data;

    const existing = await prisma.cartItem.findFirst({
      where: { id: cartItemId, customerId: customer.id },
      include: { product: true },
    });
    if (!existing) {
      return error("Item não encontrado na sacola.", token, 404);
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return withCookie(NextResponse.json({ removed: true }), token);
    }

    if (existing.product.stock <= 0 || quantity > existing.product.stock) {
      return error(
        `Só temos ${existing.product.stock} unidade(s) de ${existing.product.name} em estoque.`,
        token,
        409
      );
    }

    const item = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true },
    });

    return withCookie(NextResponse.json({ item }), token);
  } catch (err) {
    console.error("PATCH /api/cart", err);
    return NextResponse.json(
      { error: "Não foi possível atualizar a sacola." },
      { status: 500 }
    );
  }
}
