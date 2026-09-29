# Demo video storyboard

Target runtime: **under 1:50** (hard cap 2:00). Times below are cumulative -- each beat should
land at roughly the timestamp shown, so trim narration rather than let any one beat run long.

Screen-record the iOS Simulator (or a device) directly; no editing beyond straight cuts between
beats is required. Voiceover can be recorded separately and laid over the capture.

---

### 1. Hook (0:00 - 0:15)

**Screen:** static title card or the app icon/splash, nothing else.

**Voiceover:**
> "In April 2026, Google quietly shut down Interview Warmup -- its free interview-practice
> tool. The paid alternative, Big Interview, runs about $39 a month. Everything in between is
> generic advice: 'be confident, be yourself.' Interview Playbook is neither -- real, specific
> content, unlocked once, for ten dollars."

*(Note: use the current, verified figure for the paid competitor above -- $39/month, per its
2026 pricing page -- not an older "$79/mo" figure some sources still repeat.)*

### 2. Category list (0:15 - 0:30)

**Screen:** launch the app into the category list. Scroll slowly top to bottom once so all 10
cards are visible -- two free, eight with "Locked" badges.

**Voiceover:**
> "Ten categories. Behavioral basics and the STAR method are free. Six industry question banks,
> word-for-word salary scripts, and how to close strong -- those unlock in one purchase."

### 3. Prove the content quality (0:30 - 0:55)

**Screen:** tap into "Behavioral Interview Basics" (free). Scroll to a section with real,
specific content -- e.g. "What a Behavioral Interview Actually Is" or one of the STAR worked
examples in "The STAR Method." Hold on one paragraph long enough to read it.

**Voiceover (read one real line from the screen, verbatim):**
> "'A behavioral interview asks you to describe something you actually did, not something you
> would do.' That's the bar for every single entry in this app -- specific, concrete, real
> phrasing, not filler."

Tap the "Mark as practiced" checkbox on that section to show the progress tracking, then back
out to the list to show the "X/12 practiced" counter update on the card.

### 4. Hit the paywall (0:55 - 1:15)

**Screen:** tap a locked category (e.g. "Sales Questions"). It bounces straight to the paywall.
Scroll the paywall screen slowly so all 8 included category titles are readable, then the price
card.

**Voiceover:**
> "Tap anything locked, and you land here: exactly what you get, all eight categories, nine
> ninety-nine, one time -- no subscription."

### 5. Complete the purchase (1:15 - 1:30)

**Screen:** tap "Unlock Full Playbook -- $9.99." Show the brief loading state, then the
"Full Playbook unlocked" confirmation.

**Voiceover:**
> "One tap, and it's yours for good."

*(If recording against mock mode for the demo, that's fine and expected -- RevenueCat's own
sandbox purchase flow looks the same from the user's side in real mode.)*

### 6. Show it unlocked (1:30 - 1:45)

**Screen:** the app auto-navigates into "Sales Questions" -- the exact category that was
tapped. Scroll briefly to show real content is there. Back out to the list to show every lock
badge is gone.

**Voiceover:**
> "Straight back into the category you wanted -- and everything else unlocks with it."

### 7. Close (1:45 - 1:50)

**Screen:** back on the category list, fully unlocked.

**Voiceover:**
> "Interview Playbook: the interview prep tool that actually sounds like someone who's done
> this before."

---

## Shot list / filming notes

- Keep the simulator's status bar clean (use Xcode's "Demo mode" or `xcrun simctl status_bar`
  to set a fixed time / full battery / full signal before recording, exactly as the existing
  screenshots in `demo-assets/screenshots/` already show).
- Every beat above maps to an existing screenshot in `demo-assets/screenshots/` for reference
  framing: `01-category-list.png`, `03-free-category-detail.png`, `04-paywall.png`,
  `05-unlocked-category-content.png`.
- Do the purchase and unlock beats (5-6) in one continuous take if possible -- a visible tap on
  the button through to the unlocked category is more convincing than a cut.
