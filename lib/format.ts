const code = process.env.EXPO_PUBLIC_CURRENCY || "USD";
const symbols: Record<string, string> = { USD: "$", NGN: "₦", GBP: "£", EUR: "€" };
export const money = (n: number) => `${symbols[code] ?? code + " "}${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
export const orderRef = (id: string) => `SE-${id.slice(0, 8).toUpperCase()}`;
export const DELIVERY_FEE = 5;
export const FREE_DELIVERY_OVER = 100;
export const deliveryFee = (subtotal: number) => (subtotal >= FREE_DELIVERY_OVER || subtotal === 0 ? 0 : DELIVERY_FEE);
