"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  badge?: string | null;
  badgeColor?: string | null;
  prepTimeMin: number;
  prepTimeMax: number;
  rating: number;
  ratingCount: number;
  featured: boolean;
  active: boolean;
  stock: number;
};

export type CartItem = {
  id: string;
  quantity: number;
  notes?: string | null;
  product: Product;
};

export type Loyalty = {
  stamps: number;
  stampsPerReward: number;
  stampsInCycle: number;
  remainingForReward: number;
  freeRewards: number;
  tier: string;
};

export type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

type AppState = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  loyalty: Loyalty | null;
  isCartOpen: boolean;
  apiIssue: boolean;
  toast: Toast | null;
  setIsCartOpen: (v: boolean) => void;
  notify: (message: string, type?: "success" | "error") => void;
  dismissToast: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<{ ok: boolean; error?: string }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<{ ok: boolean; error?: string }>;
  refreshLoyalty: () => Promise<void>;
  refreshCart: () => Promise<void>;
  placeOrder: (address: string, notes?: string) => Promise<{ ok: boolean; error?: string; orderId?: string }>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [apiIssue, setApiIssue] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items ?? []);
        setApiIssue(false);
      } else {
        setApiIssue(true);
      }
    } catch {
      setApiIssue(true);
    }
  }, []);

  const refreshLoyalty = useCallback(async () => {
    try {
      const res = await fetch("/api/loyalty");
      if (res.ok) {
        const data = await res.json();
        setLoyalty(data);
        setApiIssue(false);
      } else {
        setApiIssue(true);
      }
    } catch {
      setApiIssue(true);
    }
  }, []);

  useEffect(() => {
    refreshCart();
    refreshLoyalty();
  }, [refreshCart, refreshLoyalty]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await refreshCart();
          setIsCartOpen(true);
          notify("Adicionado à sacola!");
          return { ok: true };
        }
        const message = data?.error ?? "Não foi possível adicionar o item.";
        notify(message, "error");
        return { ok: false, error: message };
      } catch {
        const message = "Falha de conexão com o servidor.";
        notify(message, "error");
        return { ok: false, error: message };
      }
    },
    [refreshCart, notify]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await refreshCart();
          return { ok: true };
        }
        const message = data?.error ?? "Não foi possível atualizar a sacola.";
        notify(message, "error");
        return { ok: false, error: message };
      } catch {
        const message = "Falha de conexão com o servidor.";
        notify(message, "error");
        return { ok: false, error: message };
      }
    },
    [refreshCart, notify]
  );

  const placeOrder = useCallback(
    async (address: string, notes?: string) => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, notes }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          await refreshCart();
          await refreshLoyalty();
          return { ok: true, orderId: data?.order?.id };
        }
        const message = data?.error ?? "Erro ao enviar pedido";
        notify(message, "error");
        return { ok: false, error: message };
      } catch {
        const message = "Falha de conexão com o servidor. Verifique sua internet.";
        notify(message, "error");
        return { ok: false, error: message };
      }
    },
    [refreshCart, refreshLoyalty, notify]
  );

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

  return (
    <AppContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        loyalty,
        isCartOpen,
        apiIssue,
        toast,
        setIsCartOpen,
        notify,
        dismissToast,
        addToCart,
        updateQuantity,
        refreshLoyalty,
        refreshCart,
        placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
