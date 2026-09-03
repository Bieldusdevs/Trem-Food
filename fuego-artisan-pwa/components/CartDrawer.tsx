"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useApp, formatBRL } from "./AppContext";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, cartSubtotal, updateQuantity, placeOrder } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!panelRef.current) return;
    if (isCartOpen) {
      gsap.fromTo(panelRef.current, { y: "100%" }, { y: "0%", duration: 0.45, ease: "power3.out" });
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const close = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        y: "100%",
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => setIsCartOpen(false),
      });
    } else {
      setIsCartOpen(false);
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setStatus("error");
      setErrorMsg("Informe o endereço de entrega.");
      return;
    }
    setStatus("loading");
    const result = await placeOrder(address, notes);
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "Erro ao enviar pedido");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div
        ref={panelRef}
        className="relative w-full max-w-lg mx-auto bg-surface-container-low rounded-t-3xl border-t border-white/10 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <h2 className="font-headline-md text-headline-md font-bold">Sua Sacola</h2>
          <button onClick={close} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {status === "success" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <span className="material-symbols-outlined material-symbols-fill text-primary text-[48px]">
              local_fire_department
            </span>
            <h3 className="font-headline-md text-headline-md font-bold">Pedido confirmado!</h3>
            <p className="text-outline text-body-md">
              Seu selo do Clube da Brasa já foi registrado. Estamos preparando tudo na brasa.
            </p>
            <button
              onClick={close}
              className="mt-3 px-6 py-3 rounded-xl bg-primary-container text-white font-bold"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {cartItems.length === 0 && (
                <p className="text-outline text-body-md text-center py-10">Sua sacola está vazia.</p>
              )}
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-surface-container rounded-xl p-3">
                  <img src={item.product.imageUrl} className="w-14 h-14 rounded-lg object-cover" alt={item.product.name} />
                  <div className="flex-1">
                    <p className="font-title-sm text-title-sm font-bold">{item.product.name}</p>
                    <p className="text-primary font-bold text-body-md">{formatBRL(item.product.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="w-5 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              ))}

              {cartItems.length > 0 && (
                <div className="pt-3 space-y-2">
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Endereço de entrega"
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-body-md outline-none border border-white/10 focus:border-primary"
                  />
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações (opcional)"
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-body-md outline-none border border-white/10 focus:border-primary"
                  />
                  {status === "error" && <p className="text-error text-label-md">{errorMsg}</p>}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="px-5 py-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-outline">Subtotal</span>
                  <span className="font-bold">{formatBRL(cartSubtotal)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={status === "loading"}
                  className="w-full h-[54px] rounded-xl bg-gradient-to-r from-primary-container to-[#FF8C00] text-white font-bold amber-glow-intense active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {status === "loading" ? "Enviando..." : "Finalizar Pedido"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
