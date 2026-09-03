import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Smash & Fire", slug: "smash-fire", icon: "local_fire_department", order: 1 },
    { name: "Dry Aged", slug: "dry-aged", icon: "award_star", order: 2 },
    { name: "Veggie Vanguard", slug: "veggie-vanguard", icon: "eco", order: 3 },
    { name: "Trufados", slug: "trufados", icon: "diamond", order: 4 },
    { name: "Acompanhamentos", slug: "acompanhamentos", icon: "lunch_dining", order: 5 },
    { name: "Shakes & Drinks", slug: "shakes-drinks", icon: "local_bar", order: 6 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const smashFire = await prisma.category.findUnique({ where: { slug: "smash-fire" } });
  const trufados = await prisma.category.findUnique({ where: { slug: "trufados" } });

  const products = [
    {
      name: "O Mistério da Brasa Pura",
      description:
        "Pão brioche selado na manteiga de tutano, duplo smash 90g com crosta de ferro fundido, cheddar inglês maturado 18 meses e néctar de bacon flambado no bourbon.",
      price: 5200,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA6_3iQ1c9jfVkrY9DYZwXtSP5fOaQl1pKJGg4u92WgddJml0BLevZ-ad3JZ9U0vub8s8lVAcK8MJz5GGYME09QVMpCFmukFdx7MyYpMRIObBHzdAkfyvNIqXHqhAN_gtYWk525G7u5NoPpECN_MC8aWAvebGI5GWbLZdr_gmqwR17GwdLloVC_jWOINWf6996uSWGHbJFAbJdKI0xYZsGuJBq4npEx1qiHP3-Ruu7mRmWpScrDNgui",
      badge: "Fogo Ancestral",
      badgeColor: "amber",
      prepTimeMin: 25,
      prepTimeMax: 35,
      rating: 4.9,
      ratingCount: 428,
      featured: true,
      categoryId: smashFire?.id,
    },
    {
      name: "Truffle Inferno Burger",
      description:
        "Pão brioche tostado na brasa, blend 180g dry aged, maionese de trufas negras e queijo gruyère maçaricado.",
      price: 4800,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDO0qEtbbU7NWVUbgNHqhzqA7DFwsrMP4A4LdSbdepYWxvj2ajvOILy6sRMJKaSvpEZDrl-Ae83dEsxC_t--07kAg64oBWKj6oFoErz_zHaMnZJGgF5usTa7GYa-Aylgx9nh5YEoEGsxP_BZq9st-_zM8acD-WjqBEpT39_57_xuodDRPDFXDXbDCzFhVzMXcRpgRtCNp4AKsmU3ouLV7OSji82U85lO9SEMUXj39zY5EkGY-3WIWXa",
      badge: "Chef's Choice",
      badgeColor: "amber",
      prepTimeMin: 20,
      prepTimeMax: 30,
      rating: 4.8,
      ratingCount: 312,
      featured: true,
      categoryId: trufados?.id,
    },
    {
      name: "Smoky Bacon Vanguard",
      description:
        "Cheddar inglês 12 meses, geleia de bacon rústica com bourbon e cebola crispy ultrafina artesanal.",
      price: 4200,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAjiVo2zwTTBI4CMYUTXBF9X3jGBQz8FLQwN5M6qQhFc8ewBp1U2lOhaihFUe3shLuy3ZWfYdpeftC9wMJMsiFlKFKte3luTt1eI9aBrNG1KYOTDCBQiz6dSseq8yDBwisPYiuXT3o_0ByTnTYVeuP_mlj_hNvJl5rl68KdSWX_KJXVLnfQaNnDUtrMyF2yai0trpNN41_XhHtSLjplGGSiG7tIDWFt4B9R6_qSry7svjTocT9nlE1W",
      badge: "Defumado 8h",
      badgeColor: "neutral",
      prepTimeMin: 20,
      prepTimeMax: 30,
      rating: 4.7,
      ratingCount: 198,
      featured: true,
      categoryId: smashFire?.id,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { id: p.name.toLowerCase().replace(/\s+/g, "-"), ...p },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
