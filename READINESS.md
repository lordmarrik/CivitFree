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

- [x] 🔴 **Fixed-width 390 × 780 frame** doesn't adapt to real phone screens.
      ✅ Responsive breakpoint at 767 px now drops the frame to full-bleed.
      Desktop view still shows the framed mockup.
- [x] 🔴 **Notch / Dynamic Island / rounded corner overlap.** ✅ Status bar,
      top bar, and dock now respect `env(safe-area-inset-*)` on phones.
      `viewport-fit=cover` set in `index.html`. (Codex caught a CSS
      cascade bug where the responsive @media block came before the
      base rules and was silently overridden — fixed by moving it to
      the end of the stylesheet.)
- [x] 🔴 **iOS Safari `100vh` quirk.** ✅ `.cf-frame` and `.app-shell` now
      use `100dvh` with `100vh` fallback.
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

- [x] 🔴 **No `manifest.webmanifest`.** ✅ Added at `public/manifest.webmanifest`
      with name, icons, theme color, standalone display mode, portrait
      orientation.
- [x] 🟡 **No app icons.** ✅ SVG icon at `public/icon.svg` (CF in a magenta
      gradient). Works for desktop/Android. **iOS still needs PNG raster
      icons** (180/192/512) for proper "Add to Home Screen" — follow-up
      below.
- [ ] 🟢 **iOS PNG icons.** _(deprioritized — primary user is on Android.)_
      Apple Safari prefers raster PNG for the home-screen icon. Without
      them, iOS may use a screenshot. If iOS support becomes relevant,
      hand-export PNGs at 180×180 (apple-touch-icon), 192×192, and
      512×512 from `public/icon.svg`, drop them in `public/`, and re-add
      the `apple-touch-icon` link + PNG manifest entries.
- [ ] 🟡 **No splash screen.** Briefly shows a white screen on launch.
- [ ] 🟢 **No service worker.** Means no offline capability and slower
      cold loads. Optional unless you want the app to work without internet
      between generations.

## 3. State persistence — "close the tab, lose everything"

- [x] 🔴 **Loaded LoRAs vanish on refresh.** ✅ Persisted to localStorage
      via `usePersisted('loras', …)` in `src/main.jsx`.
- [x] 🔴 **Prompt vanishes on refresh.** ✅ Same; now persisted (also
      negative prompt and selected model).
- [x] 🔴 **Onboarding URL not saved.** ✅ "Done — Start Creating" now
      writes the URL and the picked default model into the persisted
      `settings` object.
- [x] 🟡 **No queue history.** ✅ Queue + Feed now read from ComfyUI's
      own `/history` endpoint, so generations survive page reloads
      and tab switches via the server's storage. Polling every 4 s.
- [ ] 🟡 **Generated images have no local storage strategy.** Images
      are served live from `/view`; if ComfyUI restarts or the user
      goes offline, they're gone. Downloading into IndexedDB or
      saving to the device gallery is still a follow-up.

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
- [x] 🔴 Model card: ✅ now reflects the selected model. ModelPicker emits
      `onSelect`; the chosen name/version/size/base populates the card and
      persists across reloads.
- [x] 🔴 Negative Prompt input ✅ now controlled, with a real placeholder
      ("e.g. blurry, low quality, deformed") and persists across reloads.
- [ ] 🟡 Output Settings: "PNG" and "High" chips have no handlers.
- [ ] 🟡 Advanced → Sampler "Euler a" dropdown: still doesn't open as a
      list, but the displayed text now reflects the Sampler preset chip
      (Fast / Popular). Real searchable dropdown is a follow-up.
- [x] 🔴 Advanced → CFG / Steps / Sampler preset chips ✅ now drive the
      slider next to them. Picking _Creative / Balanced / Precise_
      sets CFG to 3 / 7 / 12; _Fast / Balanced / High_ sets Steps to
      20 / 30 / 50; _Fast / Popular_ sets Sampler to Euler a / DPM++ 2M
      Karras. Moving the slider off-preset deselects the chip.
- [ ] 🟡 Advanced → Seed: hardcoded `687051578` removed. When Random is
      selected, the input is disabled with an "auto" placeholder.
      Custom-seed entry is still uncontrolled (no real seed sent yet
      — wired with ComfyUI integration).
