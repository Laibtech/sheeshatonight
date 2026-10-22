"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useAuthContext } from "@/components/AuthProvider";
import { useAuthStore } from "@/lib/store";

export interface WishlistItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    title?: string;
    name?: string;
    price?: number;
    currency?: string;
    images?: string | string[];
    image?: string;
    type?: string;
    category?: string;
    stock?: number;
    vendor?: {
      id: string;
      name: string;
      slug?: string;
    };
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistIds: string[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productId: string | number) => boolean;
  toggleWishlist: (
    productId: string | number,
    productDetails?: any
  ) => Promise<{ added: boolean; success: boolean }>;
  addToWishlist: (
    productId: string | number,
    productDetails?: any
  ) => Promise<boolean>;
  removeFromWishlist: (productId: string | number) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const GUEST_WISHLIST_KEY = "st_wishlist";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("auth_token");
  if (token) return token;
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

function loadGuestWishlistIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveGuestWishlistIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("Error saving guest wishlist:", e);
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const { isLoggedIn } = useAuthStore();
  const isAuth = Boolean(user || isLoggedIn);

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Derived set of string product IDs
  const wishlistIds = useMemo(() => {
    return items.map((i) => String(i.productId));
  }, [items]);

  const wishlistCount = items.length;

  const isInWishlist = useCallback(
    (productId: string | number): boolean => {
      const targetId = String(productId);
      return items.some((i) => String(i.productId) === targetId || String(i.id) === targetId);
    },
    [items]
  );

  // Fetch wishlist from server or guest local storage
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    const token = getAuthToken();

    if (isAuth || token) {
      try {
        // First check if there are guest items to merge
        const guestIds = loadGuestWishlistIds();
        if (guestIds.length > 0) {
          try {
            const headers: HeadersInit = {
              "Content-Type": "application/json",
            };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            await fetch("/api/wishlist", {
              method: "POST",
              headers,
              body: JSON.stringify({ productIds: guestIds }),
            });
            // Clear guest storage after successful merge
            if (typeof window !== "undefined") {
              localStorage.removeItem(GUEST_WISHLIST_KEY);
            }
          } catch (mergeErr) {
            console.error("Error merging guest wishlist:", mergeErr);
          }
        }

        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/wishlist", {
          headers,
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.items)) {
            setItems(json.data.items);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching authenticated wishlist:", err);
      }
    }

    // Guest Mode fallback
    try {
      const guestIds = loadGuestWishlistIds();
      if (guestIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Fetch products to populate guest wishlist with real data
      const prodRes = await fetch("/api/products?limit=100");
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        const allProducts = Array.isArray(prodData)
          ? prodData
          : prodData?.data?.products || prodData?.data || [];

        const populated: WishlistItem[] = guestIds
          .map((id) => {
            const found = allProducts.find((p: any) => String(p.id) === id);
            if (!found) return null;
            return {
              id: `guest_${id}`,
              productId: id,
              product: {
                id: String(found.id),
                title: found.title || found.name || "Sheesha Item",
                name: found.name || found.title || "Sheesha Item",
                price: Number(found.price || 0),
                currency: found.currency || "AED",
                images: found.images || found.image,
                image: found.image || (Array.isArray(found.images) ? found.images[0] : found.images),
                type: found.type || found.category || "SHEESHA",
                stock: found.stock ?? 1,
                vendor: found.vendor
                  ? typeof found.vendor === "string"
                    ? { id: found.vendorId || "v1", name: found.vendor }
                    : found.vendor
                  : { id: "v1", name: "SheeshaTonight Partner" },
              },
            };
          })
          .filter(Boolean) as WishlistItem[];

        setItems(populated);
      } else {
        // Fallback bare items
        setItems(
          guestIds.map((id) => ({
            id: `guest_${id}`,
            productId: id,
          }))
        );
      }
    } catch (guestErr) {
      console.error("Error loading guest wishlist:", guestErr);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuth]);

  // Initial load and on auth changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Add to wishlist
  const addToWishlist = async (
    productId: string | number,
    productDetails?: any
  ): Promise<boolean> => {
    const strId = String(productId);
    if (!strId) return false;

    if (isInWishlist(strId)) return true; // Already wishlisted

    const token = getAuthToken();

    // Optimistic item
    const optimisticItem: WishlistItem = {
      id: `temp_${strId}_${Date.now()}`,
      productId: strId,
      product: productDetails
        ? {
            id: strId,
            title: productDetails.title || productDetails.name,
            name: productDetails.name || productDetails.title,
            price: Number(productDetails.price || 0),
            currency: productDetails.currency || "AED",
            image: productDetails.image || productDetails.images?.[0],
            images: productDetails.images || productDetails.image,
            vendor: productDetails.vendor
              ? typeof productDetails.vendor === "string"
                ? { id: "v1", name: productDetails.vendor }
                : productDetails.vendor
              : undefined,
          }
        : undefined,
    };

    setItems((prev) => [optimisticItem, ...prev]);

    if (isAuth || token) {
      try {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ productId: strId }),
        });

        const json = await res.json();
        if (json.success && json.data?.item) {
          setItems((prev) =>
            prev.map((it) =>
              it.productId === strId ? json.data.item : it
            )
          );
          return true;
        } else {
          console.error("Failed to add to server wishlist:", json.error);
          return true; // Keep optimistic state
        }
      } catch (err) {
        console.error("Error posting to wishlist API:", err);
        return true;
      }
    } else {
      // Guest mode
      const currentIds = loadGuestWishlistIds();
      if (!currentIds.includes(strId)) {
        saveGuestWishlistIds([...currentIds, strId]);
      }
      return true;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (
    productId: string | number
  ): Promise<boolean> => {
    const strId = String(productId);
    const prevItems = items;

    // Optimistic removal
    setItems((prev) => prev.filter((it) => String(it.productId) !== strId && String(it.id) !== strId));

    const token = getAuthToken();

    if (isAuth || token) {
      try {
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/wishlist?productId=${strId}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          console.error("Failed to delete wishlist item:", json.error);
        }
        return true;
      } catch (err) {
        console.error("Error removing from wishlist API:", err);
        return true;
      }
    } else {
      // Guest mode
      const currentIds = loadGuestWishlistIds();
      const updatedIds = currentIds.filter((id) => id !== strId);
      saveGuestWishlistIds(updatedIds);
      return true;
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (
    productId: string | number,
    productDetails?: any
  ): Promise<{ added: boolean; success: boolean }> => {
    const strId = String(productId);
    const wishlisted = isInWishlist(strId);

    if (wishlisted) {
      await removeFromWishlist(strId);
      return { added: false, success: true };
    } else {
      const added = await addToWishlist(strId, productDetails);
      return { added: true, success: added };
    }
  };

  // Clear all
  const clearWishlist = async (): Promise<boolean> => {
    setItems([]);
    const token = getAuthToken();

    if (isAuth || token) {
      try {
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch("/api/wishlist?all=true", {
          method: "DELETE",
          headers,
          credentials: "include",
        });
        return true;
      } catch (err) {
        console.error("Error clearing wishlist on server:", err);
        return false;
      }
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
      }
      return true;
    }
  };

  const refreshWishlist = async () => {
    await fetchWishlist();
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: items,
        wishlistIds,
        wishlistCount,
        loading,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
