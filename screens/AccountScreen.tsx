import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";
import { colors } from "../lib/theme";
import SignInPrompt from "./SignInPrompt";

export default function AccountScreen() {
  const { session, loading, signOut, redirectUrl } = useAuth();
  if (loading) return null;
  if (!session) {
    return (
      <View style={{ flex: 1 }}>
        <SignInPrompt message="Use the same Google account as on the website to see the same cart and orders." />
        <Text selectable style={s.debug}>Redirect URL (add this in Supabase if sign-in fails):{"\n"}{redirectUrl}</Text>
      </View>
    );
  }
  return (
    <View style={s.wrap}>
      <Text style={s.name}>{session.user.user_metadata?.full_name ?? "Shopper"}</Text>
      <Text style={{ color: colors.muted }}>{session.user.email}</Text>
      <Pressable style={s.btn} onPress={signOut}><Text style={{ fontWeight: "600" }}>Sign out</Text></Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, padding: 20, gap: 8, backgroundColor: colors.paper },
  name: { fontSize: 22, fontWeight: "700" },
  btn: { marginTop: 16, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.line, backgroundColor: "#fff", padding: 12, borderRadius: 8 },
  debug: { position: "absolute", bottom: 16, left: 16, right: 16, fontSize: 11, color: colors.muted },
});
