import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth";
import { colors } from "../lib/theme";

export default function SignInPrompt({ message }: { message: string }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  return (
    <View style={s.wrap}>
      <Text style={s.text}>{message}</Text>
      <Pressable style={s.btn} disabled={busy} onPress={async () => { setBusy(true); const err = await signInWithGoogle(); setBusy(false); if (err) Alert.alert("Sign-in failed", err); }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Continue with Google</Text>}
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16, backgroundColor: colors.paper },
  text: { fontSize: 16, textAlign: "center", color: colors.ink },
  btn: { backgroundColor: colors.ink, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, minWidth: 220, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});
