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
};

export type CartItem = {
  id: string;
  quantity: number;
  notes?: string | null;
  product: Product;
};

type Loyalty = {
  stamps: number;
  stampsPerReward: number;
  stampsInCycle: number;
  remainingForReward: number;
  freeRewards: number;
  tier: string;
};

type AppState = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  loyalty: Loyalty | null;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  refreshLoyalty: () => Promise<void>;
  refreshCart: () => Promise<void>;
  placeOrder: (address: string, notes?: string) => Promise<{ ok: boolean; error?: string }>;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCartItems(data.items);
    }
  }, []);

  const refreshLoyalty = useCallback(async () => {
    const res = await fetch("/api/loyalty");
    if (res.ok) {
      const data = await res.json();
      setLoyalty(data);
    }
  }, []);

  useEffect(() => {
    refreshCart();
    refreshLoyalty();
  }, [refreshCart, refreshLoyalty]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        await refreshCart();
        setIsCartOpen(true);
      }
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      if (res.ok) await refreshCart();
    },
    [refreshCart]
  );

  const placeOrder = useCallback(
    async (address: string, notes?: string) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, notes }),
      });
      if (res.ok) {
        await refreshCart();
        await refreshLoyalty();
        return { ok: true };
      }
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.error ?? "Erro ao enviar pedido" };
    },
    [refreshCart, refreshLoyalty]
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
        setIsCartOpen,
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
