# ClassCost — Skipping This Class Costs You $X

A single-page, dependency-free tuition-per-class calculator. Enter your tuition, pick how your school charges, optionally toggle loan-adjusted cost, and download a share card.

**GitHub Repository:** [https://github.com/EKL789Ten/class-cost](https://github.com/EKL789Ten/class-cost)
**Live Deployment:** [https://4542adce.classcost.pages.dev](https://4542adce.classcost.pages.dev)

---

## Stack

- **Vanilla HTML / CSS / JS.** No build step. No framework. No dependencies.
- **Fonts** — Instrument Serif + Inter via Google Fonts CDN.
- **No analytics, no tracking, no localStorage.** All state lives in memory.

## Structure

```
skip-class-cost/
├── index.html          # Single page, semantic, WCAG 2.2 AA
├── style.css           # Design tokens, light/dark, responsive
├── app.js              # Calculator, loan math, canvas share card
├── assets/             # Static assets (og image goes here)
├── scripts/
│   ├── push.sh         # Git commit + push helper
│   └── deploy.sh       # Cloudflare Pages deploy helper
├── wrangler.toml       # Cloudflare Pages config
└── README.md
```

## WCAG 2.2 Level AA compliance

- Semantic landmarks: `<header>`, `<main>`, `<section>`, `<footer>`, ARIA `aria-live` on the result.
- Skip link (SC 2.4.1).
- Every form control has a programmatic `<label>`; fieldsets have `<legend>`.
- Color contrast ≥ 4.5:1 body, ≥ 3:1 large text — in both light and dark.
- Focus states visible on every interactive element (SC 2.4.7, 2.4.11).
- Minimum 44×44px target size on all buttons/inputs (SC 2.5.8).
- Supports 200% zoom, text reflows without horizontal scroll (SC 1.4.10).
- `prefers-reduced-motion` honoured.
- `prefers-color-scheme` default with manual override.
- Language set on `<html>`; lang attribute present.
- Keyboard navigable end-to-end.

## Local dev

```bash
# any static server works — pick one
python3 -m http.server 8000
# or
npx serve .
```

Open <http://localhost:8000>.

## Deploy to Cloudflare Pages

1. One-time setup: install the Cloudflare CLI and authenticate.
   ```bash
   npm i -g wrangler
   wrangler login
   ```
2. Create the Pages project (one-time).
   ```bash
   wrangler pages project create classcost --production-branch=master
   ```
3. Use the helper scripts:
   ```bash
   ./scripts/push.sh   "commit message"   # git add + commit + push
   ./scripts/deploy.sh                    # deploy current folder to Pages
   ```

See `scripts/` for full docs.

## Swapping in real school data

The current `SCHOOLS` list in `app.js` is a 28-school sample hard-coded for speed. For production, replace the constant with a call to the [College Scorecard API](https://collegescorecard.ed.gov/data/documentation/):

```js
const r = await fetch(
  'https://api.data.gov/ed/collegescorecard/v1/schools' +
  '?school.name=' + encodeURIComponent(query) +
  '&fields=school.name,latest.cost.tuition.in_state' +
  '&api_key=<PLACEHOLDER_COLLEGE_SCORECARD_API_KEY>'
);
```

Key is free; register at <https://api.data.gov/signup/>.

## License

MIT (placeholder — swap in whatever you prefer before public launch).
