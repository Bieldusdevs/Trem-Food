"use client";

import { useEffect, useMemo, useState } from "react";
import { AppProvider, Product } from "@/components/AppContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductCard from "@/components/ProductCard";
import LoyaltyCard from "@/components/LoyaltyCard";
import BottomNav from "@/components/BottomNav";
import CartDrawer from "@/components/CartDrawer";

type Category = { id: string; name: string; slug: string; icon: string | null; _count?: { products: number } };

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = activeCategory ? `/api/products?category=${activeCategory}` : "/api/products";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setCategories(data.categories ?? []);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const featured = useMemo(() => products.find((p) => p.featured) ?? products[0] ?? null, [products]);
  const rest = useMemo(() => products.filter((p) => p.id !== featured?.id), [products, featured]);

  return (
    <>
      <Header />
      <main className="pt-20 px-edge-margin-mobile space-y-space-2xl max-w-lg mx-auto">
        <Hero product={featured} />

        <CategoryCarousel categories={categories} active={activeCategory} onSelect={setActiveCategory} />

        <section className="space-y-space-md">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-widest font-bold">
                Laboratório do Chef
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">
                Destaques da Semana
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container border border-outline-variant/30 text-outline">
              {rest.length} Itens
            </span>
          </div>

          <div className="grid grid-cols-1 gap-space-lg">
            {loading &&
              Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}
            {!loading && rest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            {!loading && rest.length === 0 && (
              <p className="text-outline text-body-md text-center py-6">Nenhum item nesta coleção ainda.</p>
            )}
          </div>
        </section>

        <LoyaltyCard />
      </main>
      <BottomNav />
      <CartDrawer />
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
