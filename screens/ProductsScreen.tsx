import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../lib/theme";
import { money } from "../lib/format";
import type { Product } from "../lib/types";

export default function ProductsScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    let query = supabase.from("products").select("*").order("name");
    const term = q.trim().replace(/[%,()]/g, "");
    if (term) query = query.ilike("name", `%${term}%`);
    const { data, error } = await query;
    if (error) setError("We couldn't load products. Pull down to retry.");
    else setProducts((data as Product[]).map((p) => ({ ...p, price: Number(p.price) })));
    setLoaded(true);
  }, [q]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  return (
    <View style={s.screen}>
      <TextInput value={q} onChangeText={setQ} placeholder="Search products" style={s.search} autoCapitalize="none" />
      {error && <Text style={s.err}>{error}</Text>}
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 12, gap: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={loaded && !error ? <Text style={s.empty}>No products found.</Text> : null}
        renderItem={({ item }) => (
          <Pressable style={s.card} onPress={() => navigation.navigate("ProductDetail", { product: item })}>
            <Image source={{ uri: item.image_url ?? undefined }} style={s.img} />
            <Text style={s.name} numberOfLines={1}>{item.name}</Text>
            <Text style={s.price}>{money(item.price)}</Text>
            {item.stock_quantity <= 0 && <Text style={s.out}>Out of stock</Text>}
          </Pressable>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  search: { margin: 12, marginBottom: 0, padding: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: "#fff" },
  card: { flex: 1 },
  img: { width: "100%", aspectRatio: 1, borderRadius: 10, backgroundColor: colors.line },
  name: { marginTop: 6, fontWeight: "600", color: colors.ink },
  price: { color: colors.ink },
  out: { color: colors.warn, fontSize: 12 },
  err: { color: colors.warn, padding: 12 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
});
