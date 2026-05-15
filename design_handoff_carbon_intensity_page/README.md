# Handoff: GB Carbon Intensity Forecast — project page on james-westwood.dev

## Overview

This is the project page for the **GB Carbon Intensity Forecast** — a sub-domain (or sub-route) of `james-westwood.dev`. It's the flagship project on the portfolio: a half-hourly probabilistic forecast of GB grid carbon intensity served from a public API, presented as a long-scrolling page that shows the live model output, explains how it's built, and links to the source.

Page sections, top to bottom:

1. **Sticky header** — wordmark + primary nav (home / projects / writing / about).
2. **Hero + live widget** — page title, lede, SDG-7 badge, API status pill, and the live forecast widget (horizon switcher, three quantile cards, P10/P50/P90 SVG chart, footer chips).
3. **How it works** — five-stage architecture diagram (data → features → model → API → you) with cadence/latency metadata strip.
4. **Explainability** — three diagnostic charts (feature importance, calibration coverage, residual error vs horizon).
5. **Stack & source** — boring-tech stack tags + a links card (GitHub, OpenAPI endpoint, upstream ESO data, training notebook).
6. **Footer** — three columns + copyright/deploy line.

## About the design files

The files in `design/` are **design references** — a working HTML/CSS/JS prototype that demonstrates intended look and behaviour. **They are not production code to ship as-is.** Your task is to recreate this design inside the existing `james-westwood.dev` codebase (or, if the codebase is greenfield, choose the most appropriate framework and implement there) using its established patterns, component primitives, build tooling and data layer.

Specifically:

- The forecast widget in the prototype uses **canned data** (see `scripts/forecast.js` — the `SERIES` object). In production it must call the real forecast API endpoint and re-render on horizon change.
- The three explainability charts in the prototype are **hand-drawn SVG** approximations. The brief calls for **real Plotly figures embedded** from the training notebook — replace the SVGs with Plotly outputs (either a static HTML export, an iframe, or `react-plotly.js` if React).
- The architecture diagram is content-driven and can stay as styled HTML/JSX, but the metadata values (latency, cadence, etc.) should ideally be live or sourced from a small JSON file that CI can update.

## Fidelity

**High-fidelity.** The design system (`design/styles/tokens.css`) is final and shared across the whole portfolio — colours, type scale, spacing, radii and motion tokens are locked. The accent colour is per-page and is set via `<body data-accent="sdg-7">`. Recreate the layout pixel-accurately at the design widths shown.

## Target environment

You'll need to confirm the actual stack on `james-westwood.dev`, but the project is sympathetic to:

- **Framework**: Astro, Next.js (App Router), or SvelteKit. The page is mostly static; a single small island for the live widget is enough — avoid making the whole page interactive.
- **Styling**: Plain CSS with custom properties (the tokens file works as-is). Tailwind is fine if the codebase already uses it — port the tokens to `theme.extend` and keep the `data-accent` mechanism.
- **Charts**: Plotly for the three explainability figures (Plotly.js basic bundle is fine). The forecast widget chart is small enough to keep as inline SVG; if you'd rather use Plotly there too, use a `scattergl` trace with two dashed lines + a filled band trace.
- **Data fetching**: SWR, TanStack Query or a plain `fetch` with `revalidate: 60` — whichever the codebase prefers. Cache the API response for ~60 s.

## Screens / views

The page is a single scrolling document. Each section below is one full-bleed band; content sits inside `.container` (`max-width: 1120px`, gutter `24px`).

### Header (sticky, 64px tall)

- Wordmark: `jw.dev` in JetBrains Mono, weight 700, 16px, letter-spacing -0.01em. The middle dot is `--fg-3`, the `dev` is `--accent`.
- Primary nav: 4 links in JetBrains Mono 13px. Inactive `--fg-2`, hover `--fg-1` with a 1px accent underline. The current page link gets the underline permanently.
- Background: `--bg-0` at 88% opacity with an 8px backdrop blur.
- Border-bottom appears (1px `--border-1`) only after `window.scrollY > 8` — toggle a `data-scrolled="true"` attribute and animate `border-color` over 200ms.

### Hero band

