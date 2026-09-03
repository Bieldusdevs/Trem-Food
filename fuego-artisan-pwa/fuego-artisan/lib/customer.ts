import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "./prisma";

const COOKIE_NAME = "fuego_guest_token";

/**
 * Garante que existe um Customer vinculado a um cookie de sessão de convidado.
 * Cria o cookie e o registro no banco na primeira visita.
 */
export async function getOrCreateCustomer() {
  const cookieStore = cookies();
  let token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    token = uuidv4();
  }

  let customer = await prisma.customer.findUnique({
    where: { guestToken: token },
    include: { loyalty: true },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        guestToken: token,
        loyalty: { create: {} },
      },
      include: { loyalty: true },
    });
  }

  return { customer, token };
}

export { COOKIE_NAME };
