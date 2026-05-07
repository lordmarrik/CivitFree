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

## 8. Per-screen interaction audit — what works vs what doesn't

Walked the code screen by screen. Each item is a button or input that
**looks tappable / interactive but doesn't actually do anything (yet)**.
Severity reuses the same scheme — 🔴 actively misleading / 🟡 dead
button / 🟢 hardcoded display only.

### Screen A — Generate

- [ ] 🟡 Bookmark icon (top right) — no handler.
- [ ] 🟡 "Local pipeline · ComfyUI · CUDA" pill — looks tappable, isn't.
- [ ] 🔴 Video and Music modality tabs — selectable, but no UI exists for
      them. Tapping highlights the icon and shows the same Image UI.
- [ ] 🔴 Img → Img tab: "Denoise strength 0.55" bar is a fake static
      `<div>`, not an interactive slider.
- [ ] 🔴 Img→Img / Inpaint / Upscale tabs: "Tap to choose" image picker
      has no handler — you can't actually choose an image.
- [ ] 🔴 Inpaint tab: hint text says "Tap Open editor…" but there is no
      Open editor button.
- [ ] 🔴 Upscale tab: 2× / 3× / 4× chips visually look interactive
      (one is highlighted) but no handlers — you can't pick a different
      multiplier.
- [ ] 🔴 Model card: hardcoded "HomoSimile XL v4.0". The Change button
      opens the picker, but selecting any model in the picker just closes
      the sheet — the card never actually changes.
- [ ] 🔴 Negative Prompt input has `defaultValue="(negative)"` — that
      "(negative)" looks like debug text. Field is also uncontrolled, so
      typing into it doesn't connect to anything.
- [ ] 🟡 Output Settings: "PNG" and "High" chips have no handlers.
- [ ] 🔴 Advanced → Sampler "Euler a" dropdown: looks like a dropdown,
      doesn't open anything.
- [ ] 🔴 Advanced → CFG / Steps / Sampler preset chips
      (Creative/Balanced/Precise, Fast/Balanced/High, Fast/Popular):
      tapping one highlights it but doesn't change the slider below it.
      Two unconnected controls staring at each other.
- [ ] 🔴 Advanced → Seed: `defaultValue="687051578"` is hardcoded;
      tapping "Random" doesn't generate a random seed.
- [ ] 🟡 Advanced → "Select VAE" button — no handler.
- [ ] 🔴 **Generate button** (dock) — no handler. (Expected; needs
      ComfyUI.)

### Screen B — Queue

- [ ] 🟢 The 3 run cards are hardcoded mock data. Whatever you do on
      Screen A, Queue never reflects it. (Will be fixed by real ComfyUI
      `/history`.)
- [ ] 🔴 The "14:21 · running" status indicator spins forever — no
      state ever finishes it.
- [ ] 🟡 Run card head: Info (ⓘ) and Trash buttons — no handlers.
- [ ] 🔴 Run card resource list `+` buttons — no handlers. Looks like
      it should add the resource as a LoRA but doesn't.
- [ ] 🟡 Per-image Download button — no handler.
- [ ] 🟡 Sort row "Select all" + checkbox — visual only.
- [ ] 🔴 Image action sheet items that just close: _Image Variations,
      Image to Image, Face Fix, Upscale, Remove Background, Image to
      Video, Download, Delete_. Eight items that look like distinct
      actions but all do the same thing (nothing).

### Screen C — Feed

- [ ] 🟢 12 hardcoded `[palette, seed]` tiles. No real data flow.
- [ ] Same dead handlers as Queue's FeedCard / action sheet (above).

### Screen D — Inpaint editor

- [ ] 🔴 Top bar shows the **brush icon highlighted as active**, but
      brush is Screen A's icon. Even when you're on Screen D, the chrome
      says "you're on A." Confusing.
- [ ] 🔴 The mask "blob" on the canvas is a fixed, decorative SVG —
      tapping brush/eraser/lasso/wand changes which tool icon is
      highlighted but you can't actually paint. The mask doesn't change.
