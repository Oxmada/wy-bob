"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

/* ===========================
   TYPES
   =========================== */
interface PanierItem {
  _id: string;
  name: string;
  price: number;
  promoPrice?: number;
  image?: string;
  color?: string;
  quantity: number;
}

interface PanierContextType {
  cartItems: PanierItem[];
  addToCart: (product: Omit<PanierItem, 'quantity'>) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
}

/* ===========================
   CONTEXT
   =========================== */
const PanierContext = createContext<PanierContextType | undefined>(undefined);

/* ===========================
   PROVIDER
   =========================== */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<PanierItem[]>([]);

  /* 🔄 Charger depuis localStorage */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem("wybob-cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, []);

  /* 💾 Sauvegarde auto */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("wybob-cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  /* ➕ Ajouter au panier */
  const addToCart = (product: Omit<PanierItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  /* ➕ Augmenter quantité */
  const increaseQty = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  /* ➖ Diminuer quantité */
  const decreaseQty = (id: string) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* ❌ Supprimer */
  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  /* 💰 Total */
  const cartTotal = cartItems.reduce((total, item) => {
    const price = Number(item.promoPrice ?? item.price);
    return total + price * item.quantity;
  }, 0);

  return (
    <PanierContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        cartTotal,
      }}
    >
      {children}
    </PanierContext.Provider>
  );
}

/* ===========================
   HOOK
   =========================== */
export const useCart = () => {
  const context = useContext(PanierContext);
  if (!context) throw new Error("useCart doit être utilisé dans CartProvider");
  return context;
};