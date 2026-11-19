import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/config';
import { PRODUCTS } from '@/config';

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  detailed: Array<{ product: Product; quantity: number; lineTotal: number }>;
  itemCount: number;
  subtotal: number;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  isReady: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'reachmc-cart-v1';

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(PRODUCTS.map((p) => p.id));
    return parsed
      .filter(
        (i): i is CartItem =>
          i &&
          typeof i.productId === 'string' &&
          validIds.has(i.productId) &&
          Number.isInteger(i.quantity) &&
          i.quantity > 0
      )
      .map((i) => ({
        productId: i.productId,
        quantity: Math.min(i.quantity, 99),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => load());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private mode) — cart still works in memory
    }
    setIsReady(true);
  }, [items]);

  const add = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
            : i
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, 99) }
              : i
          )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const detailed = useMemo(
    () =>
      items
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          return product
            ? {
                product,
                quantity: item.quantity,
                lineTotal: product.priceInr * item.quantity,
              }
            : null;
        })
        .filter((v): v is { product: Product; quantity: number; lineTotal: number } => v !== null),
    [items]
  );

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = detailed.reduce((sum, d) => sum + d.lineTotal, 0);
    return { items, detailed, itemCount, subtotal, add, remove, setQuantity, clear, isReady };
  }, [items, detailed, add, remove, setQuantity, clear, isReady]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