- 24px dotted-grid background (`--grid-bg`) with a top-to-bottom `--bg-0` fade at 50% opacity over the top.
- Content order:
  - **Breadcrumb** (mono 12px caps, `--fg-3`): `james-westwood.dev / projects / gb-carbon-intensity` with `--fg-4` slashes.
  - **Title row** (flex, space-between):
    - Left column: H1 (40px, weight 700, letter-spacing -0.02em), lede (18px `--fg-2`, max-width 64ch), SDG-7 badge (pill, accent-tinted background, lightning-bolt icon).
    - Right column: API status pill — bg `--bg-1`, 1px `--border-1`, 6×6 green dot with a 3px accent-tinted halo, mono 13px text "API live". States: `data-state="ok|loading|error"` swap dot colour and add a 1.4 s pulse animation when loading.
- 32px gap, then the **widget** (see next section).
- Hero bottom border: 1px `--border-1`.

### Widget (the centrepiece)

Card: `--bg-1`, 1px `--border-1`, `--radius-3` (10 px), no shadow.

**Toolbar row** (flex, 16px gap, padding 16px 24px, bottom border):

- Mono 13px label `forecast horizon:` (`--fg-3`).
- 4 horizon buttons — `2 hrs / 4 hrs / 8 hrs / 12 hrs`. Mono 13px medium, padding 8×16, `--radius-1`. Inactive: `--bg-2`, `--fg-2`. Active (`aria-pressed="true"`): accent-tinted background (~14% mix into `--bg-2`), accent text, accent-50% border. Default active = 4 hrs.
- Right-aligned "last refreshed" stack: mono 12px caps `--fg-3` label, then `--fg-1` 13px timestamp.

**Quantile cards row** (3-column grid, no gap, dividing borders):

Each card has padding 24px and contains, top to bottom:
- Label (mono 12px caps `--fg-3`): `P10 — optimistic`, `P50 — median`, `P90 — pessimistic`.
- Value (JetBrains Mono 36 px weight 700, letter-spacing -0.02em) with a small `g/kWh` unit suffix in 13px regular `--fg-3`.
- Foot caption (mono 12px `--fg-3`): `next 30-min period`.

Quantile colours (override the value text colour only):
- P10 → `#4FD1A1` (green)
- P50 → `--accent` (SDG-7 yellow `#FCC30B`)
- P90 → `#F47B60` (red)

Below 600 px, collapse to a single column.

**Chart panel** (padding 24px, bottom border):

- Header row: mono 12px caps title `Quantile forecast — P10 / P50 / P90 uncertainty bands`. Right-aligned legend with 4 swatches (band, P50 line, P10 dashed, P90 dashed).
- The chart itself is a 920×360 SVG (responsive via `preserveAspectRatio="none"` and CSS width 100%). Visual elements, in z-order:
  1. Horizontal gridlines at every y-tick (5 g/kWh step), 1 px `--border-1`, alternate lines at 55% opacity.
  2. Y-axis labels (mono 12 px `--fg-3`) right-aligned 10 px outside the plot.
  3. X-axis time labels (mono 12 px `--fg-3`) under the plot.
  4. **Uncertainty band** between P10 and P90 — fill `rgba(244,123,96,0.16)`, no stroke. Build the path with a Catmull-Rom-to-Bézier smoothing (degree-3) for both edges and close with a `Z`.
  5. **P90 line**: 2 px stroke `#F47B60`, dasharray `6 4`, round caps, smoothed.
  6. **P10 line**: 2 px stroke `#4FD1A1`, dasharray `6 4`, round caps, smoothed.
  7. **P50 line**: 2.5 px solid stroke `--accent`, smoothed.
  8. Dots on every datum: r 3.5 (P10/P90) or r 4 (P50), filled in series colour.

**Footer chips row** (4-column grid, top border):

- Each chip: padding 16px, mono 13px `--fg-2`, 16×16 accent-tinted icon. Right border between chips (none on last). On <980 px: 2-up grid.
- Content (icon + text):
  1. settings/cog → `LightGBM quantile regression`
  2. bar chart → `P10 / P50 / P90 outputs`
  3. clock → `30-min settlement periods`
  4. cloud → `Deployed on Cloud Run`

### How it works (architecture diagram)

