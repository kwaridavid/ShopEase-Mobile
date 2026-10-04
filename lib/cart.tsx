import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";

export type CartItem = { productId: string; name: string; price: number; image: string | null; stock: number; quantity: number };
type Row = { product_id: string; quantity: number; products: { name: string; price: number; image_url: string | null; stock_quantity: number } | null };
type Ctx = {
  items: CartItem[]; count: number; subtotal: number; loading: boolean;
  add: (p: { id: string; name: string; price: number; image_url: string | null; stock_quantity: number }, qty?: number) => Promise<void>;
  setQuantity: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
};
const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(items);
  ref.current = items;

  const refresh = useCallback(async () => {
    if (!userId) { setItems([]); return; }
    const { data } = await supabase.from("cart_items")
      .select("product_id, quantity, products(name, price, image_url, stock_quantity)")
      .eq("user_id", userId).order("created_at");
    setItems(((data ?? []) as unknown as Row[]).filter((r) => r.products).map((r) => ({
      productId: r.product_id, name: r.products!.name, price: Number(r.products!.price), image: r.products!.image_url,
      stock: r.products!.stock_quantity, quantity: Math.min(r.quantity, r.products!.stock_quantity),
    })).filter((i) => i.quantity > 0));
  }, [userId]);

  useEffect(() => {
    if (!userId) { setItems([]); return; }
    setLoading(true);
    refresh().finally(() => setLoading(false));
    // Realtime: changes made on the website show up here instantly.
    const channel = supabase.channel(`cart-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, () => { refresh(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, refresh]);

  const add: Ctx["add"] = useCallback(async (p, qty = 1) => {
    if (!userId) return;
    const existing = ref.current.find((i) => i.productId === p.id);
    const quantity = Math.min(p.stock_quantity, (existing?.quantity ?? 0) + qty);
    if (quantity < 1) return;
    await supabase.from("cart_items").upsert({ user_id: userId, product_id: p.id, quantity }, { onConflict: "user_id,product_id" });
    await refresh();
  }, [userId, refresh]);

  const setQuantity = useCallback(async (id: string, qty: number) => {
    const item = ref.current.find((i) => i.productId === id);
    if (!userId || !item) return;
    await supabase.from("cart_items").update({ quantity: Math.max(1, Math.min(item.stock, qty)), updated_at: new Date().toISOString() }).eq("user_id", userId).eq("product_id", id);
    await refresh();
  }, [userId, refresh]);

  const remove = useCallback(async (id: string) => {
    if (!userId) return;
    await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", id);
    await refresh();
  }, [userId, refresh]);

  const value = useMemo<Ctx>(() => ({
    items, loading, add, setQuantity, remove, refresh,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.quantity * i.price, 0),
  }), [items, loading, add, setQuantity, remove, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
