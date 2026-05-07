# Readiness checklist — what's wrong / missing before this is a real app

Companion to `ANALYSIS.md` (which lists features still to **add**). This file
lists things that are **wrong, missing, or untested** for the existing app to
behave like a real mobile app rather than a polished mockup.

Severity:

- 🔴 **Broken** — affects basic use; must fix before calling this "real"
- 🟡 **Important** — works but feels bad; should fix soon
- 🟢 **Polish** — nice to have; can wait

Status:

- [ ] not done
- [x] done

## 1. Mobile / responsive — "it looks like a phone but isn't a phone app"

- [ ] 🔴 **Fixed-width 390 × 780 frame** doesn't adapt to real phone screens.
      On a phone, the cute device frame floats centered with empty space
      around it. Needs a small-screen breakpoint that drops the frame and
      goes full-bleed.  _File: `src/styles.css` `.cf-frame`._
- [ ] 🔴 **Notch / Dynamic Island / rounded corner overlap.** iOS phones
      have non-rectangular displays. Content currently runs under the
      notch. Needs `safe-area-inset-*` padding on the top bar and dock.
- [ ] 🔴 **iOS Safari `100vh` quirk.** On iOS, `100vh` is taller than the
      visible area because it doesn't subtract the address bar. Causes the
      bottom dock to be hidden under browser chrome. Fix: use `100dvh` (or
      a JS workaround for older iOS).
- [ ] 🟡 **Soft keyboard covers the prompt textarea.** When you tap the
      prompt input on a phone, the on-screen keyboard pops up and hides
      half the form including the Generate button. No handling.
- [ ] 🟡 **Tap targets not audited.** Some icons (esp. in `cf-paint`
      toolbar, `cf-feed-card .more`) may be smaller than the 44 × 44 px
      minimum that's comfortable on a finger.
- [ ] 🟡 **Landscape orientation untested.** Probably looks broken when
      rotated. Phone-shaped frame in landscape on a phone = stretched mess.
- [ ] 🟢 **Tablets and foldables.** Currently looks like a tiny phone in
      the middle of a giant screen. Could either keep that look (legit
      design choice) or scale up.
- [ ] 🟢 **Browser scroll bounce / pull-to-refresh.** Default behavior; may
      conflict with the in-app scroll feel.

## 2. "Add to home screen" / PWA — installable as an app icon

- [ ] 🔴 **No `manifest.webmanifest`.** Without one, browsers won't offer
      "Add to home screen" properly. Need name, icons, theme color, display
      mode (`standalone`).
- [ ] 🔴 **No app icons.** Generic web icon will appear on the home screen
      instead of a CivitFree icon.
- [ ] 🟡 **No splash screen.** Briefly shows a white screen on launch.
- [ ] 🟢 **No service worker.** Means no offline capability and slower
      cold loads. Optional unless you want the app to work without internet
      between generations.

## 3. State persistence — "close the tab, lose everything"

- [ ] 🔴 **Loaded LoRAs vanish on refresh.** State is in-memory only.
- [ ] 🔴 **Prompt vanishes on refresh.** Same.
- [ ] 🔴 **Onboarding URL not saved.** You can type your ComfyUI server
      address into the onboarding screen but the app forgets it the
      moment you close the modal.  _File: `src/screens/Onboarding.jsx`._
- [ ] 🟡 **No queue history.** Mock runs are hardcoded; real generations
      would need somewhere to live (likely IndexedDB or the ComfyUI
      `/history` endpoint).
- [ ] 🟡 **Generated images have no storage strategy.** Once we wire
      ComfyUI, where do images go? Options: ComfyUI-hosted URLs (re-fetch
      every time, brittle), download into IndexedDB (durable, big), use
      the device's gallery (best, needs Save File API).

## 4. Error handling — "things break and it just sits there"

- [ ] 🔴 **ComfyUI unreachable → no error.** When the real client lands,
      pressing Generate against a server that's offline currently throws
      and bubbles up uncaught. Needs visible error state.
- [ ] 🔴 **No loading states.** No spinner on Generate, no progress bar
      tied to real generation, no "Connecting…" indicator.
- [ ] 🔴 **Failed generation invisible.** ComfyUI can return an error
      mid-run; UI has nowhere to show that.
- [ ] 🟡 **No retry logic** for transient network failures.
- [ ] 🟡 **No offline detection** at all. App opened with no Wi-Fi looks
      identical to with Wi-Fi.

## 5. Accessibility

- [ ] 🟡 **Limited screen-reader support.** Some `aria-label`s exist but
      no full audit. The image grid in particular is opaque — every tile
      is "image" with no alt text.
- [ ] 🟡 **Color contrast unchecked.** Mute-on-panel-2 text may fail WCAG
      AA. Worth running through a contrast checker.
- [ ] 🟡 **Fixed pixel font sizes.** Doesn't respect the user's "Larger
      text" / browser zoom preference. Should be `rem`-based.
- [ ] 🟢 **No keyboard navigation audit.** Tab order may jump around.
- [ ] 🟢 **No reduced-motion handling.** The drawer slide-in / sheet
      slide-up animations always run; should respect
      `prefers-reduced-motion`.

## 6. Production polish

- [ ] 🟡 **No real error boundary.** A bug in one screen crashes the
      whole app (white screen). Should catch and show a "Something went
      wrong" panel with a reload button.
- [ ] 🟡 **No build / lint enforcement.** No ESLint, no TypeScript, no
      pre-commit hook, no CI. Easy for typos to ship.
- [ ] 🟡 **No analytics or crash reporting.** When something breaks for
      you on a real device, no way to know without you telling me.
- [ ] 🟢 **Bundle is one big file** (~232 KB). Fine for now; if it grows,
      code-splitting per screen would help cold-load.

## 7. ComfyUI integration — tracked in detail in `ANALYSIS.md`

This is the giant remaining item. Once wired, several rows above stop
being theoretical (loading states, error handling, image storage,
queue history all get real).

## How to use this file

When we finish something, flip the `[ ]` to `[x]` in the same PR that
closes it. When new gaps surface, add them here so they don't get lost.
Top-down order is roughly priority but not strict — fix what makes the
biggest difference for whoever's actually using the app.
