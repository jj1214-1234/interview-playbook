# Devpost submission draft — Interview Playbook (Next Gen Award)

Copy-paste into revenuecat-shipaton-2026.devpost.com. Written in your voice as the entrant; edit
anything that doesn't sound like you before submitting.

---

**Tagline** (one line)

Interview prep that's actually specific — real scripts and question banks, not "be yourself."

---

**Inspiration**

Google quietly shut down its free Interview Warmup tool in April 2026. What's left is either a
$39/month subscription or generic advice — "be confident, be yourself." I wanted something that
reads like it was written by someone who's actually run these interviews: specific scenarios,
real phrasing, scripts you can say out loud.

---

**What it does**

Interview Playbook is ten categories of real interview-prep content: behavioral interview
fundamentals, the STAR method with fully worked example answers, six industry-specific question
banks (tech, sales, healthcare, finance, marketing, customer service), word-for-word
salary-negotiation scripts, and how to close an interview strong — smart questions to ask plus
follow-up message templates. Two categories are free; the other eight unlock with a single
one-time $9.99 purchase. Progress is tracked locally per section so you can see what you've
practiced.

---

**How I built it**

Expo / React Native / TypeScript, with expo-router for navigation and AsyncStorage for local
progress state. RevenueCat's SDK (react-native-purchases) powers the single "Full Playbook"
non-consumable entitlement. The purchase layer runs in a dual mock/real mode — same UI, same
code path, swappable backend — so the full purchase-and-unlock flow works and is fully testable
without a live RevenueCat project connected yet; dropping in a real API key activates real
purchases with zero code changes (details in the repo README).

I'm not a professional engineer — I built this by directing Claude Code (Anthropic's coding
agent) end to end: architecture, all ten content sets, the UI, the RevenueCat integration, and
testing on a real iOS Simulator build. The demo video's screen recording is a genuine simulator
run, not a mockup, and the narration is my own voice.

---

**Challenges I ran into**

Designing the purchases layer without ever touching a live RevenueCat account mid-build — the
mock and real code paths had to be identical from the app's point of view, not a stub that gets
thrown away later.

---

**Accomplishments that I'm proud of**

Every entry across the ten categories is specific and concrete, not generic filler — that's the
entire differentiation from every other interview-tips app. And the purchase flow is genuinely
verified end to end on a real device build (checked out, unlocked, persisted across a full
rebuild), not just described.

---

**What I learned**

[Fill in something true and specific — e.g. what surprised you about RevenueCat's sandbox/testing
tools, or about directing an AI agent through a full app build in one sitting.]

---

**What's next**

Connect a real RevenueCat project and ship to the App Store and Google Play, expand the industry
question banks, and add a few more categories.

---

**Built With** (tags Devpost usually asks for)

react-native, expo, typescript, revenuecat, async-storage, expo-router

---

**Links to have ready**

- Repo (already public, MIT license): https://github.com/jj1214-1234/interview-playbook
- Video: [paste your YouTube/Vimeo link here once uploaded]
