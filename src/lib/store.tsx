"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { PRODUCTS, type Product } from "@/lib/data";

/* ------------------------------------------------------------------ cart */

export type CartLine = { product: Product; qty: number };

type CartAction =
  | { type: "add"; id: string }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "clear" };

function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const product = PRODUCTS.find((p) => p.id === action.id);
      if (!product) return state;
      const existing = state.find((l) => l.product.id === action.id);
      if (existing) {
        return state.map((l) =>
          l.product.id === action.id ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [...state, { product, qty: 1 }];
    }
    case "remove":
      return state.filter((l) => l.product.id !== action.id);
    case "setQty": {
      if (action.qty <= 0) return state.filter((l) => l.product.id !== action.id);
      return state.map((l) =>
        l.product.id === action.id ? { ...l, qty: action.qty } : l,
      );
    }
    case "clear":
      return [];
  }
}

/* --------------------------------------------------------------- context */

type BoutiqueContextValue = {
  lines: CartLine[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  bookingOpen: boolean;
  openBooking: (treatmentId?: string) => void;
  closeBooking: () => void;
  /** Treatment preselected when the drawer was opened from a treatment card. */
  bookingSeed: string | null;
};

const BoutiqueContext = createContext<BoutiqueContextValue | null>(null);

export function BoutiqueProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSeed, setBookingSeed] = useState<string | null>(null);

  const addToCart = useCallback((id: string) => {
    dispatch({ type: "add", id });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const setQty = useCallback(
    (id: string, qty: number) => dispatch({ type: "setQty", id, qty }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);

  const openBooking = useCallback((treatmentId?: string) => {
    setBookingSeed(treatmentId ?? null);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const value = useMemo<BoutiqueContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
    return {
      lines,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      count,
      subtotal,
      cartOpen,
      setCartOpen,
      bookingOpen,
      openBooking,
      closeBooking,
      bookingSeed,
    };
  }, [
    lines,
    addToCart,
    removeFromCart,
    setQty,
    clearCart,
    cartOpen,
    bookingOpen,
    openBooking,
    closeBooking,
    bookingSeed,
  ]);

  return <BoutiqueContext.Provider value={value}>{children}</BoutiqueContext.Provider>;
}

export function useBoutique() {
  const ctx = useContext(BoutiqueContext);
  if (!ctx) throw new Error("useBoutique must be used inside <BoutiqueProvider>");
  return ctx;
}
