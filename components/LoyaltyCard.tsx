"use client";

import { useState } from "react";
import { useApp } from "./AppContext";

export default function LoyaltyCard() {
  const { loyalty, refreshLoyalty, notify } = useApp();
  const [redeeming, setRedeeming] = useState(false);

  const total = loyalty?.stampsPerReward ?? 5;
  const filled = loyalty?.stampsInCycle ?? 0;
  const rewardsAvailable = loyalty?.freeRewards ?? 0;
  const remaining = loyalty ? total - filled : total;

  const handleRedeem = async () => {
    if (redeeming || rewardsAvailable < 1) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/loyalty", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        await refreshLoyalty();
        notify(data?.message ?? "Recompensa resgatada com sucesso!");
      } else {
        notify(data?.error ?? "Não foi possível resgatar a recompensa.", "error");
      }
    } catch {
      notify("Falha de conexão com o servidor.", "error");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <section className="space-y-space-sm pb-6">
      <div className="holographic-card rounded-2xl p-5 border border-white/15 shadow-xl relative">
        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined material-symbols-fill text-primary-container text-[22px]">
              local_fire_department
            </span>
            <h3 className="font-headline-md text-title-sm text-on-surface font-extrabold tracking-tight">
              CLUBE DA BRASA
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-label-sm font-label-sm font-extrabold tracking-widest uppercase bg-primary-container/20 text-primary border border-primary/40">
            Nível {loyalty?.tier ?? "Cinza & Fogo"}
          </span>
        </div>

        <p className="relative z-10 font-body-md text-body-md text-on-surface-variant/80 mb-4">
          {rewardsAvailable > 0 ? (
            <>
              Você tem <strong>{rewardsAvailable}</strong> recompensa
              {rewardsAvailable > 1 ? "s" : ""} disponível{rewardsAvailable > 1 ? "is" : ""}!
            </>
          ) : (
            <>
              Você está a <strong>{remaining} selo{remaining !== 1 ? "s" : ""}</strong> de resgatar um Burger
              Edição Limitada do Mestre de Fogo.
            </>
          )}
        </p>

        <div className="relative z-10 grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: total }).map((_, i) => {
            const isFilled = i < filled;
            const isTarget = i === total - 1;
            if (isFilled) {
              return (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-primary-container/30 border border-primary flex items-center justify-center text-primary shadow-[0_0_12px_rgba(255,87,11,0.4)]"
                >
                  <span className="material-symbols-outlined material-symbols-fill text-[20px]">
                    local_fire_department
                  </span>
                </div>
              );
            }
            return (
              <div
                key={i}
                className="aspect-square rounded-xl bg-surface-container border border-dashed border-outline-variant/60 flex flex-col items-center justify-center text-outline"
              >
                {isTarget ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">redeem</span>
                    <span className="text-[8px] font-bold mt-0.5 text-primary">GRÁTIS</span>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-label-md font-label-md text-outline">
            <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
            Benefícios VIP Ativos
          </div>
          {rewardsAvailable > 0 ? (
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="font-label-md text-label-md font-bold text-primary hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {redeeming ? "Resgatando..." : "Resgatar agora"}
              <span className="material-symbols-outlined text-[14px]">
                {redeeming ? "progress_activity" : "redeem"}
              </span>
            </button>
          ) : (
            <span className="font-label-md text-label-md text-outline flex items-center gap-1">
              Ver Regras
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