- Section padding: 96 px top, 48 px bottom. Top eyebrow row: 24-px accent rule then mono 12-px caps `02 · how it works`. H2 (32 px), then 70-ch lede.
- Outer panel: `--bg-1`, 1 px `--border-1`, `--radius-3`, padding 32 px, dotted-grid background.
- Five **arch-nodes** in a single grid row connected by four chevron icons. Grid template: `1fr 24px 1fr 24px 1fr 24px 1fr 24px 1fr`. On <980 px collapse to single column and rotate the chevrons 90°.
- Each node:
  - bg `--bg-2`, 1 px `--border-1`, `--radius-2`, padding 16 px.
  - Mono 12 px caps step number in `--accent` (`01 · INGEST`, etc.).
  - H4 16 px semibold (`Data`, `Engineering`, `Quantile regressor`, `Forecast service`, `You`).
  - Mono 12 px `--fg-3` description (~12–18 words).
  - Tag pills at the bottom: 11 px mono, 1 px border, 2×6 padding (e.g. `REST`, `5-min cron`).
  - Hover: border becomes `--accent`, bg `--bg-3`, 200 ms.
- **Metadata strip** below the node row, dashed top border, 4-column grid:
  - Cadence — `Retrain nightly · 02:30 UTC` (the `nightly · 02:30 UTC` part is `--accent`).
  - Latency — `p95 182 ms end-to-end` (number accent).
  - Window — `30-min × up to 24 horizons` (number accent).
  - Monitoring — `Pinball loss, drift, freshness` (no accent).

Exact node copy is in the prototype — copy it over verbatim.

### Explainability

- Same eyebrow+H2+lede pattern. Eyebrow: `03 · explainability`.
- Grid: 2-column with named areas:
  - `wide` (full width across the top) — Fig 1 feature importance.
  - `b` (bottom-left) — Fig 2 calibration.
  - `c` (bottom-right) — Fig 3 residuals.
