import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      include: { category: true },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    });

    // Contagem apenas de produtos ativos (não lista categoria vazia/desativada)
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { products: { where: { active: true } } } },
      },
    });

    return NextResponse.json({ products, categories });
  } catch (err) {
    console.error("GET /api/products", err);
    return NextResponse.json(
      { error: "Não foi possível carregar o cardápio. Tente novamente." },
      { status: 500 }
    );
  }
}
