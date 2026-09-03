import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateCustomer, COOKIE_NAME } from "@/lib/customer";

export const dynamic = "force-dynamic";

const STAMPS_PER_REWARD = 5;

export async function GET() {
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

  const res = NextResponse.json({
    ...loyalty,
    stampsPerReward: STAMPS_PER_REWARD,
    stampsInCycle,
    remainingForReward: remaining === STAMPS_PER_REWARD ? 0 : remaining,
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return res;
}

// Resgatar recompensa disponível
export async function POST() {
  const { customer } = await getOrCreateCustomer();

  const loyalty = await prisma.loyaltyAccount.findUnique({
    where: { customerId: customer.id },
  });

  if (!loyalty || loyalty.freeRewards < 1) {
    return NextResponse.json({ error: "Nenhuma recompensa disponível" }, { status: 400 });
  }

  const updated = await prisma.loyaltyAccount.update({
    where: { customerId: customer.id },
    data: {
      freeRewards: { decrement: 1 },
      history: { create: { type: "REDEEM" } },
    },
  });

  return NextResponse.json({ loyalty: updated });
}