- On <980 px, stack to single column.
- Each `chart-card`: bg `--bg-1`, 1 px `--border-1`, `--radius-2`, padding 24 px. Inside (top to bottom):
  - Mono 12 px caps eyebrow (`Fig. 1 · Feature importance (gain)` etc.).
  - H3 20 px semibold (the chart's punchline — e.g. `Lagged demand and wind dominate`).
  - 14 px `--fg-2` body explaining what the chart shows. Use `<code>` tags around feature names (mono, `--bg-2` background, 1 px border).
  - The plot itself, 280 px tall (320 px on the wide card).

**Fig 1 (Feature importance)** — horizontal bar chart, 920×320. 10 features, plotted by relative gain. Top 2 bars (`demand_lag_30m` 0.31, `wind_forecast_3h` 0.27) in `--accent`; the other 8 in a muted accent (color-mix accent 45% with `--border-1`). Mono 12px feature name labels left of the bars; mono 11px percentage labels right of each bar. Bar height 18 px, `--radius-1`. X-axis ticks at 0.00, 0.10, 0.20, 0.30 with 11 px caption `relative gain`.

**Fig 2 (Calibration)** — coverage of the P10–P90 band by hour-of-day (24 columns). Y-axis 0.65 – 0.90 with gridlines every 0.05. Dashed accent target line at 0.80. Each hour: a column from the target to the empirical value, filled at 55% alpha — green `#4FD1A1` if at/above 0.80, red `#F47B60` if below. Add a 2.5-px dot at the top of each column. X-axis ticks at 00:00, 06:00, 12:00, 18:00, 23:00. Caption `hour of day (UTC)`.

**Fig 3 (Residuals over horizon)** — line chart, mean pinball loss (g/kWh) at horizons {0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12} hours. Y range 0–16. Shade the 0–4 h region in `#4FD1A1` at 6% opacity with the inline label `≤ 4h: stable` (10 px green at 85% alpha). 2.5-px solid accent line, smoothed, with 3.5-px accent dots at every datum. Y-axis caption (rotated -90°): `pinball loss (g/kWh)`. X-axis caption: `forecast horizon`.

When porting to real Plotly, mirror these exact colours, dash patterns, and font sizes.

### Stack & source

- Eyebrow `04 · stack & source`. H2 `Built with boring, observable parts`.
- Two-column grid:
  - **Stack** column: a wrapped flex row of 15 `stack-tag` chips — 13 px mono, 1 px border, 6×10 padding, `--radius-1`, with a 6 × 6 accent dot prefix at 70% alpha. Hover: accent border, `--bg-2` background. Order: `Python 3.12, LightGBM, scikit-learn, pandas, DuckDB, FastAPI, Pydantic, MLflow, Plotly, Docker, Cloud Run, Cloud Scheduler, BigQuery, GitHub Actions, Terraform`.
  - **Source & data** column: a `links-card` (single bordered list, `--bg-1`, `--radius-2`). Each row is an `<a>`: 14 px mono primary label + 11 px caps `--fg-3` sub-label, with an 18 px icon on the left and a `↗` glyph on the right. Hover: bg `--bg-2`, label colour `--accent`. Four rows:
    1. GitHub icon → `github.com/james-westwood/gb-carbon-intensity` / `full source · MIT licence`.
    2. File icon → `api.jw.dev/carbon/v1/forecast` / `OpenAPI 3.1 · JSON · CC-BY 4.0`.
    3. Globe icon → `National Grid ESO carbon intensity API` / `upstream data source`.
    4. Folder icon → `Training notebook (renders on GitHub)` / `EDA, feature plots, calibration`.

### Footer

- Top border 1 px `--border-1`. Padding 48 px top, 32 px bottom.
- 3-column grid (2fr / 1fr / 1fr):
  - About: `jw.dev` heading + a one-liner about the portfolio.
  - Site: 4 nav links.
  - Elsewhere: github / linkedin / rss / email — each with a trailing `↗`.
- Bottom row (top border): copyright on the left, `last deployed 30 Apr 2026 · ● all systems normal` on the right (the bullet is `--accent`).

## Interactions & behaviour

- **Horizon buttons** — clicking sets `aria-pressed="true"` on the clicked button and `false` on the others, then re-renders the chart and updates the three quantile-card values from the first datum of the new series. In production, this should call `GET /carbon/v1/forecast?horizon=N` and redraw from the response.
- **Sticky header** — toggles the bottom border on scroll past 8 px.
- **Status pill** — switches `data-state` based on API health: `ok` → green steady dot, `loading` → amber pulsing (1.4 s ease-in-out), `error` → red steady. Use the API ping result to drive this.
- **Hover** on arch nodes — border to `--accent`, bg to `--bg-3`, 200 ms.
- **Reduced motion** — respect `prefers-reduced-motion: reduce`: drop the status-pill pulse, drop hover transitions, keep state changes instant.
- **Keyboard** — horizon buttons are real `<button>`s, focusable. All anchors get the `--shadow-focus` 2-ring on `:focus-visible`.

## API contract (assumed — confirm against the real service)

```
GET /carbon/v1/forecast?horizon=4
→ 200 OK
{
  "generated_at": "2026-04-30T13:06:00Z",
  "horizon_hours": 4,
  "settlement_period_minutes": 30,
  "model_version": "gb-ci-2026.04.29",
  "points": [
    { "t": "2026-04-30T13:06:00Z", "p10": 74, "p50": 82, "p90": 89 },
    ...
  ]
}
```

The page should:
- Cache responses for 60 s on the client.
- Time-out at 5 s and surface the `error` status pill if the request fails.
- Show a skeleton on the quantile cards and chart on first load.

## State management

For the live widget only — keep it minimal:

- `horizon: 2 | 4 | 8 | 12` (default `4`).
- `data: { points, generatedAt, modelVersion } | null`.
- `status: 'idle' | 'loading' | 'ok' | 'error'`.

No global store needed; co-locate state inside the widget component.

## Design tokens

All tokens live in `design/styles/tokens.css`. Port them verbatim — same names, same values. Highlights:

**Neutral chassis**
- `--bg-0 #0B0F14` page · `--bg-1 #10161D` cards · `--bg-2 #161E27` raised · `--bg-3 #1C2632` code
- `--fg-1 #E6EDF3` primary · `--fg-2 #B6C2CF` secondary · `--fg-3 #7D8B9B` tertiary · `--fg-4 #4A5663` divider
- `--border-1 #1E2630` · `--border-2 #2A3441` · `--border-3 #3A4756`

**Accent (per-page, set on `<body>`):**
- `--accent` defaults to `--sdg-7 #FCC30B`. The full SDG-1 to SDG-17 palette is in tokens.css — override with `<body data-accent="sdg-N">`.
- `--accent-soft` = `color-mix(in oklch, var(--accent) 20%, var(--bg-1))`.
- `--accent-strong` = `color-mix(in oklch, var(--accent) 100%, white 10%)`.
- `--accent-ink #0B0F14` for text on accent fill.

**Quantile palette (used only in the widget + Fig 2):**
- P10 / "good" green `#4FD1A1`
- P90 / "bad" red `#F47B60`
- Band fill `rgba(244,123,96,0.16)`

**Status colours:** deployed `#4C9F38`, in-progress `#FCC30B`, archived `#7D8B9B`, error `#E5243B`.

**Type:** `Inter Tight` (400/500/600/700) for prose and headings; `JetBrains Mono` (400/500/700) for everything mono — wordmark, eyebrows, captions, buttons, axis labels, metadata, tags. Scale: `12 13 14 16 18 20 24 28 32 40` — H1 on the hero is 40 px (above the scale's normal H1 of 32 px) for hero emphasis only.

**Spacing** (4-px base): `4 8 12 16 24 32 48 64 96`.

**Radii:** `4 / 6 / 10 / 9999`. Pill only for status dots.

**Motion:** `--ease cubic-bezier(0.2, 0, 0, 1)`; durations `120 / 200 / 320 ms`.

**Layout:** content max-width `1120 px`; header height `64 px`.

**Background texture:** the dotted-grid (`--grid-bg` / `--grid-size`) is the only texture in the system. Used on the hero and architecture panel only.

## Assets

- `design/assets/logo.svg` and `design/assets/favicon.svg` — copied from the design system. Use them, don't redraw.
- All other graphics are inline SVG (icons in chips, link rows, arrows, hero bolt). They are minimal Lucide-style strokes — replace with the codebase's existing icon set (e.g. `lucide-react`) when porting.
- No raster images, no gradients, no shadows beyond `--shadow-1` (which the page doesn't currently use).

## Files

```
design/
├── GB Carbon Intensity Forecast.html   # the prototype page
├── styles/
│   ├── tokens.css                      # design system — copy verbatim
│   └── page.css                        # all page-specific styles
├── scripts/
│   ├── forecast.js                     # widget rendering + horizon switching
│   ├── explainability.js               # the three SVG diagnostic charts
│   └── page.js                         # sticky-header scroll handler
└── assets/
    ├── logo.svg
    └── favicon.svg
```

## Recommended implementation order

1. **Tokens + base layout.** Drop in `tokens.css`, set up the page shell (header, hero band background, container, footer). Verify type scale and spacing match the prototype at 1280 px width.
2. **Static sections.** Architecture diagram, stack chips, links card, footer. These are pure markup + CSS and don't need state.
3. **Widget chrome.** Toolbar, quantile cards, chart frame, footer chips — without live data. Wire up the horizon-button `aria-pressed` toggle.
4. **Widget data + chart.** Hook up the API call; render the SVG chart from the response. Keep the smoothing logic from `forecast.js` — it gives the chart its character.
5. **Replace explainability SVGs with Plotly.** Either embed the notebook's exported HTML or build the three figures with `react-plotly.js`. Match the colours and dash patterns specified above.
6. **API status pill** — ping the health endpoint every 30 s and update `data-state`.
7. **Reduced-motion + keyboard pass.** Test focus rings on every interactive element.

## Acceptance checklist

- [ ] Pixel-matches the prototype at 1280 px and 1440 px.
- [ ] Live widget calls the real API and renders within 500 ms after data lands.
- [ ] Horizon buttons swap the data without a layout shift.
- [ ] Plotly charts replace the placeholder SVGs.
- [ ] All four `<a>` placeholders in the links card resolve to real URLs.
- [ ] `Lighthouse` ≥ 95 on Performance, Accessibility, Best Practices.
- [ ] Page works without JS for everything except the widget (server-render the markup).
- [ ] `prefers-reduced-motion` is honoured.
