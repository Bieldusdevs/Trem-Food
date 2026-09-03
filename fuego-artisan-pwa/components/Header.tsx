"use client";

import { useApp } from "./AppContext";

export default function Header() {
  const { cartCount, setIsCartOpen } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-edge-margin-mobile py-space-sm w-full bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/30 text-primary">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            near_me
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
            Localização
          </span>
          <span className="font-title-sm text-title-sm text-on-surface flex items-center gap-1 leading-none font-bold">
            Jardins, SP
            <span className="material-symbols-outlined text-[14px] text-primary">expand_more</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Buscar artesanal"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:text-primary active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label="Abrir sacola"
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-surface-container border border-outline-variant/30 text-on-surface hover:text-primary active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary-container text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