- [ ] 🟡 Undo / Redo / Maximize buttons (canvas top bar) — no handlers.
- [ ] 🔴 "Replace with" / "Fill with" textareas use `defaultValue` —
      uncontrolled, typing doesn't persist anywhere.
- [ ] 🟡 "Match source" / "Soft edges" output chips — no handlers.
- [ ] 🟡 Outpaint direction summary chips at bottom (↑ Top / ↓ Bottom /
      etc.) — visual only; the actual toggles are the arrow buttons
      inside the canvas.
- [ ] 🔴 Inpaint / Outpaint / Generate Variations dock buttons — no
      handler. (Expected; needs ComfyUI.)

### Drawer (hamburger menu)

- [ ] 🔴 **Settings: every field is `readOnly`.** Backend Profile,
      ComfyUI URL, default model, sampler, scheduler, steps, CFG, size,
      Cloud GPU credentials, CivitAI API key, save paths — none of them
      can be changed. The whole Settings screen is a display-only fake.
- [ ] 🟡 Model Library: "Browse CivitAI" tab search input is a stub.
- [ ] 🟡 LoRA Manager: "Browse CivitAI" tab search input is a stub.
- [ ] 🟢 About: "Connected" status with green dot is hardcoded text,
      regardless of actual connection.

### Model Picker

- [ ] 🔴 "Browse CivitAI" tab is fake — it's filtering a hardcoded
      array of 4 names, not calling any API.
- [ ] 🟡 Per-card Info (ⓘ) and More (⋯) buttons — no handlers.
- [ ] 🔴 Top tabs (FAVORITE / RECENT / LOADED) highlight on tap but
      don't actually filter the list.
- [ ] 🟡 Sort row, Filters button, Settings gear (browse mode) — no
      handlers.

### LoRA Picker

- [ ] Same pattern as Model Picker (Filter / Sort / Info / More dead).
      Adding to the loaded list works (just shipped).

### Onboarding flow

- [ ] 🔴 **"Test Connection" is fake** — it always succeeds after a
      1.2-second wait, regardless of the URL typed.
- [ ] 🔴 The ComfyUI URL the user types is never saved anywhere.
- [ ] 🔴 "Pick default model" choice is never saved.
- [ ] 🔴 "Done — Start Creating" closes the modal, discarding everything.

### Backend switcher (sheet from the dock GPU pill)

- [ ] 🔴 Choosing Local GPU / Cloud GPU updates the sheet's local state,
      but nothing else in the app reflects the choice. Generation
      screen's dock still hardcodes `gpu="Cloud GPU"`.

### Sort / Filter sheets

- [ ] 🔴 Sort sheet: choosing Newest/Oldest doesn't actually re-sort
      anything; the choice never leaves the sheet.
- [ ] 🔴 Filter sheet: "Apply Filters" button closes the sheet without
      filtering anything.

### Top-level chrome

- [ ] 🟢 StatusBar time "14:22" is hardcoded. Doesn't show real time.
- [ ] 🔴 TopBar's "active screen" highlight is wrong on Screen D
      (highlights brush instead of nothing or D).
- [ ] 🟡 The "First-run setup" button in the screen-tabs row above the
      phone is labeled just `·` (a dot). Unreadable.

---

That's roughly 50 distinct dead-or-misleading interactions across the
app. The 🔴 ones are the highest priority because they actively lie to
the user (button looks like it does something, doesn't). The 🟡 ones
are honest "not done yet" gaps. The 🟢 ones are hardcoded display data
that'll be replaced when the backend lands.

Most 🔴 items in **Settings** and **Onboarding** are particularly
important because they're how a real user would set up the app for the
first time — and right now neither one persists anything they enter.

## How to use this file

When we finish something, flip the `[ ]` to `[x]` in the same PR that
closes it. When new gaps surface, add them here so they don't get lost.
Top-down order is roughly priority but not strict — fix what makes the
biggest difference for whoever's actually using the app.
