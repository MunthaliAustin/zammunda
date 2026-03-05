"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  user_id: string;
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

  // Create a custom event dispatcher for auth changes
  const dispatchAuthChange = () => {
    window.dispatchEvent(new Event('auth-change'));
  };

  const checkAuthStatus = async () => {
    try {
      // Check for Keycloak tokens
      const token = localStorage.getItem('auth-token');
      const idToken = localStorage.getItem('id-token');
      
      if (token) {
        try {
          // Parse JWT to get user info
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiry = payload.exp * 1000;
          
          // Check if token is expired
          if (Date.now() >= expiry) {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('id-token');
            setUser(null);
            setIsLoading(false);
            return;
          }
          
          // Create user object from token claims
          const userData = {
            user_id: payload.sub,
            first_name: payload.given_name || payload.name || payload.preferred_username,
            role: payload.realm_access?.roles?.includes('SELLER') ? 'SELLER' : 'BUYER',
            email: payload.email,
            phone_number: payload.phone_number || undefined
          };
          
          setUser(userData);
          // Note: notifications fetch removed as it depends on backend auth
          
        } catch (error) {
          console.error("Token parsing error:", error);
          localStorage.removeItem('auth-token');
          localStorage.removeItem('id-token');
          setUser(null);
        }
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
      // Check if we have Keycloak tokens
      const token = localStorage.getItem('auth-token');
      const idToken = localStorage.getItem('id-token');
      
      console.log('Logout initiated - Token:', token ? 'present' : 'missing', 'ID Token:', idToken ? 'present' : 'missing');
      
      if (token) {
        // Build Keycloak logout URL BEFORE clearing tokens
        const keycloakUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8181';
        const postLogoutRedirectUri = 'http://localhost:3001/';
        
        // Build logout URL with proper parameters
        let logoutUrl = `${keycloakUrl}/realms/zammunda-security-realm/protocol/openid-connect/logout`;
        
        const params = new URLSearchParams();
        if (idToken) {
          params.append('id_token_hint', idToken);
          console.log('Adding id_token_hint to logout URL');
        } else {
          console.warn('No id_token found for logout - Keycloak may require this');
        }
        params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        
        if (params.toString()) {
          logoutUrl += `?${params.toString()}`;
        }
        
        console.log('Logout URL:', idToken ? logoutUrl.replace(idToken, '***REDACTED***') : logoutUrl);
        
        // Clear local storage and state AFTER building logout URL
        localStorage.removeItem('auth-token');
        localStorage.removeItem('id-token');
        setUser(null);
        setNotifications([]);
        
        // Redirect to Keycloak logout
        window.location.href = logoutUrl;
        return;
      }
      
      // Fallback to existing logout
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
      // Even if logout fails, clear local state
      localStorage.removeItem('auth-token');
      setUser(null);
      setNotifications([]);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for custom auth-change events (from same tab)
    const handleAuthChange = () => {
      console.log('Auth change event detected');
      checkAuthStatus();
    };
    
    // Listen for storage events (from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-token' || e.key === 'id-token') {
        console.log('Storage change detected:', e.key);
        checkAuthStatus();
      }
    };
    
    // Also check auth status when window focus changes
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
  id: string | number; // This is productId from backend (can be UUID or numeric)
  skuCode?: string; // Add SKU code for order placement
  product: {
    id: string | number;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  price: number;
  name?: string;
  imageUrl?: string;
  sellerId?: string; // Add seller info for order placement
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

interface CartContextType {
  cart: Cart;
  cartCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string | number, quantity: number, productDetails?: { name: string; price: number; imageUrl?: string; sellerId?: string; skuCode?: string }) => Promise<void>;
  updateCartItem: (productId: string | number, quantity: number) => Promise<void>;
  removeCartItem: (productId: string | number) => Promise<void>;
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
      console.log('Fetching cart for user:', user.user_id);
      const token = localStorage.getItem('auth-token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      console.log('Cart response status:', res.status);
      
      if (res.ok) {
        const responseJson = await res.json();
        console.log('Cart response data:', responseJson);
        console.log('Cart items from backend:', responseJson.items);
        // Backend returns: { items, totalAmount, itemCount }
        // Map items to frontend format
        const mappedItems = (responseJson.items || []).map((item: any) => {
          console.log('Mapping cart item:', item);
          return {
            id: item.productId,
            skuCode: item.skuCode,
            product: {
              id: item.productId,
              name: item.name,
              price: item.price,
              image: item.imageUrl,
            },
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            imageUrl: item.imageUrl,
            sellerId: item.sellerId || undefined, // Include seller info if available
          };
        });
        setCart({ 
          items: mappedItems, 
          totalAmount: responseJson.totalAmount || 0 
        });
        console.log('Mapped cart items:', mappedItems);
        console.log('First item sellerId:', mappedItems[0]?.sellerId);
      } else {
        console.warn('Cart fetch failed, status:', res.status);
        setCart({ items: [], totalAmount: 0 });
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCart({ items: [], totalAmount: 0 });
    }
  };

  const addToCart = async (productId: string | number, quantity: number, productDetails?: { name: string; price: number; imageUrl?: string; sellerId?: string; skuCode?: string }) => {
    try {
      // Validate productId
      if (!productId) {
        console.error('Invalid productId:', productId);
        throw new Error('Product ID is required');
      }
      
      console.log('Adding to cart - Product ID:', productId, 'Quantity:', quantity, 'Product Details:', productDetails);
      const token = localStorage.getItem('auth-token');
      
      const requestBody = {
        productId,
        quantity,
        name: productDetails?.name,
        price: productDetails?.price,
        imageUrl: productDetails?.imageUrl,
        sellerId: productDetails?.sellerId,
        skuCode: productDetails?.skuCode
      };
      
      console.log('Cart request body:', requestBody);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      console.log('Add to cart response status:', res.status);
      
      if (res.ok) {
        await fetchCart();
        console.log('Cart refreshed after adding item');
      } else {
        const errorData = await res.json();
        console.error('Add to cart failed:', errorData);
        throw new Error("Failed to add to cart: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  };

  const updateCartItem = async (productId: string | number, quantity: number) => {
    try {
      console.log('Updating cart item - Product ID:', productId, 'Quantity:', quantity);
      const token = localStorage.getItem('auth-token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/${productId}?quantity=${quantity}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include",
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

  const removeCartItem = async (productId: string | number) => {
    try {
      console.log('Removing cart item - Product ID:', productId);
      const token = localStorage.getItem('auth-token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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
      console.log('Clearing cart');
      const token = localStorage.getItem('auth-token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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