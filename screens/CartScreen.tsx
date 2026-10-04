import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { colors } from "../lib/theme";
import { money } from "../lib/format";
import SignInPrompt from "./SignInPrompt";

export default function CartScreen({ navigation }: any) {
  const { session } = useAuth();
  const { items, loading, subtotal, setQuantity, remove } = useCart();
  if (!session) return <SignInPrompt message="Sign in to see your cart. It's the same cart you use on the website." />;
  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (items.length === 0) return <View style={s.empty}><Text style={{ color: colors.muted }}>Your cart is empty.</Text></View>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item }) => (
          <View style={s.row}>
            <Image source={{ uri: item.image ?? undefined }} style={s.img} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={{ color: colors.muted }}>{money(item.price)} each</Text>
              <View style={s.qtyRow}>
                <Pressable style={s.step} onPress={() => setQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}><Text style={s.stepText}>−</Text></Pressable>
                <Text style={{ minWidth: 22, textAlign: "center" }}>{item.quantity}</Text>
                <Pressable style={s.step} onPress={() => setQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock}><Text style={s.stepText}>+</Text></Pressable>
                <Pressable onPress={() => remove(item.productId)}><Text style={{ color: colors.warn, marginLeft: 10 }}>Remove</Text></Pressable>
              </View>
            </View>
            <Text style={{ fontWeight: "700" }}>{money(item.price * item.quantity)}</Text>
          </View>
        )}
      />
      <View style={s.footer}>
        <View style={s.totalRow}><Text style={{ fontSize: 16 }}>Subtotal</Text><Text style={{ fontSize: 16, fontWeight: "700" }}>{money(subtotal)}</Text></View>
        <Pressable style={s.btn} onPress={() => navigation.navigate("Checkout")}><Text style={s.btnText}>Checkout</Text></Pressable>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
  row: { flexDirection: "row", gap: 12, backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.line },
  img: { width: 72, height: 72, borderRadius: 8, backgroundColor: colors.line },
  name: { fontWeight: "600", color: colors.ink },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  step: { width: 34, height: 34, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  stepText: { fontSize: 18 },
  footer: { padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "#fff" },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  btn: { backgroundColor: colors.ink, padding: 16, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
