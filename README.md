# Interview Playbook

A structured, real-content interview-prep app: ten focused categories covering behavioral-interview
fundamentals, the STAR method, industry-specific question banks (tech, sales, healthcare, finance,
marketing, customer service), word-for-word salary-negotiation scripts, and how to close an interview
strong. Two categories are free; the rest unlock with a single one-time purchase.

**Status:** in progress -- initial project scaffold only. Content and UI are being built next.

## Stack

- [Expo](https://expo.dev) (TypeScript)
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- `@react-native-async-storage/async-storage` for local persistence (progress tracking, mock purchase state)
- [`react-native-purchases`](https://www.revenuecat.com/docs/getting-started/installation/reactnative) (RevenueCat SDK) for the one-time "Full Playbook" unlock

`react-native-purchases` has native modules, so this app runs via an Expo Dev Client
(`npx expo run:ios` / `npx expo run:android`) -- it will **not** run inside plain Expo Go.

## Purchases: mock mode vs. real mode

`lib/purchases.ts` supports the app running fully, with no RevenueCat account, via a local
**mock mode**: purchases are simulated with a short delay and stored in AsyncStorage. See
`.env.example` for how mock mode is selected. A small "MOCK MODE" badge appears on-screen
whenever it's active, so it's never ambiguous which mode is running.

## Project layout

```
app/            expo-router screens (file-based routing)
components/     shared UI components
content/        one JSON file per category (content/<id>.json), fixed schema -- see lib/types.ts
lib/            purchases.ts, content.ts, types.ts
```
