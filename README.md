# Interview Playbook

A structured, real-content interview-prep app. Ten categories: behavioral-interview
fundamentals, the STAR method (with fully worked example answers), six industry-specific
question banks (tech, sales, healthcare, finance, marketing, customer service), word-for-word
salary-negotiation scripts, and how to close an interview strong (smart questions to ask +
follow-up message templates). Two categories are free; the other eight unlock with a single
one-time purchase.

**The pitch:** every other "interview tips" app is generic filler -- "be confident, be
yourself." This one isn't. Every entry is written the way someone who has actually run or sat
through these interviews would write it: specific scenarios, real numbers, real phrasing you
can say out loud. Content quality is the entire product.

**Built for RevenueCat Shipaton 2026 -- Next Gen Award.**

## Demo video

`demo-assets/demo-video.mp4` -- a screen-recorded walkthrough on a real iOS Simulator run
(category list, free-category content, marking a section practiced, the paywall, the unlock,
and the fully-unlocked list), narrated over the top. Recorded against mock-mode purchases (see
"RevenueCat setup" below) -- the flow is identical once a real API key is configured. Built with
[claude-motion-design](https://github.com/howseen-ai/claude-motion-design) for the title/close
cards (HTML + Playwright, no editing app) plus `ffmpeg` for the cut and mix; the build script is
`demo-assets/video/assemble.py`.

## Screenshots

See `demo-assets/screenshots/` for the full set, captured on an iOS Simulator running the
Release build:

| | |
|---|---|
| `01-category-list.png` | Category list -- free categories with progress, locked categories with a lock badge |
| `03-free-category-detail.png` | A free category's content, with a "practiced" checkbox per section |
| `04-paywall.png` | The paywall -- value prop, all 8 locked category titles, price, unlock + restore |
| `05-unlocked-category-content.png` | A previously-locked category, unlocked and readable, right after purchase |
| `06-unlocked-after-clean-rebuild.png` | The unlock persisting across a full rebuild/reinstall |

## Tech stack

- [Expo](https://expo.dev) (TypeScript template), SDK 57
- [expo-router](https://docs.expo.dev/router/introduction/) for file-based navigation
- `@react-native-async-storage/async-storage` for local persistence (practiced-section
  progress, and the mock purchase flag)
- [`react-native-purchases`](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
  (the RevenueCat SDK) for the one-time "Full Playbook" unlock

`react-native-purchases` ships native modules, so this app runs as a **development build**
(`npx expo run:ios` / `npx expo run:android`, or an EAS build) -- it will **not** run inside
plain Expo Go.

## Setup & run (from a clean checkout)

```bash
git clone https://github.com/jj1214-1234/interview-playbook.git
cd interview-playbook

# Installs dependencies. This project ships a committed .npmrc with
# legacy-peer-deps=true, which is required here -- without it, install fails
# on a pre-existing react-dom@19.3.0 vs react@19.2.3 peer conflict inside
# Expo SDK 57's own dependency tree (unrelated to anything this app adds).
npm install

# Optional: only needed to run against a REAL RevenueCat project instead of
# the built-in mock mode. Leave EXPO_PUBLIC_REVENUECAT_API_KEY empty in .env
# (or skip this step entirely) to run in mock mode -- see "RevenueCat setup"
# below.
cp .env.example .env

# Builds and launches the native iOS app on a Simulator (requires Xcode +
# CocoaPods on macOS). First run generates the native ios/ project via Expo's
# Continuous Native Generation, installs Pods, and builds -- this takes
# several minutes the first time.
npx expo run:ios

# Android equivalent (requires Android Studio / an SDK + emulator or device):
npx expo run:android
```

No account, API key, or `.env` file is required to build, run, and demo the entire app --
mock mode (see below) is the default and needs nothing beyond the commands above.

**Troubleshooting:** if `pod install` crashes with a Ruby/Unicode-normalization error during
`npx expo run:ios`, your shell's locale is unset. Run the same command with
`LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios` instead -- this is a common CocoaPods +
macOS shell issue, unrelated to this project.

## RevenueCat setup: mock mode vs. real mode

`lib/purchases.ts` has two complete implementations behind one API, selected automatically:

- **Mock mode** (the default -- what you get with no setup at all): active whenever
  `EXPO_PUBLIC_REVENUECAT_API_KEY` is empty/unset, or `EXPO_PUBLIC_MOCK_PURCHASES=true` is set.
  Purchases are simulated with a realistic ~600-900ms delay and persisted in AsyncStorage --
  there is no RevenueCat account, no App Store/Play Store product, and no network call
  involved anywhere in this path. A small "MOCK MODE" pill appears in the top-right corner of
  every screen so it's never ambiguous which mode is running.
- **Real mode**: active once a real API key is configured (and mock isn't forced). This calls
  the actual `react-native-purchases` SDK -- `Purchases.configure`, `getOfferings`,
  `purchasePackage`, `getCustomerInfo`, `restorePurchases` -- exactly as RevenueCat's own docs
  describe.

**Exact steps to go live with real purchases** (no code changes needed for any of this):

1. Create a free account at [app.revenuecat.com](https://app.revenuecat.com).
2. Create a new Project (e.g. "Interview Playbook").
3. Under that project, add an **Entitlement** with identifier `full_playbook` (this must match
   `ENTITLEMENT_ID` in `lib/purchases.ts` exactly).
4. Add your app (iOS and/or Android) to the project, then add a **Product** with identifier
   `full_playbook_unlock` at **$9.99**, matching a real in-app-purchase product you've created
   in App Store Connect / Google Play Console with that same product ID. Attach it to the
   `full_playbook` entitlement and add it to your current **Offering** as a package -- this is
   what `purchaseFullPlaybook()` looks up by product ID.
5. Copy the project's public API key (Project settings -> API keys -> iOS/Android app-specific
   key) into `.env` as `EXPO_PUBLIC_REVENUECAT_API_KEY`.
6. Rebuild the dev client (`npx expo run:ios` / `run:android`) so the new env var is picked up.

That's it -- `IS_MOCK_MODE` flips to `false` automatically, the "MOCK MODE" badge disappears,
and every screen (paywall, entitlement checks, restore) starts talking to the real SDK with no
further code changes.

## Project layout

```
app/                    expo-router screens (file-based routing)
  index.tsx               category list -- icon, summary, lock badge, "X/Y practiced"
  category/[id].tsx       category detail -- sections, "practiced" checkboxes, progress bar
  paywall.tsx              real paywall -- value prop, included categories, price, unlock + restore
components/             CategoryCard, SectionBody (renders the body markdown-ish convention),
                        ProgressBar, MockModeBadge
constants/theme.ts      color / spacing / radius / type-scale design tokens (single source of truth)
content/                one JSON file per category (content/<id>.json) -- see lib/types.ts for
                        the exact schema every file matches
lib/
  content.ts              CATEGORY_IDS + loaders (getAllCategories/getFreeCategories/getLockedCategories)
  purchases.ts             mock-mode / real-mode purchases (see above)
  progress.ts              AsyncStorage-backed "practiced" progress
  types.ts                 PlaybookCategory / PlaybookSection / progress types
demo-assets/
  screenshots/            captures referenced above
  DEMO_SCRIPT.md          beat-by-beat script for the Shipaton demo video
```

## Status

Feature-complete and independently re-verified: all 10 categories of real content, the full
list/detail/paywall UI, local progress tracking, and both purchase modes are implemented and
working end to end. `npx tsc --noEmit` is clean, the app builds and launches cleanly (Release
configuration, iOS Simulator, no crashes), and the screenshots above were captured from an
actual on-device run of the full flow: browse -> open a free category -> practice a section ->
tap a locked category -> paywall -> mock-purchase -> land in the unlocked category -> reopen
after a full rebuild and confirm the unlock persisted.
