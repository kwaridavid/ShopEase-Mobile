import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { colors } from "../lib/theme";
import { money } from "../lib/format";
import type { Product } from "../lib/types";

export default function ProductDetailScreen({ route, navigation }: any) {
  const p: Product = route.params.product;
  const { session } = useAuth();
  const { add, items } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const inCart = items.find((i) => i.productId === p.id)?.quantity ?? 0;
  const room = p.stock_quantity - inCart;

  async function onAdd() {
    if (!session) {
      Alert.alert("Sign in first", "Your cart is saved to your account so it syncs with the website.", [
        { text: "Cancel", style: "cancel" }, { text: "Sign in", onPress: () => navigation.navigate("AccountTab") },
      ]);
      return;
    }
    setBusy(true); await add(p, qty); setBusy(false); setQty(1);
    Alert.alert("Added to cart", p.name, [{ text: "Keep shopping" }, { text: "View cart", onPress: () => navigation.navigate("CartTab") }]);
  }

  return (
    <ScrollView style={{ backgroundColor: colors.paper }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Image source={{ uri: p.image_url ?? undefined }} style={s.img} />
      <Text style={s.title}>{p.name}</Text>
      <Text style={s.price}>{money(p.price)}</Text>
      <Text style={{ color: p.stock_quantity <= 0 ? colors.warn : "#047857" }}>
        {p.stock_quantity <= 0 ? "Out of stock" : p.stock_quantity <= 5 ? `Only ${p.stock_quantity} left` : "In stock"}
      </Text>
      <Text style={s.desc}>{p.description}</Text>
      {p.stock_quantity > 0 && (
        <View style={s.row}>
          <Pressable style={s.step} onPress={() => setQty(Math.max(1, qty - 1))}><Text style={s.stepText}>−</Text></Pressable>
          <Text style={s.qty}>{qty}</Text>
          <Pressable style={s.step} onPress={() => setQty(Math.min(Math.max(room, 1), qty + 1))}><Text style={s.stepText}>+</Text></Pressable>
        </View>
      )}
      <Pressable style={[s.btn, (p.stock_quantity <= 0 || room < 1 || busy) && { opacity: 0.5 }]} disabled={p.stock_quantity <= 0 || room < 1 || busy} onPress={onAdd}>
        <Text style={s.btnText}>{p.stock_quantity <= 0 ? "Out of stock" : room < 1 ? "All stock in cart" : "Add to cart"}</Text>
      </Pressable>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  img: { width: "100%", aspectRatio: 1, borderRadius: 12, backgroundColor: colors.line },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink },
  price: { fontSize: 20, fontWeight: "600", color: colors.ink },
  desc: { color: colors.ink, lineHeight: 22 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  step: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 22 }, qty: { fontSize: 18, minWidth: 24, textAlign: "center" },
  btn: { backgroundColor: colors.ink, padding: 16, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
