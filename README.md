# ShopEase Mobile (Expo / React Native)

Same Supabase project and same accounts as the website. The cart is stored in the database and pushed to both apps with Supabase Realtime.

## 1. Create the project and install packages
```bash
npx create-expo-app@latest shopease-mobile --template blank-typescript
cd shopease-mobile
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill expo-web-browser expo-linking expo-status-bar
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```
Copy `App.tsx`, `lib/`, `screens/` and `.env.example` from this folder into the project (overwrite the template's `App.tsx`).

## 2. app.json
Add one line inside the `"expo": { ... }` object:
```json
"scheme": "shopease",
```

## 3. Environment
```bash
cp .env.example .env
```
Fill in the same Supabase URL and anon key as the website, and `EXPO_PUBLIC_API_URL` = your Vercel URL (no trailing slash). Restart with `npx expo start -c` after changing `.env`.

## 4. Supabase redirect URLs
Authentication > URL Configuration > Redirect URLs, add:
```
exp://**
shopease://**
```
Then open the app > Account tab: the exact redirect URL is printed at the bottom. If sign-in fails, add that exact string too.

## 5. Run on your phone
1. Install **Expo Go** (Play Store / App Store).
2. `npx expo start`. Phone and computer must be on the same Wi-Fi. If the phone can't connect, use `npx expo start --tunnel`.
3. Scan the QR code (Expo Go on Android, Camera app on iPhone).
