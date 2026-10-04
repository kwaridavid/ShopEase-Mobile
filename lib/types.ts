export type Product = { id: string; name: string; slug: string; description: string | null; price: number; image_url: string | null; stock_quantity: number };
export type OrderItem = { id: string; product_name: string; quantity: number; subtotal: number };
export type Order = { id: string; status: string; total: number; created_at: string; order_items: OrderItem[] };
