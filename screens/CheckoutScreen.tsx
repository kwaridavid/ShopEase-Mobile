import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../lib/auth";
import { useCart } from "../lib/cart";
import { placeOrder, type CheckoutForm } from "../lib/api";
import { colors } from "../lib/theme";
import { deliveryFee, money } from "../lib/format";

const FIELDS: { key: keyof CheckoutForm; label: string; keyboard?: "email-address" | "phone-pad" }[] = [
  { key: "customer_name", label: "Full name" }, { key: "customer_email", label: "Email", keyboard: "email-address" },
  { key: "phone", label: "Phone", keyboard: "phone-pad" }, { key: "delivery_address", label: "Delivery address" },
  { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "country", label: "Country" },
];

export default function CheckoutScreen({ navigation }: any) {
  const { session } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const [form, setForm] = useState<CheckoutForm>({
    customer_name: session?.user.user_metadata?.full_name ?? "", customer_email: session?.user.email ?? "",
    phone: "", delivery_address: "", city: "", state: "", country: "",
  });
  const [busy, setBusy] = useState(false);
  const fee = deliveryFee(subtotal);

  async function submit() {
    const missing = FIELDS.find((f) => form[f.key].trim().length < 2);
    if (missing) return Alert.alert("Missing details", `Please enter: ${missing.label}`);
    if (!/^\S+@\S+\.\S+$/.test(form.customer_email)) return Alert.alert("Check your email", "Enter a valid email address.");
    setBusy(true);
    const res = await placeOrder(form, items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
    setBusy(false);
    if (!res.ok) return Alert.alert("Couldn't place order", res.error);
    await refresh(); // the server already emptied the cart (and the website's cart with it)
    Alert.alert("Order placed!", "A confirmation email is on its way.", [{ text: "View orders", onPress: () => navigation.getParent()?.navigate("OrdersTab") }]);
    navigation.popToTop();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ backgroundColor: colors.paper }} contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        {FIELDS.map((f) => (
          <View key={f.key}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput style={s.input} value={form[f.key]} keyboardType={f.keyboard} autoCapitalize={f.keyboard ? "none" : "words"} onChangeText={(v) => setForm({ ...form, [f.key]: v })} />
          </View>
        ))}
        <View style={s.summary}>
          <View style={s.line}><Text>Subtotal</Text><Text>{money(subtotal)}</Text></View>
          <View style={s.line}><Text>Delivery</Text><Text>{fee === 0 ? "Free" : money(fee)}</Text></View>
          <View style={s.line}><Text style={{ fontWeight: "700" }}>Total</Text><Text style={{ fontWeight: "700" }}>{money(subtotal + fee)}</Text></View>
        </View>
        <Pressable style={[s.btn, busy && { opacity: 0.6 }]} disabled={busy || items.length === 0} onPress={submit}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Place order</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  label: { fontWeight: "600", marginBottom: 4, color: colors.ink },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 12, backgroundColor: "#fff" },
  summary: { backgroundColor: "#fff", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.line, gap: 6 },
  line: { flexDirection: "row", justifyContent: "space-between" },
  btn: { backgroundColor: colors.ink, padding: 16, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
