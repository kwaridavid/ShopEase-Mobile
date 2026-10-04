import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./lib/auth";
import { CartProvider, useCart } from "./lib/cart";
import { colors } from "./lib/theme";
import ProductsScreen from "./screens/ProductsScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import OrdersScreen from "./screens/OrdersScreen";
import AccountScreen from "./screens/AccountScreen";

const Tab = createBottomTabNavigator();
const ShopStack = createNativeStackNavigator();
const CartStack = createNativeStackNavigator();

function ShopNav() {
  return (
    <ShopStack.Navigator>
      <ShopStack.Screen name="Products" component={ProductsScreen} options={{ title: "ShopEase" }} />
      <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "" }} />
    </ShopStack.Navigator>
  );
}
function CartNav() {
  return (
    <CartStack.Navigator>
      <CartStack.Screen name="Cart" component={CartScreen} options={{ title: "Your cart" }} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    </CartStack.Navigator>
  );
}
function Tabs() {
  const { count } = useCart();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarIcon: () => null, tabBarIconStyle: { display: "none" }, tabBarLabelStyle: { fontSize: 14, paddingBottom: 10 } }}>
      <Tab.Screen name="ShopTab" component={ShopNav} options={{ title: "Shop" }} />
      <Tab.Screen name="CartTab" component={CartNav} options={{ title: "Cart", tabBarBadge: count > 0 ? count : undefined }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: "Orders", headerShown: true }} />
      <Tab.Screen name="AccountTab" component={AccountScreen} options={{ title: "Account", headerShown: true }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationContainer>
            <Tabs />
            <StatusBar style="dark" />
          </NavigationContainer>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
