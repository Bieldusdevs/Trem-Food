import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Diagnóstico rápido: confirma que o banco está acessível e populado.
export async function GET() {
  try {
    const [productCount, activeProducts, categoryCount, customerCount, orderCount] =
      await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.category.count(),
        prisma.customer.count(),
        prisma.order.count(),
      ]);

    return NextResponse.json({
      ok: true,
      database: "connected",
      products: productCount,
      activeProducts,
      categories: categoryCount,
      customers: customerCount,
      orders: orderCount,
    });
  } catch (err) {
    console.error("GET /api/health", err);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error:
          "Banco de dados indisponível. Verifique DATABASE_URL e rode `npm run db:setup` (local) ou `npm run db:setup:pg` (produção).",
      },
      { status: 500 }
    );
  }
}
