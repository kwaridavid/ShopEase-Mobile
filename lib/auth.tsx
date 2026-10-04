import { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

type Ctx = { session: Session | null; loading: boolean; redirectUrl: string; signInWithGoogle: () => Promise<string | null>; signOut: () => Promise<void> };
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const redirectUrl = Linking.createURL("auth/callback");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    const app = AppState.addEventListener("change", (st) => (st === "active" ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()));
    return () => { sub.subscription.unsubscribe(); app.remove(); };
  }, []);

  /** Returns an error message, or null on success/cancel. */
  async function signInWithGoogle(): Promise<string | null> {
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectUrl, skipBrowserRedirect: true } });
    if (error || !data.url) return error?.message ?? "Could not start sign-in.";
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (res.type !== "success") return null;
    const url = new URL(res.url);
    const code = url.searchParams.get("code");
    if (code) return (await supabase.auth.exchangeCodeForSession(code)).error?.message ?? null;
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const at = hash.get("access_token"), rt = hash.get("refresh_token");
    if (at && rt) return (await supabase.auth.setSession({ access_token: at, refresh_token: rt })).error?.message ?? null;
    return "Sign-in did not return a session. Check the redirect URL in Supabase.";
  }

  return (
    <AuthContext.Provider value={{ session, loading, redirectUrl, signInWithGoogle, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
