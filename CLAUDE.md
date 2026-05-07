# CivitFree Personal — Project Status

## What's built
- **Screen A**: Generation panel with Text→Image / Img→Img / Inpaint / Upscale tabs
- **Screen B**: Queue with run cards, negative prompts, expandable prompt text
- **Screen C**: Flat image feed
- **Screen D**: Inpainting editor
- **Bottom sheet** action menu (⋮ and wand on thumbnails)
- **Hamburger icon** on logo (menu drawer not yet built)
- **Legend** of what's removed/kept/added vs Civitai

## Decisions made (not yet built)
- Cloud GPU as default backend, local PC as secondary option
- CF logo = hamburger = opens side drawer (Settings, Model Library, LoRA Manager, About)
- Wand is the single "do something to this image" entry point
- Enter = newline, never fires Generate
- Remix / Remix with seed accessible from run info (i) popover — not yet built
- No thumbs up/down anywhere
- X button in top bar — purpose still undefined

## Still to do
- Make remaining buttons interactive (side drawer, model picker, LoRA picker, info popover, fullscreen image viewer, sort/filter dropdowns)
- Remaining audit items:
  - Screen B dock label says "Generate again" — should just say "Generate"
  - Screen D has Inpaint/Outpaint/Variations tabs that overlap with Screen A's mode tabs — needs a decision
  - X button needs a purpose or removal
- Settings / onboarding screen (backend connection flow)
- Backend switcher design in the dock
- LoRA section upgrade (thumbnails + strength sliders + × to remove, per Civitai reference screenshots)

## Reference screenshots saved
- uploads/Screenshot_20260504_154152_Brave.png — Civitai wand menu
- uploads/Screenshot_20260504_153726_Brave.png — Civitai image detail + overflow menu
- uploads/Screenshot_20260504_162545_Brave.png — Civitai model picker
- uploads/Screenshot_20260504_162539_Brave.png — Civitai resource picker
- uploads/Screenshot_20260504_162956_Brave.png — Civitai loaded LoRAs with sliders

## Files
- CivitFree Personal.html — main file
- variant-personal-classic.jsx — Screen A
- variant-personal-gallery.jsx — Screens B, C + old gallery
- variant-personal-inpaint.jsx — Screen D
- shell.jsx — shared chrome (StatusBar, TopBar, Dock)
- icons.jsx — icon set
- controls.jsx — shared form controls
- bottom-sheet.jsx — action menu overlay
- design-canvas.jsx, tweaks-panel.jsx — framework components
