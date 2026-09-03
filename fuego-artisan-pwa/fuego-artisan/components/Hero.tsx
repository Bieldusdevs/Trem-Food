"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitReveal from "./SplitReveal";
import { useApp, formatBRL, Product } from "./AppContext";

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ product }: { product: Product | null }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { addToCart } = useApp();

  useEffect(() => {
    if (!imageWrapRef.current || !imgRef.current) return;

    // Reveal com máscara (clip-path) ao entrar na tela
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageWrapRef.current,
        { clipPath: "inset(0 0 100% 0 round 12px)" },
        {
          clipPath: "inset(0 0 0% 0 round 12px)",
          duration: 1.1,
          ease: "power4.out",
          delay: 0.3,
        }
      );

      // Parallax leve na imagem conforme o scroll
      gsap.to(imgRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!product) {
    return (
      <section className="relative mt-2">
        <div className="w-full h-[420px] rounded-2xl skeleton" />
      </section>
    );
  }

  return (
    <section className="relative mt-2" ref={sectionRef}>
      <div className="relative w-full rounded-2xl overflow-hidden glass-panel-rim p-4 pt-5 amber-glow">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-label-sm uppercase tracking-wider bg-[rgba(255,183,3,0.12)] text-[#FFB703] border border-[rgba(255,183,3,0.3)]">
            <span className="material-symbols-outlined material-symbols-fill text-[12px]">
              local_fire_department
            </span>
            {product.badge ?? "Fogo Ancestral"}
          </span>
          <div className="flex items-center gap-1.5 bg-surface-container-lowest/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-on-surface">
            <span className="material-symbols-outlined material-symbols-fill text-[#FFB703] text-[14px]">
              star
            </span>
            <span className="font-label-md text-label-md font-bold">{product.rating.toFixed(1)}</span>
            <span className="text-outline text-label-sm">({product.ratingCount})</span>
          </div>
        </div>

        <div className="relative z-10 pr-4">
          <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold mb-1">
            Criação Insígnia
          </p>
          <h1 className="font-display-hero-mobile text-display-hero-mobile text-on-surface leading-none uppercase tracking-tight">
            <SplitReveal text="O Mistério da" className="block" />
            <SplitReveal
              text="Brasa Pura"
              delay={0.25}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary-container"
            />
          </h1>
        </div>

        <div className="relative w-full h-64 my-2 flex items-center justify-center reveal-mask rounded-xl" ref={imageWrapRef}>
          <img
            ref={imgRef}
            className="w-full h-full object-cover rounded-xl shadow-2xl scale-110"
            src={product.imageUrl}
            alt={product.name}
          />
          <div className="absolute bottom-3 left-3 bg-surface-container-lowest/85 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
            <span className="font-label-sm text-label-sm font-bold text-on-surface">
              {product.prepTimeMin}-{product.prepTimeMax} min
            </span>
            <span className="w-1 h-1 rounded-full bg-outline" />
            <span className="font-label-sm text-label-sm text-primary font-semibold">180g Dry Aged</span>
          </div>
        </div>

        <p className="relative z-10 font-body-md text-body-md text-on-surface-variant/90 line-clamp-2 mt-2 mb-4">
          {product.description}
        </p>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div>
            <span className="font-label-sm text-label-sm text-outline block uppercase">Valor Único</span>
            <span className="font-display-hero-mobile text-headline-lg font-extrabold text-[#FFB703]">
              {formatBRL(product.price)}
            </span>
          </div>
          <button
            onClick={() => addToCart(product.id)}
            className="cta-pulse flex-1 h-[54px] rounded-xl bg-gradient-to-r from-primary-container to-[#FF8C00] text-white font-headline-md text-title-sm flex items-center justify-center gap-2 font-bold amber-glow-intense active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            Pedir Edição Limitada
          </button>
        </div>
      </div>
    </section>
  );
}
