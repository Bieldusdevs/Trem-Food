"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useApp, formatBRL, Product } from "./AppContext";
import ImageWithFallback from "./ImageWithFallback";

gsap.registerPlugin(ScrollTrigger);

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const { addToCart } = useApp();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: index * 0.05,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
    return () => ctx.revert();
  }, [index]);

  const soldOut = product.stock <= 0;

  const handleAdd = async () => {
    if (soldOut || adding) return;
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  };

  return (
    <article
      ref={ref}
      className="glass-panel-rim rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:border-primary/50"
    >
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {product.badge && (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider bg-[rgba(255,183,3,0.12)] text-[#FFB703] border border-[rgba(255,183,3,0.3)]">
                  {product.badge}
                </span>
              )}
              {soldOut && (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded tracking-wider bg-error/10 text-error border border-error/40">
                  Esgotado
                </span>
              )}
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold leading-snug">
              {product.name}
            </h3>
            <p className="font-body-md text-body-md text-outline mt-1 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="font-headline-lg text-headline-lg font-extrabold text-[#FFB703]">
              {formatBRL(product.price)}
            </span>
            <button
              aria-label={`Adicionar ${product.name}`}
              onClick={handleAdd}
              disabled={soldOut || adding}
              className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center hover:bg-[#FF8C00] active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">
                {adding ? "progress_activity" : "add"}
              </span>
            </button>
          </div>
        </div>
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.name}
          className="w-32 h-36 shrink-0 rounded-xl border border-white/10 self-center"
        />
      </div>
    </article>
  );
}
