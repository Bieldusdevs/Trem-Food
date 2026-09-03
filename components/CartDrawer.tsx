"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import ImageWithFallback from "./ImageWithFallback";
import { useApp, formatBRL } from "./AppContext";

const DELIVERY_FEE = 900; // R$ 9,00 em centavos

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, cartSubtotal, updateQuantity, placeOrder } = useApp();
  const panelRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [orderId, setOrderId] = useState("");
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

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

  const handleCloseSuccess = () => {
    setStatus("idle");
    setErrorMsg("");
    setAddress("");
    setNotes("");
    close();
  };

  const handleUpdate = async (itemId: string, quantity: number) => {
    if (updatingItem) return;
    setUpdatingItem(itemId);
    await updateQuantity(itemId, quantity);
    setUpdatingItem(null);
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setStatus("error");
      setErrorMsg("Informe o endereço de entrega.");
      return;
    }
    if (cartItems.length === 0) return;
    setStatus("loading");
    setErrorMsg("");
    const result = await placeOrder(address, notes);
    if (result.ok) {
      setOrderId(result.orderId ?? "");
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(result.error ?? "Erro ao enviar pedido");
    }
  };

  const isBusy = status === "loading" || updatingItem !== null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end" role="dialog" aria-modal="true">
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
            {orderId && (
              <p className="text-outline text-label-md font-mono bg-surface-container rounded-lg px-3 py-1.5">
                Pedido #{orderId.slice(-8).toUpperCase()}
              </p>
            )}
            <p className="text-on-surface-variant/90 text-body-md">
              Entrega em até <strong>45–60 min</strong>. Acompanhe pelo seu número de pedido.
            </p>
            <button
              onClick={handleCloseSuccess}
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
              {cartItems.map((item) => {
                const isUpdating = updatingItem === item.id;
                const soldOut = item.product.stock <= 0;
                return (
                  <div key={item.id} className="flex items-center gap-3 bg-surface-container rounded-xl p-3">
                    <ImageWithFallback
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-title-sm text-title-sm font-bold truncate">{item.product.name}</p>
                      <p className="text-primary font-bold text-body-md">{formatBRL(item.product.price)}</p>
                      {soldOut && (
                        <p className="text-error text-label-sm">Esgotado — remova para continuar</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdate(item.id, item.quantity - 1)}
                        disabled={isBusy}
                        aria-label={`Diminuir ${item.product.name}`}
                        className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-5 text-center font-bold">
                        {isUpdating ? <span className="material-symbols-outlined text-[14px]">progress_activity</span> : item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdate(item.id, item.quantity + 1)}
                        disabled={isBusy || soldOut || item.quantity >= item.product.stock}
                        aria-label={`Aumentar ${item.product.name}`}
                        className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {cartItems.length > 0 && (
                <div className="pt-3 space-y-2">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Endereço de entrega (rua, número, bairro)"
                    rows={2}
                    className="w-full bg-surface-container rounded-xl px-4 py-3 text-body-md outline-none border border-white/10 focus:border-primary resize-none"
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
                <div className="flex items-center justify-between">
                  <span className="text-outline">Entrega</span>
                  <span className="font-bold">{cartSubtotal >= 5000 ? "Grátis" : formatBRL(DELIVERY_FEE)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold text-primary">
                    {formatBRL(cartSubtotal >= 5000 ? cartSubtotal : cartSubtotal + DELIVERY_FEE)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isBusy}
                  className="w-full h-[54px] rounded-xl bg-gradient-to-r from-primary-container to-[#FF8C00] text-white font-bold amber-glow-intense active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {status === "loading" ? "Enviando..." : `Finalizar Pedido · ${formatBRL(cartSubtotal >= 5000 ? cartSubtotal : cartSubtotal + DELIVERY_FEE)}`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
