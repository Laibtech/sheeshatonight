"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuthContext } from '@/components/AuthProvider';

function resolveImageUrl(images: any): string {
  const defaultFallback = 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800';
  if (!images) return defaultFallback;
  try {
    const parsed = typeof images === 'string' && (images.startsWith('[') || images.startsWith('{')) ? JSON.parse(images) : images;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (typeof first === 'string' && first.trim() !== '') return first.trim();
    } else if (typeof parsed === 'string' && parsed.trim() !== '') {
      return parsed.trim();
    }
  } catch {
    if (typeof images === 'string' && images.trim() !== '') return images.trim();
  }
  return defaultFallback;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number | null;
  quantity: number;
  stock: number;
  vendor: string;
  category: string;
  slug: string;
}

export interface CartData {
  cartId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  invalidItemCount: number;
}

interface CartContextType {
  cart: CartData;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number, productDetails?: Partial<CartItem>) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const GUEST_CART_STORAGE_KEY = 'sheeshatonight_guest_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to calculate totals for an items array
const calculateCartTotals = (items: CartItem[]): CartData => {
  const invalidItemCount = items.filter((item) => item.price === null || isNaN(Number(item.price))).length;
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price === null || isNaN(Number(item.price)) ? 0 : Number(item.price) * item.quantity),
    0
  );
  return {
    items,
    subtotal,
    total: invalidItemCount === 0 ? subtotal : 0,
    invalidItemCount,
  };
};

// Read guest cart from localStorage
const loadGuestCart = (): CartData => {
  if (typeof window === 'undefined') {
    return { items: [], subtotal: 0, total: 0, invalidItemCount: 0 };
  }
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return { items: [], subtotal: 0, total: 0, invalidItemCount: 0 };
    const parsed: CartItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { items: [], subtotal: 0, total: 0, invalidItemCount: 0 };
    return calculateCartTotals(parsed);
  } catch {
    return { items: [], subtotal: 0, total: 0, invalidItemCount: 0 };
  }
};

