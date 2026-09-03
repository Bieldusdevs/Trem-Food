import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, COOKIE_NAME } from "@/lib/customer";

export const dynamic = "force-dynamic";

const STAMPS_PER_REWARD = 5;

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

    let loyalty = await prisma.loyaltyAccount.findUnique({
      where: { customerId: customer.id },
      include: { history: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    if (!loyalty) {
      loyalty = await prisma.loyaltyAccount.create({
        data: { customerId: customer.id },
        include: { history: true },
      });
    }

    const stampsInCycle = loyalty.stamps % STAMPS_PER_REWARD;
    const remaining = STAMPS_PER_REWARD - stampsInCycle;

    return withCookie(
      NextResponse.json({
        ...loyalty,
        stampsPerReward: STAMPS_PER_REWARD,
        stampsInCycle,
        remainingForReward: remaining === STAMPS_PER_REWARD ? 0 : remaining,
      }),
      token
    );
  } catch (err) {
    console.error("GET /api/loyalty", err);
    return NextResponse.json(
      { error: "Não foi possível carregar o Clube da Brasa." },
      { status: 500 }
    );
  }
}

// Resgatar recompensa disponível
export async function POST() {
  try {
    const { customer, token } = await getOrCreateCustomer();

    const loyalty = await prisma.loyaltyAccount.findUnique({
      where: { customerId: customer.id },
    });

    if (!loyalty || loyalty.freeRewards < 1) {
      return withCookie(
        NextResponse.json(
          { error: "Nenhuma recompensa disponível para resgatar." },
          { status: 400 }
        ),
        token
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const account = await tx.loyaltyAccount.update({
        where: { customerId: customer.id },
        data: {
          freeRewards: { decrement: 1 },
          history: { create: { type: "REDEEM" } },
        },
      });
      return account;
    });

    return withCookie(
      NextResponse.json({
        loyalty: updated,
        message:
          "Recompensa resgatada! Apresente o código no balcão na próxima visita ou use no próximo pedido.",
      }),
      token
    );
  } catch (err) {
    console.error("POST /api/loyalty", err);
    return NextResponse.json(
      { error: "Não foi possível resgatar a recompensa." },
      { status: 500 }
    );
  }
}
