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
import ToastHost from "@/components/ToastHost";

type Category = { id: string; name: string; slug: string; icon: string | null; _count?: { products: number } };

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const url = activeCategory ? `/api/products?category=${activeCategory}` : "/api/products";
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");

    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("bad status");
        const data = await r.json();
        setProducts(data.products ?? []);
        setCategories(data.categories ?? []);
        setLoadError("");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Falha ao carregar cardápio", err);
        setProducts([]);
        setLoadError(
          "Não foi possível carregar o cardápio. Rode `npm run db:setup` e verifique se o banco está ativo."
        );
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [activeCategory, reloadKey]);

  const featured = useMemo(() => products.find((p) => p.featured) ?? products[0] ?? null, [products]);
  const rest = useMemo(() => products.filter((p) => p.id !== featured?.id), [products, featured]);

  return (
    <>
      <Header />
      <main className="pt-20 px-edge-margin-mobile space-y-space-2xl max-w-lg mx-auto">
        <Hero product={featured} />

        {loadError && (
          <div className="rounded-2xl border border-error/50 bg-error/10 px-4 py-3 text-error text-body-md flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
            <div className="flex-1">
              <p className="font-bold mb-1">Cardápio indisponível</p>
              <p className="text-label-md opacity-90">{loadError}</p>
            </div>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="shrink-0 px-2 py-1 rounded-lg bg-error/20 text-error text-label-md font-bold"
            >
              Tentar de novo
            </button>
          </div>
        )}

        <CategoryCarousel categories={categories} active={activeCategory} onSelect={setActiveCategory} />

        <section className="space-y-space-md" id="cardapio">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-label-sm text-label-sm text-secondary-container uppercase tracking-widest font-bold">
                Laboratório do Chef
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">
                {activeCategory
                  ? categories.find((c) => c.slug === activeCategory)?.name ?? "Coleção"
                  : "Destaques da Semana"}
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container border border-outline-variant/30 text-outline">
              {loading ? "..." : `${rest.length} Itens`}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-space-lg">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-2xl skeleton" />)}
            {!loading && !loadError && rest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            {!loading && !loadError && rest.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <span className="material-symbols-outlined text-[40px] text-outline">restaurant_menu</span>
                <p className="text-outline text-body-md">Nenhum item nesta coleção ainda.</p>
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-primary text-label-md font-bold underline underline-offset-4"
                >
                  Ver cardápio completo
                </button>
              </div>
            )}
          </div>
        </section>

        <LoyaltyCard />
      </main>
      <BottomNav />
      <CartDrawer />
      <ToastHost />
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
