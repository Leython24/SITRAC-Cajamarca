---
name: SITRAC Cajamarca Operational Intelligence
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#374559'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f5d71'
  on-tertiary-container: '#c7d6ee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  code-metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
  code-metric-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  code-metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-precision, analytical, and academically rigorous visual language tailored for operations research, freight logistics, and urban traffic simulation in Cajamarca. The aesthetic avoids consumer software trends, decorative gradients, and playful embellishments, drawing strictly from civil engineering command desks, decision support systems (DSS), and mathematical programming interfaces.

Visual attributes embody accuracy, control, and institutional clarity:
- **Atmosphere:** Controlled, high-legibility, structural, and quiet. It fosters focused analytical thinking for solving network flow problems, vehicle routing, and delay minimizations.
- **Visual Style:** Contemporary Technical Pragmatism. It combines subtle boundary strokes, crisp structural dividers, dense information presentation, and specialized data-display tokens.
- **Emotional Intent:** Confidence in complex operational calculations, absolute stability under high cognitive loads, and clean navigational hierarchy between spatial map views, algebraic model summaries, and tabular traffic telemetry.

## Colors

The palette is engineered around high structural contrast and standardized traffic level of service (LOS) semantics. Structural framing relies on deep slate tones, creating an anchored workspace framing the neutral operational canvas.

### Structural & Core Colors
- **Primary (`#1d4ed8`):** Applied to active simulation actions, primary solver triggers, focal analytical highlights, and selected network nodes.
- **Secondary (`#0f172a`):** Governs persistent navigational anchors, header bars, and foundational application scaffolding.
- **Surface & Canvas (`#f8fafc` / `#f1f5f9`):** Neutral architectural backdrops minimizing glare during extended research and model verification sessions.
- **Borders & Dividers (`#e2e8f0` / `#cbd5e1`):** Precise 1px boundary lines ensuring modular clarity without visual weight.

### Traffic State & Operational Classification
Strictly defined semantic tokens communicate mathematical and operational thresholds:
- **Level of Service A/B - Fluid (`#16a34a`):** Normal operating speeds, minimal node delay, acceptable v/c ratios.
- **Level of Service C - Moderate (`#d97706`):** Approaching capacity, heavy-vehicle platooning on gradients.
- **Level of Service D/E - High (`#ea580c`):** Unstable flow, severe freight queueing at critical intersections.
- **Level of Service F - Saturated (`#dc2626`):** Forced breakdown, intersection spillback, gridlock.
- **Critical Node - Blocked / Bottleneck (`#7c3aed`):** Complete blockage, route infeasibility, or physical road obstruction.

## Typography

The typographic hierarchy prioritizes rapid scanning of tabular data, mathematical notations, and transportation parameters:
- **Primary Body and Display (`Inter`):** Selected for neutral geometric proportions, distinct letterforms, and high legibility at dense text sizes. Used across operational overviews, section titles, and narrative model evaluations.
- **Technical & Metric Readouts (`JetBrains Mono`):** Dedicated to computational variables (e.g., $x_{ij}$, capacity $\mu$, demand $\lambda$), simulation timestamps, network link indices, coordinate feeds, and numeric matrices.
- **Tabular Figures:** Monospaced numerical alignment must be enforced across all tables and analytical cards to allow immediate vertical comparison of tonnages, delays, and flow volumes.

## Layout & Spacing

The layout is built on a high-density, multi-pane operational grid. Rather than expansive marketing whitespace, the system optimizes horizontal and vertical density so researchers and dispatchers can cross-examine the GIS corridor view alongside algebraic formulation panels.

### Structural Framework
- **Desktop (>= 1280px):** Fixed left navigation rail (64px collapsed, 240px expanded) paired with a responsive 12-column analytical canvas. Split-screen panels (e.g., Network Graph 60% / Solver Parameters 40%) maintain synchronized vertical scrolling.
- **Tablet (768px - 1279px):** 8-column layout with tabbed context switching between spatial visualizations and computational logs.
- **Mobile (< 768px):** Single-column stacked mode focusing strictly on key performance indicators (KPIs), bottleneck alert queues, and critical parameter outputs.

