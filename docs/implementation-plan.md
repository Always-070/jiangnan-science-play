# Standalone science activities

Approved scope: extract the three supplied experiences into a new public GitHub repository and publish them with GitHub Pages. Provide three separate QR codes. Preserve original artwork, colours, question scoring and game rules. Remove the surrounding Wiki navigation from the quiz and matching game. Add English/Chinese selection to 2048, with English on first visit and no loss of game progress when switching.

- [x] Locate and extract original source, assets, licence and original tests; record source hashes.
- [x] Add independent HTML entry points at `qinglan-bay/`, `7-dhc-2048/` and `steroid-tile-atlas/`, without Wiki routing or remote asset dependencies.
- [x] Add a regression test showing that the original 2048 page lacks English defaults and language selection; implement complete static/dynamic/accessibility translations.
- [x] Retain original quiz and tile-game logic tests. Exercise the full quiz, matching controls, 2048 keyboard/touch/buttons, state retention, both languages, mobile layouts and missing resources.
- [x] Run two consecutive final rounds after the requested desktop centering adjustment: each passed 49 logic tests, 51 production-browser checks, type check/build and three decoded QR validations. Desktop and mobile screenshots were inspected.
- [x] Create `Always-070/jiangnan-science-play`, push the verified project, configure GitHub Pages Actions, and verify all three public routes. Source commit `63a3133e650c7d0e08c8c60d096840f57af659ad` passed build and deployment in Actions run `41765081294`; the public site passed all 51 browser checks.
- [x] Prepare all three public page links, 1200 px PNG/vector SVG QR codes and the local source folder. Each published PNG was downloaded, byte-compared with its local original, and decoded to its exact public URL. A local ZIP contains all three PNG/SVG pairs and the link manifest.

Implementation: React 18 + TypeScript + Vite for the two existing React pages; retain the original inline 2048 game with a small bilingual dictionary. Bundle the original font families, Bootstrap reset and all nine quiz illustrations. Keep participant answers and game progress in browser local storage; no submission service is introduced.

The original repositories and source HTML are read only. Existing shared Wiki changes are outside this task.
