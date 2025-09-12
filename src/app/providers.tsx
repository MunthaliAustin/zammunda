"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  user_id: number;
  first_name: string;
  role: string;
  email: string;
  phone_number?: string;
  // Add other fields as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  notifications: any[];
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  notifications: [],
  handleLogout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await fetchNotifications();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notifications`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const notificationData = await response.json();
        setNotifications(notificationData);
      }
    } catch (error) {
      console.error("Notifications fetch error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUser(null);
        setNotifications([]);
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, notifications, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    // Add other fields
  };
  quantity: number;
  price: number;
  // Add other fields from backend
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

interface CartContextType {
  cart: Cart;
  cartCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cart: { items: [], totalAmount: 0 },
  cartCount: 0,
  fetchCart: async () => {},
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeCartItem: async () => {},
  clearCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], totalAmount: 0 });
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user || user.role !== "BUYER") {
      setCart({ items: [], totalAmount: 0 });
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        setCart(data);
      } else {
        setCart({ items: [], totalAmount: 0 });
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart({ items: [], totalAmount: 0 });
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (res.ok) {
        await fetchCart();
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/${cartItemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        await fetchCart();
      } else {
        throw new Error("Failed to update cart item");
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
    }
  };

  const removeCartItem = async (cartItemId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchCart();
      } else {
        throw new Error("Failed to remove cart item");
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchCart();
      } else {
        throw new Error("Failed to clear cart");
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, cartCount, fetchCart, addToCart, updateCartItem, removeCartItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}