- [ ] 🟡 Advanced → "Select VAE" button — no handler.
- [x] 🔴 **Generate button** (dock) — ✅ wired. Builds a Text→Image
      ComfyUI workflow from the form state, submits to `/prompt`, polls
      `/history` for completion, and shows the result inline. Loading
      spinner while running; visible error banner on failure.
      Requires `Settings → Checkpoint filename` to be set first.

### Screen B — Queue

- [x] 🟢 ✅ Run cards now come from ComfyUI's `/history` endpoint via
      `useComfyHistory` (polled every 4 s). Empty / loading / error
      states are explicit. Times are shown as relative (`5s ago`,
      `12m ago`, etc.) from the entry's status messages. Status badge
      shows _done_ / _running_ / _error_ based on the actual run.
- [x] 🔴 ✅ The eternal-running spinner is gone — status reflects real
      data, so completed runs show "done" and only actually-running
      ones show the spinner.
- [ ] 🟡 Run card head: Info (ⓘ) and Trash buttons — no handlers.
- [x] 🔴 ✅ Run card resource list now displays real LoRA filenames
      pulled from each entry's workflow graph instead of the mock list.
      The `+` button is gone with the mock UI.
- [ ] 🟡 Per-image Download button — no handler.
- [ ] 🟡 Sort row "Select all" + checkbox — visual only.
- [x] 🔴 Image action sheet items that just close: ✅ unwired items now
      show a muted `soon` badge so they read as "coming later" instead
      of "lying about working". _Inpaint_ and the two _Remix_ entries
      remain fully wired.

### Screen C — Feed

- [x] 🟢 ✅ Tiles are now real images flattened from ComfyUI's
      `/history` (newest-first). Each tile renders the actual
      `<img>` from `/view?filename=...`. Tap ⋮ to remix or send to
      inpaint, with the tile's prompt + seed carried through.
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

- [x] 🔴 **Settings: every field is `readOnly`.** ✅ All fields now
      editable and persisted: Backend Profile (toggle), ComfyUI URL
      (text), Default Model / Sampler / Scheduler / Size (selects),
      Steps + CFG (number inputs), Cloud GPU & CivitAI keys (password
      inputs), PC + Phone save paths (text). Persists across reloads.
- [ ] 🟡 Model Library: "Browse CivitAI" tab search input is a stub.
- [ ] 🟡 LoRA Manager: "Browse CivitAI" tab search input is a stub.
- [x] 🟢 About: "Connected" status with green dot is hardcoded. ✅
      Removed; the screen now shows only what we actually know
      (backend URL from settings).

### Model Picker

- [x] 🟡 Local tab now fetches real checkpoint filenames from
      `/object_info/CheckpointLoaderSimple`. Loading / error /
      empty states all visible. Selecting a real entry emits its
      `filename` and updates Screen A's model card + persisted
      `settings.checkpointFilename` together.
- [ ] 🟡 "Browse CivitAI" tab is still a stub (banner notes it
      explicitly now). Wiring real CivitAI search is its own task.
- [ ] 🟡 Per-card Info (ⓘ) and More (⋯) buttons — no handlers.
- [ ] 🟡 Top tabs (FAVORITE / RECENT / LOADED) — removed from the
      Local tab now that the real list is the source of truth; the
      tabs are gone, not lying.
- [ ] 🟡 Sort row, Filters button, Settings gear (browse mode) — no
      handlers.

### LoRA Picker

- [x] 🟡 Local tab now fetches real LoRA filenames from
      `/object_info/LoraLoader`. Selecting an entry adds it to the
      loaded list with its real filename pre-filled, so generation
      no longer fails on missing filenames.
- [ ] 🟡 Filter / Sort / Info / More buttons still inert.

### Onboarding flow

- [x] 🔴 **"Test Connection" is fake** — ✅ now hits
      `${baseUrl}/system_stats` for real. Failure shows the exact error
      including a CORS hint when network errors hit.
- [x] 🔴 The ComfyUI URL the user types is never saved anywhere. ✅ Now
      written to `settings.backendUrl` on Done.
- [x] 🔴 "Pick default model" choice is never saved. ✅ Now written to
      `settings.defaultModelName` on Done.
- [x] 🔴 "Done — Start Creating" closes the modal, discarding everything.
      ✅ Now persists URL + model selection before closing.

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
