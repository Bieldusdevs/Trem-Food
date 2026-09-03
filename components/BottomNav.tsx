"use client";

import { useApp } from "./AppContext";

export default function BottomNav() {
  const { setIsCartOpen, cartCount, notify } = useApp();

  const scrollToMenu = () => {
    document.getElementById("cardapio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProfile = () => {
    notify("Funcionalidade de perfil em breve. Seus pedidos e selos já ficam salvos no seu aparelho.", "success");
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 flex justify-around items-center py-space-xs px-space-sm max-w-lg mx-auto bg-surface-container-lowest/80 backdrop-blur-xl rounded-full border border-outline-variant/30 shadow-[0_12px_32px_-8px_rgba(255,84,0,0.28)]">
      <button
        onClick={scrollToTop}
        aria-label="Voltar ao início"
        className="flex flex-col items-center justify-center text-primary bg-primary-container/20 rounded-full py-1.5 px-4 active:scale-95 transition-transform duration-150"
      >
        <span className="material-symbols-outlined material-symbols-fill text-[22px]">local_fire_department</span>
        <span className="font-label-sm text-label-sm font-bold mt-0.5">Início</span>
      </button>
      <button
        onClick={scrollToMenu}
        aria-label="Ir para o cardápio"
        className="flex flex-col items-center justify-center text-outline hover:text-on-surface py-1.5 px-3 active:scale-95 transition-transform duration-150"
      >
        <span className="material-symbols-outlined text-[22px]">restaurant_menu</span>
        <span className="font-label-sm text-label-sm mt-0.5">Cardápio</span>
      </button>
      <button
        onClick={() => setIsCartOpen(true)}
        aria-label="Abrir sacola"
        className="relative flex flex-col items-center justify-center text-outline hover:text-on-surface py-1.5 px-3 active:scale-95 transition-transform duration-150"
      >
        <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
        <span className="font-label-sm text-label-sm mt-0.5">Sacola</span>
        {cartCount > 0 && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-primary-container" />}
      </button>
      <button
        onClick={handleProfile}
        aria-label="Perfil do cliente"
        className="flex flex-col items-center justify-center text-outline hover:text-on-surface py-1.5 px-3 active:scale-95 transition-transform duration-150"
      >
        <span className="material-symbols-outlined text-[22px]">person</span>
        <span className="font-label-sm text-label-sm mt-0.5">Perfil</span>
      </button>
    </nav>
  );
}
