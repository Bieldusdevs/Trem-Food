"use client";

import { useEffect, useRef } from "react";

type Category = { id: string; name: string; slug: string; icon: string | null; _count?: { products: number } };

export default function CategoryCarousel({
  categories,
  active,
  onSelect,
}: {
  categories: Category[];
  active: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Mantém a categoria ativa visível no carrossel
  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  if (categories.length === 0) return null;

  return (
    <section className="space-y-space-sm">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">
            Curadoria de Safra
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">
            Coleções Sazonais
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar -mx-edge-margin-mobile px-edge-margin-mobile py-2">
        <button
          onClick={() => onSelect(null)}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-headline-md text-title-sm font-bold transition-all active:scale-95 ${
            active === null
              ? "bg-on-surface text-surface-container-lowest shadow-md"
              : "glass-panel text-outline hover:text-on-surface border border-white/10"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              active === null ? "text-primary-container material-symbols-fill" : ""
            }`}
          >
            restaurant
          </span>
          Todos
        </button>
        {categories.map((cat) => {
          const isActive = active === cat.slug;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSelect(isActive ? null : cat.slug)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-headline-md text-title-sm font-bold transition-all active:scale-95 ${
                isActive
                  ? "bg-on-surface text-surface-container-lowest shadow-md"
                  : "glass-panel text-outline hover:text-on-surface border border-white/10"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isActive ? "text-primary-container material-symbols-fill" : ""
                }`}
              >
                {cat.icon ?? "restaurant"}
              </span>
              {cat.name}
              {isActive && cat._count && (
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-primary-container text-white font-mono">
                  {cat._count.products}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