### Spacing Density
A strict 4px sub-grid with an 8px modular baseline governs internal component padding. Compact paddings (`space-sm` and `space-md`) prevent information drift across high-cardinality data screens.

## Elevation & Depth

Visual hierarchy avoids expressive drop shadows, blur radii, or skeuomorphic lighting models. Depth is established through structural contrast and boundary isolation:

1. **Flat Structural Planes (Level 0):** Background workspace surfaces (`#f8fafc`) rest alongside secondary analytical containers (`#f1f5f9`).
2. **Surface Framing (Level 1):** Cards, parameter groups, and data tables utilize flat white surfaces (`#ffffff`) bounded by precise 1px borders (`#e2e8f0`). No drop shadow is applied at rest.
3. **Transient Elements & Flyouts (Level 2):** Dropdown filters, node inspection cards, and model variable detail popovers utilize a targeted, low-blur ambient shadow (`0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`) overlaid on a 1px border (`#cbd5e1`).
4. **Modals & Execution Overlays (Level 3):** Full solver parameter modals sit above a non-blurred solid scrim (`#0f172a` at 45% opacity) to maintain crisp underlying situational context.

## Shapes

The shape system adopts a disciplined, low-curvature structure (`roundedness: 1` — 0.25rem / 4px base radius) reflecting engineered hardware consoles and technical drawings:
- Standard buttons, input enclosures, table containers, and technical badges share a uniform 4px corner radius.
- Cards, modal dialogs, and large split-pane workspace viewports use 8px (`rounded-lg`), retaining structural cohesion without visual softness.
- Circular elements are restricted strictly to status pips, directional route markers on map canvases, and terminal node indicators.

## Components

### Buttons & Trigger Controls
- **Primary:** Solid `#1d4ed8` fill, white text, 4px corner radius, zero shadow. Hover: `#1e40af`. Active: `#1e3a8a`.
- **Secondary / Technical:** Crisp 1px border (`#cbd5e1`), white background, `#0f172a` text. Hover: `#f1f5f9`.
- **Destructive / Reset:** Bounded 1px outline in `#fca5a5`, text `#dc2626`, hover `#fef2f2`.
- **Sizing:** Compact height profiles (32px default, 28px dense) to suit technical toolbars.

### Data Tables & Matrix Views
- **Headers:** Solid `#f8fafc` background, uppercase 11px label font (`JetBrains Mono`), 1px bottom border (`#cbd5e1`), subtle vertical grid dividers.
- **Rows:** Alternating subtle row backgrounds (`#ffffff` and `#fcfdfd`), height 36px, monospaced numerical cells aligned right, textual labels aligned left.
- **States:** Selected rows utilize a 2px left border in `#1d4ed8` with a `#eff6ff` fill tint.

### State & LOS Indicators (Badges & Chips)
- **Format:** High-legibility pill or low-radius block badge with monospaced text.
- **Composition:** 10% opacity semantic background paired with 100% full-value border and matching high-contrast text (e.g., High Congestion: background `#ffedd5`, border `#ea580c`, text `#9a3412`).
- **Telemetry Indicators:** Include a 6px static circle pip preceding the numeric delay/flow value.

### Form Inputs & Solver Parameters
- **Input Fields:** 32px height, 1px border in `#cbd5e1`, background `#ffffff`. Focused state switches border to `#1d4ed8` with an outline ring of 1px `#bfdbfe`.
- **Labels:** Crisp 12px Inter semi-bold, anchored directly above the field with 4px gap. Units (e.g., `veh/h`, `ton`, `min`) pinned as static monospaced right-side affixes.

### Analytical Cards & Panel Scaffolding
- **Card Structure:** 1px `#e2e8f0` outer boundary, solid `#ffffff` fill, structured header containing analytical title and monospaced KPI tag.
- **Sub-panels:** Dividers within cards maintain 1px solid lines using `#f1f5f9` with no inset margins.