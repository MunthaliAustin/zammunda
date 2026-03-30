"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthTokens, getAuthToken } from "@/lib/auth-service";

interface User {
  user_id: string;
  first_name: string;
  role: string;
  email: string;
  phone_number?: string;
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
      const token = await getAuthToken();
      const payload = JSON.parse(atob(token.split('.')[1]));

      const userData = {
        user_id: payload.sub,
        first_name: payload.given_name || payload.name || payload.preferred_username,
        role: payload.realm_access?.roles?.includes('SELLER') ? 'SELLER' : 'BUYER',
        email: payload.email,
        phone_number: payload.phone_number || undefined,
      };

      setUser(userData);
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
      const token = localStorage.getItem('auth-token');
      const idToken = localStorage.getItem('id-token');

      if (token) {
        const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8181';
        const postLogoutRedirectUri = 'http://localhost:3001/';

        let logoutUrl = `${keycloakUrl}/realms/zammunda-security-realm/protocol/openid-connect/logout`;

        const params = new URLSearchParams();
        if (idToken) {
          params.append('id_token_hint', idToken);
        }
        params.append('post_logout_redirect_uri', postLogoutRedirectUri);

        if (params.toString()) {
          logoutUrl += `?${params.toString()}`;
        }

        clearAuthTokens();
        setUser(null);
        setNotifications([]);

        window.location.href = logoutUrl;
        return;
      }

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
      clearAuthTokens();
      setUser(null);
      setNotifications([]);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const handleAuthChange = () => {
      checkAuthStatus();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token' || e.key === 'id-token' || e.key === 'refresh-token') {
        checkAuthStatus();
      }
    };

    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
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
    id: string;
    name: string;
    price: number;
    image?: string;
    imageUrl?: string;
    city?: string;
  };
  quantity: number;
  price: number;
  skuCode?: string;
  sellerId?: string;
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

interface CartContextType {
  cart: Cart;
  cartCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9000";

  const normalizeCart = (payload: any): Cart => {
    const items = Array.isArray(payload?.items)
      ? payload.items.map((item: any) => ({
          id: Number(item.id),
          product: {
            id: String(item.product?.id ?? ""),
            name: item.product?.name ?? "",
            price: Number(item.price ?? item.product?.price ?? 0),
            image: item.product?.image ?? item.product?.imageUrl,
            imageUrl: item.product?.imageUrl,
            city: item.product?.city ?? undefined,
          },
          quantity: Number(item.quantity ?? 0),
          price: Number(item.price ?? item.product?.price ?? 0),
          skuCode: item.skuCode ?? undefined,
          sellerId: item.sellerId ?? undefined,
        }))
      : [];

    return {
      items,
      totalAmount: Number(payload?.totalAmount ?? 0),
    };
  };

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status} ${response.statusText}`);
      }

      setCart(normalizeCart(await response.json()));
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart({ items: [], totalAmount: 0 });
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status} ${response.statusText}`);
      }

      setCart(normalizeCart(await response.json()));
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update cart item: ${response.status} ${response.statusText}`);
      }

      setCart(normalizeCart(await response.json()));
    } catch (err) {
      console.error("Error updating cart item:", err);
    }
  };

  const removeCartItem = async (cartItemId: number) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove cart item: ${response.status} ${response.statusText}`);
      }

      setCart(normalizeCart(await response.json()));
    } catch (err) {
      console.error("Error removing cart item:", err);
    }
  };

  const clearCart = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.status} ${response.statusText}`);
      }

      setCart({ items: [], totalAmount: 0 });
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
