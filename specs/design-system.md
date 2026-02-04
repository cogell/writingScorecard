# Design System

[Back to Index](./index.md)

---

The full design system is documented in [`STYLE_GUIDE.md`](../STYLE_GUIDE.md) at the project root. This page summarizes the key decisions and documents how they're applied in the FAST scorecard UI.

## Visual Identity: Veritas

The design language is called **Veritas** -- organic, philosophical, and editorial. Inspired by nature and academic tradition.

| Principle | Implementation |
|-----------|----------------|
| Warmth | Cream/beige backgrounds with subtle yellow-brown undertones |
| Nature | Forest green accents evoke growth and truth |
| Readability | Serif body text (Merriweather) for long-form reading |
| Authority | Sans-serif headings (Montserrat) for clarity and weight |
| Softness | Rounded corners (8-12px) throughout |

---

## Color Palette (Summary)

### Neutrals: Cream

Warm, paper-like tones. Used for backgrounds, cards, borders, and text.

- **Light backgrounds:** Cream 50-100 (`#fdfcfa`, `#faf8f5`)
- **Cards:** Cream 200 (`#f5f1eb`)
- **Borders:** Cream 300 (`#ebe5db`)
- **Body text:** Cream 700 (`#6b6156`)
- **Headings:** Cream 800 (`#4a4239`)

### Accent: Forest Green

Deep, nature-inspired greens for primary actions and score indicators.

- **Primary action (dark):** Forest 700 (`#1a4332`)
- **Primary action (light accent):** Forest 300 (`#89ddb4`)
- **Interactive hover:** Forest 400 (`#4ade80`)
- **Primary button:** Forest 500 (`#22c55e`)

### Score Colors

Scores use standard semantic colors, not the forest green palette:

| Score Range | Color | Hex |
|-------------|-------|-----|
| 7.0+ | Emerald 600 | `#059669` |
| 5.0-6.9 | Emerald 500 | `#10b981` |
| 3.0-4.9 | Amber 600 | `#d97706` |
| < 3.0 | Red 600 | `#dc2626` |

---

## Typography

| Role | Font | Weight | Example Use |
|------|------|--------|-------------|
| Headings | Montserrat | 500-700 | Page titles, section headers, button text |
| Body | Merriweather | 400-700 | Paragraphs, score notes, summaries |
| Monospace | JetBrains Mono | 400-700 | Score numbers, metadata, code |

Fonts loaded via Google Fonts CDN in `index.html`.

---

## Scorecard-Specific Patterns

### Overall score box

The overall score appears in a rounded box with background color matched to the score:

| Score | Background | Text |
|-------|-----------|------|
| 7.0+ | `bg-emerald-100` | `text-emerald-800` |
| 5.0-6.9 | `bg-emerald-50` | `text-emerald-700` |
| 3.0-4.9 | `bg-amber-100` | `text-amber-800` |
| < 3.0 | `bg-red-100` | `text-red-800` |

### Criterion score rows

Each row uses:
- Criterion name: `font-sans font-semibold` (Montserrat)
- Description: `text-sm text-muted-foreground` (Merriweather)
- Calibrated score: Large text, color-coded per the score range
- Provisional score: `text-xs text-muted-foreground` in parentheses

### Metadata footer

Processing details displayed in small monospace text:
```
claude-haiku-4-5  *  2.4s  *  $0.0045  *  4,521 in / 342 out
```

Uses `font-mono text-xs text-muted-foreground`.

---

## Spacing and Layout

- Max content width: constrained to readable measure (~65ch for body text)
- Card padding: `p-6` (24px)
- Section gaps: `gap-6` (24px)
- Score row spacing: `gap-4` (16px) between rows
- Border radius: `rounded-lg` (12px) for cards, `rounded-md` (10px) for inputs

---

## Dark Mode

CSS variables are defined for both light and dark modes in `index.css`. Dark mode uses:
- Cream 900 (`#2d2821`) for backgrounds
- Cream 100 (`#faf8f5`) for text
- Forest 300 (`#89ddb4`) for primary accents

Toggle via `class="dark"` on the `<html>` element. Not yet implemented in the UI (no toggle control exists).

---

## Full Reference

See [`STYLE_GUIDE.md`](../STYLE_GUIDE.md) for:
- Complete color palette with HSL values
- CSS variable definitions (Tailwind v3 and v4)
- All component patterns (buttons, inputs, cards, badges, tables, alerts)
- Shadow definitions
- Icon guidelines (Lucide React)
- Tailwind config
