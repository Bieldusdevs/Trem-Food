"use client";

import { useEffect } from "react";
import { useApp } from "./AppContext";

export default function ToastHost() {
  const { toast, dismissToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dismissToast(), 3200);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed top-16 left-4 right-4 z-[70] flex justify-center pointer-events-none">
      <div
        role="status"
        className={`pointer-events-auto max-w-lg w-full flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl animate-[toast-in_.25s_ease-out] ${
          isError
            ? "bg-[#3a1210]/95 border-error/50 text-error"
            : "bg-surface-container-lowest/95 border-primary/40 text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined material-symbols-fill text-[20px] shrink-0 ${
            isError ? "text-error" : "text-primary"
          }`}
        >
          {isError ? "error" : "check_circle"}
        </span>
        <p className="flex-1 text-body-md font-medium">{toast.message}</p>
        <button
          onClick={dismissToast}
          aria-label="Fechar aviso"
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}
