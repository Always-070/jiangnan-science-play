# Jiangnan Science Play

Three standalone science activities from the Jiangnan-China Wiki. No sign-in, server, or answer submission is required. Progress stays in each visitor's browser.

| Activity | Public page | QR code |
| --- | --- | --- |
| Qinglan Bay strain profile / 青澜湾菌株人格问卷 | [Open questionnaire](https://always-070.github.io/jiangnan-science-play/qinglan-bay/) | [PNG](public/qr/qinglan-bay.png) · [SVG](public/qr/qinglan-bay.svg) |
| 7-DHC 2048 / 代谢合成游戏 | [Play 2048](https://always-070.github.io/jiangnan-science-play/7-dhc-2048/) | [PNG](public/qr/7-dhc-2048.png) · [SVG](public/qr/7-dhc-2048.svg) |
| Steroid Tile Atlas / 甾体三消 | [Play matching game](https://always-070.github.io/jiangnan-science-play/steroid-tile-atlas/) | [PNG](public/qr/steroid-tile-atlas.png) · [SVG](public/qr/steroid-tile-atlas.svg) |

## Changes from the source pages

- The questionnaire and matching game run without the surrounding Wiki navigation. Original colours, illustrations, question content, scoring and matching rules are retained.
- The questionnaire landing content is vertically centered below its language bar on desktop. Mobile pages retain their natural scrolling layout.
- 7-DHC 2048 starts in English on a first visit. EN / 中文 switches interface text, scientific terms, controls and result messages without resetting the board. The selected language is remembered in that browser.
- The original 2048 pointer handler captured clicks intended for buttons in its end-of-game dialog. The handler now leaves those buttons alone.
- Fonts and the questionnaire's nine illustrations are bundled locally. The three page paths work directly on GitHub Pages, including a refresh and QR entry.

## Development

Use Node.js 24 or later:

```sh
npm ci
npm run dev
npm test
npm run qr
npm run build
npm run preview -- --port 4178
```

The preview URL is `http://127.0.0.1:4178/jiangnan-science-play/`.

With Google Chrome installed, run the production-browser checks in a separate terminal:

```sh
npm run test:browser
```

`TEST_BASE_URL` can point to the deployed site. `TEST_ROUND` chooses the local evidence folder under ignored `output/playwright/`. The browser checks use an isolated temporary profile and cover all 24 quiz answers, results, language and progress persistence, matching-game controls, 2048 keyboard/buttons/touch, winning and full-board dialogs, 320/390 px layouts, missing resources and console errors.

`npm run qr` writes 1200 px PNGs and vector SVGs and independently decodes every PNG with jsQR to verify its exact target URL. Change the base URL in `vite.config.ts` and `scripts/generate-qr.mjs` together if moving the site to a differently named repository.

## Publication

GitHub Pages uses the **GitHub Actions** source. `.github/workflows/pages.yml` runs the logic tests, regenerates/verifies QR codes, builds the static site, and deploys `dist/` when `main` changes. No service credentials are included in the site.

## Attribution

Original quiz, artwork and matching game: **Jiangnan-China**, extracted from [jiangnan-china-2026-wiki-dev](https://github.com/Always-070/jiangnan-china-2026-wiki-dev) at commit `c09348690d6e084ba2e2a21b5a9ee938942b988e`. The source repository's CC BY 4.0 licence is retained in [LICENSE](LICENSE). Exact original file hashes are recorded in [source-provenance.json](docs/source-provenance.json).

The 2048 source is the user-supplied `7-DHC-2048-offline.html`; its original SHA-256 is also recorded. Standalone packaging, English/Chinese localization and the dialog interaction repair were added in this repository. The original artwork is unchanged.

The questionnaire's creative-profile explanation and the games' original educational simplifications remain visible in the activities.
