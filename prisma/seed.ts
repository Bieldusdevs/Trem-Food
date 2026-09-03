import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Smash & Fire", slug: "smash-fire", icon: "local_fire_department", order: 1 },
  { name: "Dry Aged", slug: "dry-aged", icon: "award_star", order: 2 },
  { name: "Veggie Vanguard", slug: "veggie-vanguard", icon: "eco", order: 3 },
  { name: "Trufados", slug: "trufados", icon: "diamond", order: 4 },
  { name: "Acompanhamentos", slug: "acompanhamentos", icon: "lunch_dining", order: 5 },
  { name: "Shakes & Drinks", slug: "shakes-drinks", icon: "local_bar", order: 6 },
];

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  price: number; // centavos
  imageUrl: string;
  badge?: string;
  prepTimeMin: number;
  prepTimeMax: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  categorySlug: string;
  stock: number;
};

// Fotos locais em /public/images/products — nunca quebram por link externo.
const PRODUCTS: SeedProduct[] = [
  {
    slug: "o-misterio-da-brasa-pura",
    name: "O Mistério da Brasa Pura",
    description:
      "Pão brioche selado na manteiga de tutano, duplo smash 90g com crosta de ferro fundido, cheddar inglês maturado 18 meses e néctar de bacon flambado no bourbon.",
    price: 5200,
    imageUrl: "/images/products/o-misterio-da-brasa-pura.jpg",
    badge: "Fogo Ancestral",
    prepTimeMin: 25,
    prepTimeMax: 35,
    rating: 4.9,
    ratingCount: 428,
    featured: true,
    categorySlug: "smash-fire",
    stock: 999,
  },
  {
    slug: "smoky-bacon-vanguard",
    name: "Smoky Bacon Vanguard",
    description:
      "Cheddar inglês 12 meses, geleia de bacon rústica com bourbon e cebola crispy ultrafina artesanal.",
    price: 4200,
    imageUrl: "/images/products/smoky-bacon-vanguard.jpg",
    badge: "Defumado 8h",
    prepTimeMin: 20,
    prepTimeMax: 30,
    rating: 4.7,
    ratingCount: 198,
    featured: true,
    categorySlug: "smash-fire",
    stock: 999,
  },
  {
    slug: "dry-aged-brasa-prime",
    name: "Brasa Prime Dry Aged",
    description:
      "Blend 180g dry aged 28 dias, pão brioche tostado na brasa, queijo maturado e manteiga de alecrim. Cortado ao meio para mostrar a parte, é pura torra na boca.",
    price: 5800,
    imageUrl: "/images/products/dry-aged-brasa-prime.jpg",
    badge: "Dry Aged 28d",
    prepTimeMin: 25,
    prepTimeMax: 35,
    rating: 4.9,
    ratingCount: 256,
    featured: false,
    categorySlug: "dry-aged",
    stock: 999,
  },
  {
    slug: "veggie-vanguard-burger",
    name: "Veggie Vanguard",
    description:
      "Burger vegetal grelhado na brasa, abacate, rúcula fresca e queijo vegetal derretido. Mesmo fogo, zero culpa.",
    price: 3800,
    imageUrl: "/images/products/veggie-vanguard-burger.jpg",
    badge: "Plant Based",
    prepTimeMin: 15,
    prepTimeMax: 25,
    rating: 4.6,
    ratingCount: 142,
    featured: false,
    categorySlug: "veggie-vanguard",
    stock: 999,
  },
  {
    slug: "truffle-inferno-burger",
    name: "Truffle Inferno Burger",
    description:
      "Pão brioche tostado na brasa, blend 180g dry aged, maionese de trufas negras e queijo gruyère maçaricado.",
    price: 4800,
    imageUrl: "/images/products/truffle-inferno-burger.jpg",
    badge: "Chef's Choice",
    prepTimeMin: 20,
    prepTimeMax: 30,
    rating: 4.8,
    ratingCount: 312,
    featured: true,
    categorySlug: "trufados",
    stock: 999,
  },
  {
    slug: "trufa-cheddar-fundido",
    name: "Trufa & Cheddar Fundido",
    description:
      "Pão brioche, blend bovino 150g, cheddar inglês em chuva de fundido, aioli de trufa e ervas frescas.",
    price: 4400,
    imageUrl: "/images/products/trufa-cheddar-fundido.jpg",
    badge: "Trufado",
    prepTimeMin: 20,
    prepTimeMax: 30,
    rating: 4.8,
    ratingCount: 221,
    featured: false,
    categorySlug: "trufados",
    stock: 999,
  },
  {
    slug: "batata-braseada-trufada",
    name: "Batata Braseada Trufada",
    description:
      "Batatas crocantes finalizadas em óleo de trufa, parmesão ralado na hora, cebolinha fresca e lascas de trufa negra.",
    price: 2400,
    imageUrl: "/images/products/batata-braseada-trufada.jpg",
    badge: "Compartilhe",
    prepTimeMin: 12,
    prepTimeMax: 18,
    rating: 4.8,
    ratingCount: 187,
    featured: false,
    categorySlug: "acompanhamentos",
    stock: 999,
  },
  {
    slug: "cebolas-vulcanicas",
    name: "Cebolas Vulcânicas",
    description:
      "Anéis de cebola extra crocantes com páprica defumada e molho picante da casa para mergulhar sem medo.",
    price: 2200,
    imageUrl: "/images/products/cebolas-vulcanicas.jpg",
    badge: "Crocante",
    prepTimeMin: 12,
    prepTimeMax: 18,
    rating: 4.7,
    ratingCount: 134,
    featured: false,
    categorySlug: "acompanhamentos",
    stock: 999,
  },
  {
    slug: "milkshake-caramelo-flamejado",
    name: "Milkshake Caramelo Flamejado",
    description:
      "Milkshake cremoso de baunilha com caramelo maçaricado na hora, chantilly e crocante de amendoim.",
    price: 2600,
    imageUrl: "/images/products/milkshake-caramelo-flamejado.jpg",
    badge: "Sobremesa",
    prepTimeMin: 8,
    prepTimeMax: 12,
    rating: 4.9,
    ratingCount: 176,
    featured: false,
    categorySlug: "shakes-drinks",
    stock: 999,
  },
  {
    slug: "limonada-defumada",
    name: "Limonada Defumada",
    description:
      "Limão siciliano, alecrim e um toque de fumaça artesanal. Refrescante, inesperada e gelada.",
    price: 1500,
    imageUrl: "/images/products/limonada-defumada.jpg",
    badge: "Craft",
    prepTimeMin: 5,
    prepTimeMax: 10,
    rating: 4.6,
    ratingCount: 98,
    featured: false,
    categorySlug: "shakes-drinks",
    stock: 999,
  },
];

async function main() {
  // 1) Categorias — upsert que também atualiza nome/ícone/ordem
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, order: c.order },
      create: c,
    });
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  // 2) Produtos — upsert que TAMBÉM atualiza tudo (corrige seeds antigos
  //    com fotos quebradas, preços errados ou produtos faltando)
  for (const p of PRODUCTS) {
    const category = categoryBySlug.get(p.categorySlug);
    if (!category) {
      throw new Error(`Categoria não encontrada: ${p.categorySlug}`);
    }
    const data = {
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      badge: p.badge ?? null,
      badgeColor: "amber",
      prepTimeMin: p.prepTimeMin,
      prepTimeMax: p.prepTimeMax,
      rating: p.rating,
      ratingCount: p.ratingCount,
      featured: p.featured,
      active: true,
      stock: p.stock,
      categoryId: category.id,
    };
    await prisma.product.upsert({
      where: { id: p.slug },
      update: data,
      create: { id: p.slug, ...data },
    });
  }

  const [productCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
  ]);

  console.log(
    `Seed concluído: ${productCount} produtos ativos em ${categoryCount} categorias.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
