import { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import { money, orderRef } from "../lib/format";
import type { Order } from "../lib/types";
import SignInPrompt from "./SignInPrompt";

export default function OrdersScreen() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("orders").select("id, status, total, created_at, order_items(id, product_name, quantity, subtotal)").order("created_at", { ascending: false });
    setOrders((data ?? []) as unknown as Order[]);
  }, [session]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!session) return <SignInPrompt message="Sign in to see your orders." />;
  return (
    <FlatList
      style={{ backgroundColor: colors.paper }}
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 12, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      ListEmptyComponent={<Text style={{ textAlign: "center", color: colors.muted, marginTop: 40 }}>No orders yet.</Text>}
      renderItem={({ item }) => (
        <View style={s.card}>
          <View style={s.head}><Text style={{ fontWeight: "700" }}>{orderRef(item.id)}</Text><Text style={s.status}>{item.status.charAt(0) + item.status.slice(1).toLowerCase()}</Text></View>
          <Text style={{ color: colors.muted }}>{new Date(item.created_at).toLocaleDateString()}</Text>
          {item.order_items.map((i) => <Text key={i.id}>{i.product_name} × {i.quantity}</Text>)}
          <Text style={{ fontWeight: "700", marginTop: 4 }}>Total {money(item.total)}</Text>
        </View>
      )}
    />
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: "#fff", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.line, gap: 3 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  status: { backgroundColor: colors.mint, paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, overflow: "hidden", fontSize: 12, fontWeight: "700" },
});