// Save guest cart to localStorage
const saveGuestCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving guest cart:', e);
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const [cart, setCart] = useState<CartData>({
    items: [],
    subtotal: 0,
    total: 0,
    invalidItemCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Calculate item count
  const itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Fetch cart data from server or localStorage
  const fetchCart = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      // Guest mode
      const guestData = loadGuestCart();
      setCart(guestData);
      setLoading(false);
      return;
    }

    // Authenticated mode: sync any guest cart items first
    try {
      if (typeof window !== 'undefined') {
        const rawGuest = localStorage.getItem(GUEST_CART_STORAGE_KEY);
        if (rawGuest) {
          const guestItems: CartItem[] = JSON.parse(rawGuest);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            for (const gi of guestItems) {
              try {
                await fetch('/api/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId: gi.productId, quantity: gi.quantity || 1 }),
                });
              } catch (e) {
                // Ignore individual merge errors
              }
            }
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          }
        }
      }

      const response = await fetch('/api/cart');
      const result = await response.json();

      if (result.success && result.data) {
        const rawItems = result.data.items || [];
        const formattedItems: CartItem[] = rawItems.map((item: any) => {
          const prd = item.product || {};
          const priceNum = Number(prd.price);
          return {
            id: item.id,
            productId: item.productId || prd.id || '',
            name: prd.title || item.name || 'Sheesha Product',
            image: resolveImageUrl(prd.images || item.image),
            price: Number.isFinite(priceNum) && priceNum >= 0 ? priceNum : null,
            quantity: Number(item.quantity || 1),
            stock: Number(prd.stock || 99),
            vendor: prd.vendor || item.vendor || 'SheeshaTonight Partner',
            category: prd.type || item.category || 'SHEESHA',
            slug: prd.slug || item.slug || '',
          };
        });

        const cartTotals = calculateCartTotals(formattedItems);
        setCart({
          ...cartTotals,
          cartId: result.data.cartId,
        });
      } else {
        setCart({ items: [], subtotal: 0, total: 0, invalidItemCount: 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], subtotal: 0, total: 0, invalidItemCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Add item to cart (supports both guest and authenticated)
  const addToCart = async (
    productId: string,
    quantity: number = 1,
    productDetails?: Partial<CartItem>
  ): Promise<boolean> => {
    if (!productId) {
      console.error('Missing productId in addToCart');
      return false;
    }

    if (user) {
      // Authenticated user -> call backend API
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, quantity }),
        });

        const result = await response.json();

        if (result.success) {
          await fetchCart();
          return true;
        } else {
          console.error('Failed to add to cart:', result.error);
          alert(result.error || 'Failed to add item to cart');
          return false;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart');
        return false;
      }
    } else {
      // Guest user -> local storage cart
      try {
        let name = productDetails?.name || 'Sheesha Product';
        let price = productDetails?.price ?? null;
        let image = productDetails?.image || resolveImageUrl(null);
        let vendor = productDetails?.vendor || 'SheeshaTonight Partner';
        let category = productDetails?.category || 'SHEESHA';
        let stock = productDetails?.stock || 99;

        // If details are missing, fetch from /api/products/[id]
        if (!productDetails || price === null) {
          try {
            const prdRes = await fetch(`/api/products/${productId}`);
            const prdJson = await prdRes.json();
            if (prdJson.success && prdJson.data) {
              const p = prdJson.data;
              name = p.title || p.name || name;
              price = Number(p.price);
              image = resolveImageUrl(p.images || p.image);
              vendor = p.vendor || vendor;
              category = p.type || p.category || category;
              stock = p.stock || stock;
            }
          } catch {
            // Use defaults if fetch fails
          }
        }

        const currentGuest = loadGuestCart().items;
        const existingIndex = currentGuest.findIndex((item) => item.productId === productId);

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = currentGuest.map((it, idx) =>
            idx === existingIndex ? { ...it, quantity: it.quantity + quantity } : it
          );
        } else {
          const newItem: CartItem = {
            id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            productId,
            name,
            image,
            price: Number.isFinite(Number(price)) ? Number(price) : 0,
            quantity,
            stock,
            vendor,
            category,
            slug: productDetails?.slug || '',
          };
          updatedItems = [...currentGuest, newItem];
        }

        saveGuestCart(updatedItems);
        setCart(calculateCartTotals(updatedItems));
        return true;
      } catch (e) {
        console.error('Error adding to guest cart:', e);
        return false;
      }
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    if (user) {
      try {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        });

        const result = await response.json();

        if (result.success) {
          await fetchCart();
        } else {
          console.error('Failed to update quantity:', result.error);
          alert(result.error || 'Failed to update quantity');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity');
      }
    } else {
      // Guest cart
      const currentGuest = loadGuestCart().items;
      const updated = currentGuest.map((it) => (it.id === itemId ? { ...it, quantity } : it));
      saveGuestCart(updated);
      setCart(calculateCartTotals(updated));
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    // Optimistically update UI immediately
    const prevCart = cart;
    const updatedItems = cart.items.filter((it) => it.id !== itemId);
    setCart(calculateCartTotals(updatedItems));

    if (user) {
      try {
        const response = await fetch(`/api/cart/${itemId}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          await fetchCart();
        } else {
          console.error('Failed to remove item from cart:', result.error);
          setCart(prevCart);
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        setCart(prevCart);
      }
    } else {
      // Guest cart
      saveGuestCart(updatedItems);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    const prevCart = cart;
    setCart({ items: [], subtotal: 0, total: 0, invalidItemCount: 0 });

    if (user) {
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          await fetchCart();
        } else {
          console.error('Failed to clear cart:', result.error);
          setCart(prevCart);
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
        setCart(prevCart);
      }
    } else {
      // Guest cart
      saveGuestCart([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      }
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
