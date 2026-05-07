# Next steps for CivitFree Personal

This repository is now scoped to the personal-only prototype. The next work should turn the mockup into a runnable app without expanding the product scope back toward community/CivitAI features.

## Immediate answer: build the personal app scaffold next

The next useful milestone is not more mockup cleanup. It is a minimal Vite + React app that renders the four personal screens and preserves the existing prototype as the visual reference.

Ship this in small passes:

1. **Scaffold the app**
   - Add `package.json`, Vite, React, and a `src/` directory.
   - Keep `CivitFree Personal.html` unchanged as the canonical exported reference.
   - Add `npm run dev`, `npm run build`, and a smoke-check script.

2. **Port only personal UI files**
   - Move or re-export the personal components into `src/` modules.
   - Start with the shared shell, controls, sheets, pickers, and personal variants.
   - Do not port non-personal `variant-*.jsx` files except as visual reference while replacing hard-coded globals.

3. **Wire prototype-level state**
   - Make hamburger, model picker, LoRA picker, image action sheet, sort/filter, backend switcher, and onboarding work as local React state.
   - Preserve the locked behavior: Enter inserts newlines, QTY is full-width, Screen B/C have no Generate Again bar, and batch actions exclude delete.

4. **Add the ComfyUI boundary**
   - Add a typed/stubbed client layer before any real workflow mutation.
   - Include stubs for connection test, checkpoint/LoRA listing, workflow submission, queue/history polling, and image download.
   - Keep UI code independent from ComfyUI transport details.

5. **Validate with a build**
   - The first scaffold PR should pass `npm run build`.
   - If visual changes are noticeable, capture a screenshot of the rendered app and compare it against `CivitFree Personal.html`.

## What not to do next

- Do not revive community feed, voting, credit pricing, leaderboards, or CivitAI platform-tier features.
- Do not implement real ComfyUI workflow graph mutation before the UI shell and client boundary exist.
- Do not delete the exported prototype files; they are still the visual source of truth.
- Do not add batch delete or top-bar X behavior.

## Recommended first PR title

`Scaffold runnable CivitFree Personal app`

## Recommended first PR acceptance criteria

- `npm install` succeeds.
- `npm run dev` starts a local personal app.
- `npm run build` succeeds.
- The app shows Screens A, B, C, and D from the personal prototype.
- Shell interactions that require no backend are backed by React state.
- A stubbed ComfyUI client module exists, but no real workflow graph mutation is required yet.
