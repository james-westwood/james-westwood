# james-westwood.dev — Portfolio Site Plan

## Goal

A personal portfolio site that positions James as a Senior Data/ML Engineer
specialising in production ML systems with a sustainability focus. Target
audience: technical hiring managers at energy, transport, and govtech companies
(Kaluza is the primary target). The GitHub profile README does much of this
work already — the website's job is to be visually compelling and give each
project the space it deserves.

---

## Framework: Astro + Tailwind

| Decision | Rationale |
|---|---|
| **Astro** | Static output (fast, no JS overhead), great MDX support (embed charts and diagrams in project pages), huge portfolio theme ecosystem |
| **Tailwind CSS** | Utility-first, looks clean with minimal config |
| **MDX** | Write project pages in Markdown but embed React components (Plotly charts, Mermaid diagrams, image galleries) |
| **Netlify or Vercel** | Free tier, auto-deploy on push, custom domain (james-westwood.dev) trivial to wire up |

---

## Site structure

```
james-westwood-dev/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Landing page
│   │   ├── projects/
│   │   │   ├── index.astro          # All projects grid
│   │   │   ├── ev-charging.mdx      # EV project detail page
│   │   │   ├── playchitect.mdx
│   │   │   ├── ons-rd-statistics.mdx
│   │   │   ├── sdg-transport.mdx
│   │   │   └── etf-lens.mdx
│   │   └── about.astro              # Extended bio
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── ProjectCard.astro
│   │   ├── TechStack.astro
│   │   ├── ImpactStat.astro         # "4,680 commits · 94 releases" callout blocks
│   │   └── Nav.astro
│   ├── layouts/
│   │   ├── Base.astro
│   │   └── ProjectLayout.astro
│   └── content/                     # Astro content collections
│       └── projects/                # Frontmatter-driven project metadata
├── public/
│   └── images/
│       ├── ev-charging/             # Pipeline diagram, SHAP plots, heatmaps
│       ├── playchitect/
│       └── ons/
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## Landing page sections

### 1. Hero
- Name, title: "Senior Data/ML Engineer"
- One-line positioning: "I build production ML systems that help measure and close
  the gap between where we are and where we need to be on climate."
- CTAs: "See my work" (→ projects) + GitHub link

### 2. Featured projects (3 cards)
Rotate as the work matures. Initial three:
- EV Charging Demand Optimisation (flagship)
- ONS R&D Statistics (biggest production impact)
- playchitect (shows breadth)

Each card: title, one-line description, 3 tech tags, status badge, link.

### 3. The sustainability thread
Lifted and visualised from the GitHub README — the SDG table becomes a visual
timeline/thread showing the through-line: ONS SDG team → transport access →
EV optimisation. Makes the career narrative legible at a glance.

### 4. Open source impact
Three callout numbers:
- **4,680+** commits across ONS R&D Statistics
- **94** production releases
- **20** contributors

### 5. Tech stack
Icon grid. Grouped:
- ML/AI: LightGBM, scikit-learn, LangChain, Transformers, MLflow
- Data Engineering: PySpark, Databricks, DuckDB, Kafka, BigQuery
- Cloud: Azure, GCP, Docker, Terraform
- Languages: Python, Go, SQL

### 6. Contact / footer
LinkedIn, GitHub, email.

---

## Project detail pages

Each project page (MDX) follows the same layout:

```
- Hero: title, subtitle, status badge, GitHub link
- Problem: why this exists (1–2 sentences)
- How it works: pipeline diagram or architecture diagram
- Key visuals: 2–3 charts/screenshots (this is where the EV project graphics live)
- Tech stack: tags
- Results / impact: metrics callouts
- What's next (for in-progress projects)
```

### EV Charging — content plan

| Section | Content | Status |
|---|---|---|
| Hero | Title, SDG badges, GitHub link | Ready |
| Problem | Carbon-aware charging, grid signal | Ready |
| Pipeline diagram | Mermaid flowchart (already built) | Ready |
| Forecast uncertainty bands | P10/P50/P90 chart vs actuals | To build |
| Optimal charging heatmap | Hour × weekday carbon intensity | To build |
| Architecture diagram | Planned cloud architecture PNG | To build |
| Results | Pinball loss vs baselines | To build |
| SHAP explainability | Beeswarm + waterfall | Done (images exist) |

---

## Deployment

1. Deploy to Netlify (free tier)
2. Add custom domain: point `james-westwood.dev` A record → Netlify IP
3. Auto-deploy: every push to `main` triggers a rebuild (~30s)

---

## Build order

| Phase | Tasks |
|---|---|
| 1 — Scaffold | Init Astro project, install Tailwind, pick/adapt a theme, deploy skeleton to Netlify, wire up domain |
| 2 — Landing page | Hero, tech stack, impact stats, sustainability thread |
| 3 — EV project page | Pipeline diagram, existing SHAP images, placeholder sections for future charts |
| 4 — Other project pages | ONS R&D, playchitect, SDG transport |
| 5 — Enrich EV page | Add new charts as they're built in the EV repo |
| 6 — Polish | SEO meta tags, OpenGraph images, mobile layout |

---

## Projects to feature (priority order)

| Project | Why | Status |
|---|---|---|
| EV Charging Demand Optimisation | Flagship, directly targets energy roles | In progress |
| ONS R&D Statistics | Biggest production credibility (4,680 commits, 94 releases) | Live/complete |
| playchitect | Shows ML breadth and personal interests | In progress |
| SDG 11.2.1 Transport Access | Sustainability thread, ONS work | Complete |
| etf-lens | Financial ML, shows breadth | In progress |
| energy_data_windowing | DuckDB / energy data practice | Complete |
