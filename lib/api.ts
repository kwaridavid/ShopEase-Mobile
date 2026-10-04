import { supabase } from "./supabase";

export type CheckoutForm = { customer_name: string; customer_email: string; phone: string; delivery_address: string; city: string; state: string; country: string };
type Result = { ok: true; orderId: string; emailSent: boolean } | { ok: false; error: string };

/** Calls the website's /api/checkout route, so prices, stock, email and the order all use the same server code. */
export async function placeOrder(form: CheckoutForm, items: { productId: string; quantity: number }[]): Promise<Result> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, error: "Please sign in to place your order." };
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ form, items }),
    });
    return (await res.json()) as Result;
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
