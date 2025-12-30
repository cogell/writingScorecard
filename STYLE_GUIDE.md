# Style Guide

> **Configuration**: Veritas style · Cream base · Forest green accent · Montserrat + Merriweather · Rounded corners · Lucide icons
>
> Based on [shadcn/ui](https://ui.shadcn.com) with Tailwind CSS v3

---

## Quick Start

```bash
# Icons
pnpm add lucide-react
```

Fonts are loaded via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
```

---

## Design Philosophy

**Veritas Style**: Organic, philosophical, and editorial. Inspired by nature and academic tradition. Designed for contemplative reading experiences where clarity and warmth matter.

| Principle | Implementation |
|-----------|----------------|
| Warmth | Cream/beige backgrounds with subtle warmth |
| Nature | Forest green accents evoke growth and truth |
| Readability | Serif body text (Merriweather) for long-form |
| Authority | Sans-serif headings (Montserrat) for clarity |
| Softness | Rounded corners (8-12px) throughout |

---

## Color Palette

### Cream (Base/Neutral)

Warm, paper-like tones with subtle yellow-brown undertones.

| Shade | HSL | Hex | Use |
|-------|-----|-----|-----|
| 50 | `40 33% 99%` | `#fdfcfa` | Light backgrounds |
| 100 | `38 33% 97%` | `#faf8f5` | Subtle backgrounds |
| 200 | `35 30% 94%` | `#f5f1eb` | Card backgrounds |
| 300 | `33 28% 89%` | `#ebe5db` | Borders, dividers |
| 400 | `32 22% 80%` | `#d6cdc0` | Disabled states |
| 500 | `30 15% 67%` | `#b8ad9e` | Placeholder text |
| 600 | `28 12% 51%` | `#8f8377` | Secondary text |
| 700 | `26 12% 38%` | `#6b6156` | Body text |
| 800 | `24 14% 25%` | `#4a4239` | Headings |
| 900 | `28 18% 15%` | `#2d2821` | Deep backgrounds (dark) |
| 950 | `30 20% 8%` | `#1a1612` | True dark |

### Forest Green (Accent/Primary)

Deep, nature-inspired greens for primary actions and focus indicators.

| Shade | HSL | Hex | Use |
|-------|-----|-----|-----|
| 50 | `152 81% 97%` | `#f0fdf6` | Success bg (light) |
| 100 | `147 77% 93%` | `#dcfce8` | Hover states |
| 200 | `150 73% 85%` | `#bbf7d4` | Light accents |
| 300 | `155 55% 70%` | `#89ddb4` | Decorative, ring color |
| 400 | `142 69% 58%` | `#4ade80` | Interactive (hover) |
| 500 | `142 71% 45%` | `#22c55e` | Primary actions |
| 600 | `142 76% 36%` | `#16a34a` | Primary (pressed) |
| 700 | `156 44% 18%` | `#1a4332` | **Primary dark** |
| 800 | `155 51% 20%` | `#14532d` | Deep accent |
| 900 | `154 59% 15%` | `#0f3d22` | Borders (dark) |
| 950 | `145 75% 10%` | `#052e16` | Darkest accent |

---

## CSS Variables

### Tailwind CSS v3 (HSL)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Cream base - Light mode */
    --background: 40 33% 99%;
    --foreground: 24 14% 25%;

    --card: 35 30% 94%;
    --card-foreground: 24 14% 25%;

    --popover: 40 33% 99%;
    --popover-foreground: 24 14% 25%;

    /* Forest green primary */
    --primary: 156 44% 18%;
    --primary-foreground: 40 33% 99%;

    --secondary: 35 30% 94%;
    --secondary-foreground: 26 12% 38%;

    --muted: 33 28% 89%;
    --muted-foreground: 28 12% 51%;

    --accent: 155 55% 70%;
    --accent-foreground: 156 44% 18%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 40 33% 99%;

    --border: 33 28% 89%;
    --input: 33 28% 89%;
    --ring: 155 55% 70%;

    --radius: 0.5rem;

    /* Chart colors */
    --chart-1: 156 44% 18%;
    --chart-2: 142 76% 36%;
    --chart-3: 142 71% 45%;
    --chart-4: 155 55% 70%;
    --chart-5: 155 51% 20%;
  }

  .dark {
    /* Cream/Forest base - Dark mode */
    --background: 28 18% 15%;
    --foreground: 38 33% 97%;

    --card: 30 20% 8%;
    --card-foreground: 38 33% 97%;

    --popover: 30 20% 8%;
    --popover-foreground: 38 33% 97%;

    /* Forest green primary (lighter for dark mode) */
    --primary: 155 55% 70%;
    --primary-foreground: 28 18% 15%;

    --secondary: 24 14% 25%;
    --secondary-foreground: 38 33% 97%;

    --muted: 24 14% 25%;
    --muted-foreground: 30 15% 67%;

    --accent: 156 44% 18%;
    --accent-foreground: 38 33% 97%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 38 33% 97%;

    --border: 26 12% 38%;
    --input: 26 12% 38%;
    --ring: 155 55% 70%;

    /* Chart colors - dark mode */
    --chart-1: 155 55% 70%;
    --chart-2: 156 44% 18%;
    --chart-3: 142 76% 36%;
    --chart-4: 150 73% 85%;
    --chart-5: 155 51% 20%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-serif;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-sans;
  }
}
```

### Tailwind CSS v4 (OKLCH)

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');

@theme inline {
  --font-sans: "Montserrat", system-ui, sans-serif;
  --font-serif: "Merriweather", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --radius: 0.5rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

@layer base {
  :root {
    /* Cream base - Light mode */
    --background: oklch(0.99 0.005 90);
    --foreground: oklch(0.36 0.022 55);

    --card: oklch(0.96 0.012 80);
    --card-foreground: oklch(0.36 0.022 55);

    --popover: oklch(0.99 0.005 90);
    --popover-foreground: oklch(0.36 0.022 55);

    /* Forest green primary */
    --primary: oklch(0.36 0.06 165);
    --primary-foreground: oklch(0.99 0.005 90);

    --secondary: oklch(0.96 0.012 80);
    --secondary-foreground: oklch(0.48 0.025 60);

    --muted: oklch(0.93 0.018 75);
    --muted-foreground: oklch(0.60 0.025 65);

    --accent: oklch(0.83 0.11 162);
    --accent-foreground: oklch(0.36 0.06 165);

    --destructive: oklch(0.577 0.245 27.325);
    --destructive-foreground: oklch(0.99 0.005 90);

    --border: oklch(0.93 0.018 75);
    --input: oklch(0.93 0.018 75);
    --ring: oklch(0.83 0.11 162);

    /* Chart colors */
    --chart-1: oklch(0.36 0.06 165);
    --chart-2: oklch(0.63 0.15 155);
    --chart-3: oklch(0.72 0.17 152);
    --chart-4: oklch(0.83 0.11 162);
    --chart-5: oklch(0.40 0.07 160);
  }

  .dark {
    /* Dark mode */
    --background: oklch(0.26 0.020 55);
    --foreground: oklch(0.98 0.008 85);

    --card: oklch(0.18 0.015 50);
    --card-foreground: oklch(0.98 0.008 85);

    --popover: oklch(0.18 0.015 50);
    --popover-foreground: oklch(0.98 0.008 85);

    --primary: oklch(0.83 0.11 162);
    --primary-foreground: oklch(0.26 0.020 55);

    --secondary: oklch(0.36 0.022 55);
    --secondary-foreground: oklch(0.98 0.008 85);

    --muted: oklch(0.36 0.022 55);
    --muted-foreground: oklch(0.74 0.025 70);

    --accent: oklch(0.36 0.06 165);
    --accent-foreground: oklch(0.98 0.008 85);

    --destructive: oklch(0.577 0.245 27.325);
    --destructive-foreground: oklch(0.98 0.008 85);

    --border: oklch(0.48 0.025 60);
    --input: oklch(0.48 0.025 60);
    --ring: oklch(0.83 0.11 162);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-serif);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-sans);
  }
}
```

---

## Typography

### Font Families

- **Headings**: Montserrat (500-700 weight) - modern, geometric, authoritative
- **Body**: Merriweather (400-700 weight) - highly readable serif, editorial feel
- **Monospace**: JetBrains Mono (for code blocks)

```css
font-family: "Montserrat", system-ui, sans-serif;  /* headings */
font-family: "Merriweather", Georgia, serif;        /* body */
font-family: "JetBrains Mono", ui-monospace, monospace; /* code */
```

### Scale (Veritas - Comfortable Reading)

| Name | Size | Line Height | Font | Weight | Use |
|------|------|-------------|------|--------|-----|
| `xs` | 12px / 0.75rem | 1.5 | Merriweather | 400 | Captions, metadata |
| `sm` | 14px / 0.875rem | 1.6 | Merriweather | 400 | Secondary text |
| `base` | 16px / 1rem | 1.7 | Merriweather | 400 | Body text |
| `lg` | 18px / 1.125rem | 1.6 | Merriweather | 400 | Lead paragraphs |
| `xl` | 20px / 1.25rem | 1.4 | Montserrat | 500 | Section headings |
| `2xl` | 24px / 1.5rem | 1.3 | Montserrat | 600 | Page headings |
| `3xl` | 30px / 1.875rem | 1.2 | Montserrat | 700 | Hero text |
| `4xl` | 36px / 2.25rem | 1.1 | Montserrat | 700 | Display |

### Tailwind Typography Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.6' }],
      base: ['1rem', { lineHeight: '1.7' }],
      lg: ['1.125rem', { lineHeight: '1.6' }],
      xl: ['1.25rem', { lineHeight: '1.4' }],
      '2xl': ['1.5rem', { lineHeight: '1.3' }],
      '3xl': ['1.875rem', { lineHeight: '1.2' }],
      '4xl': ['2.25rem', { lineHeight: '1.1' }],
    },
  },
}
```

---

## Spacing (Veritas - Comfortable)

Editorial spacing for readable, breathing layouts.

| Token | Value | Use |
|-------|-------|-----|
| `1` | 4px | Micro gaps |
| `2` | 8px | Inline spacing, icon gaps |
| `3` | 12px | Tight component padding |
| `4` | 16px | Default component padding |
| `5` | 20px | Section gaps |
| `6` | 24px | Card padding |
| `8` | 32px | Section padding |
| `10` | 40px | Large gaps |

### Component Spacing Guidelines

```
Button padding:    px-4 py-2     (16px 8px)
Input padding:     px-4 py-2.5   (16px 10px)
Card padding:      p-5 or p-6    (20-24px)
Modal padding:     p-6           (24px)
Section gap:       gap-6         (24px)
Form field gap:    gap-4         (16px)
```

---

## Border Radius

Soft, rounded corners throughout for an organic feel.

| Token | Value | Use |
|-------|-------|-----|
| `sm` | 6px / 0.375rem | Small buttons, badges |
| `DEFAULT` | 8px / 0.5rem | Inputs, standard buttons |
| `md` | 10px / 0.625rem | Cards, modals |
| `lg` | 12px / 0.75rem | Large containers |
| `xl` | 16px / 1rem | Hero sections |
| `full` | 9999px | Pills, avatars |

```css
--radius: 0.5rem;
--radius-sm: 0.375rem;
--radius-md: 0.625rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
```

---

## Shadows

Subtle, green-tinted shadows for gentle depth.

```css
/* Light mode */
--shadow-sm: 0 1px 2px 0 rgb(26 67 50 / 0.05);
--shadow: 0 2px 4px 0 rgb(26 67 50 / 0.08), 0 1px 2px -1px rgb(26 67 50 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(26 67 50 / 0.08), 0 2px 4px -2px rgb(26 67 50 / 0.05);
--shadow-lg: 0 10px 15px -3px rgb(26 67 50 / 0.08), 0 4px 6px -4px rgb(26 67 50 / 0.05);

/* Dark mode */
.dark {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
  --shadow: 0 2px 4px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.15);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.25), 0 2px 4px -2px rgb(0 0 0 / 0.15);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.2);
}
```

---

## Icons

### Library: Lucide React

```bash
pnpm add lucide-react
```

### Usage

```tsx
import { Check, X, ChevronDown, Settings, User } from "lucide-react"

// Default size for Veritas style
<Check className="h-4 w-4" />

// In buttons
<Button>
  <Settings className="h-4 w-4 mr-2" />
  Settings
</Button>
```

### Size Guidelines

| Context | Size | Class |
|---------|------|-------|
| Inline with text | 16px | `h-4 w-4` |
| Button icon | 16px | `h-4 w-4` |
| Standalone | 20px | `h-5 w-5` |
| Large/Hero | 24px | `h-6 w-6` |

---

## Component Patterns

### Button

```tsx
// Primary
<button className="inline-flex items-center justify-center px-4 py-2 text-sm font-sans font-medium bg-primary text-primary-foreground hover:bg-[hsl(142_76%_36%)] active:bg-[hsl(155_51%_20%)] rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 disabled:pointer-events-none">
  Button
</button>

// Secondary
<button className="inline-flex items-center justify-center px-4 py-2 text-sm font-sans font-medium bg-secondary text-secondary-foreground hover:bg-[hsl(33_28%_85%)] border border-border rounded-lg transition-colors">
  Button
</button>

// Outline
<button className="inline-flex items-center justify-center px-4 py-2 text-sm font-sans font-medium bg-transparent text-foreground hover:bg-accent border border-border rounded-lg transition-colors">
  Button
</button>

// Ghost
<button className="inline-flex items-center justify-center px-4 py-2 text-sm font-sans font-medium bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
  Button
</button>

// Destructive
<button className="inline-flex items-center justify-center px-4 py-2 text-sm font-sans font-medium bg-destructive text-destructive-foreground hover:bg-red-600 rounded-lg shadow-sm transition-colors">
  Delete
</button>
```

### Input

```tsx
<input
  type="text"
  className="flex h-10 w-full px-4 py-2.5 text-base font-serif bg-background text-foreground border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
  placeholder="Enter text..."
/>
```

### Select

```tsx
<select className="flex h-10 w-full px-4 py-2.5 text-base font-serif bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Card

```tsx
<div className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm">
  <h3 className="text-xl font-sans font-semibold mb-3">Card Title</h3>
  <p className="text-base text-muted-foreground">Card content goes here.</p>
</div>
```

### Badge

```tsx
// Default
<span className="inline-flex items-center px-2.5 py-1 text-xs font-sans font-medium bg-secondary text-secondary-foreground rounded-full">
  Badge
</span>

// Primary
<span className="inline-flex items-center px-2.5 py-1 text-xs font-sans font-medium bg-primary text-primary-foreground rounded-full">
  New
</span>

// Outline
<span className="inline-flex items-center px-2.5 py-1 text-xs font-sans font-medium bg-transparent text-foreground border border-border rounded-full">
  Draft
</span>
```

### Table

```tsx
<table className="w-full text-base font-serif">
  <thead>
    <tr className="border-b border-border">
      <th className="h-12 px-4 text-left font-sans font-medium text-muted-foreground">Header</th>
      <th className="h-12 px-4 text-left font-sans font-medium text-muted-foreground">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="h-12 px-4">Cell</td>
      <td className="h-12 px-4">Cell</td>
    </tr>
  </tbody>
</table>
```

### Form Field

```tsx
<div className="space-y-2">
  <label className="text-sm font-sans font-medium text-foreground">
    Label
  </label>
  <input
    type="text"
    className="flex h-10 w-full px-4 py-2.5 text-base font-serif bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  />
  <p className="text-sm text-muted-foreground">
    Helper text goes here.
  </p>
</div>
```

### Alert

```tsx
// Default
<div className="flex gap-3 p-4 border border-border bg-background text-foreground rounded-lg">
  <Info className="h-5 w-5 mt-0.5 shrink-0" />
  <div>
    <h5 className="text-base font-sans font-medium">Heads up!</h5>
    <p className="text-sm text-muted-foreground mt-1">Alert message here.</p>
  </div>
</div>

// Success (using forest green)
<div className="flex gap-3 p-4 border border-[hsl(155_55%_70%)] bg-[hsl(152_81%_97%)] text-[hsl(156_44%_18%)] rounded-lg">
  <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
  <div>
    <h5 className="text-base font-sans font-medium">Success!</h5>
    <p className="text-sm opacity-80 mt-1">Operation completed.</p>
  </div>
</div>

// Destructive
<div className="flex gap-3 p-4 border border-red-300 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 rounded-lg">
  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
  <div>
    <h5 className="text-base font-sans font-medium">Error</h5>
    <p className="text-sm opacity-80 mt-1">Something went wrong.</p>
  </div>
</div>
```

---

## Dark Mode

### Implementation

```tsx
// Toggle class on <html> element
document.documentElement.classList.toggle('dark')

// Or with next-themes
import { ThemeProvider } from 'next-themes'

<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>
```

### Color Token Mapping

| Token | Light | Dark |
|-------|-------|------|
| `background` | Cream 50 | Cream 900 |
| `foreground` | Cream 800 | Cream 100 |
| `card` | Cream 200 | Cream 950 |
| `muted` | Cream 300 | Cream 800 |
| `border` | Cream 300 | Cream 700 |
| `primary` | Forest 700 | Forest 300 |
| `accent` | Forest 300 | Forest 700 |

---

## Usage with AI

When prompting Claude or other LLMs, include this context:

```
Use my style guide:
- Veritas style: organic, editorial, nature-inspired
- Cream/beige for neutrals (warm paper-like tones)
- Forest green for primary/accent colors (#1a4332 dark, #89ddb4 light)
- Montserrat for headings, Merriweather (serif) for body
- Lucide icons, 16px default size
- Rounded corners: 8px default, 12px for cards
- Comfortable spacing: px-4 py-2 for buttons, p-6 for cards
- Subtle green-tinted shadows for depth
```

---

## Tailwind Config (Complete)

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Montserrat', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.5' }],
      sm: ['0.875rem', { lineHeight: '1.6' }],
      base: ['1rem', { lineHeight: '1.7' }],
      lg: ['1.125rem', { lineHeight: '1.6' }],
      xl: ['1.25rem', { lineHeight: '1.4' }],
      '2xl': ['1.5rem', { lineHeight: '1.3' }],
      '3xl': ['1.875rem', { lineHeight: '1.2' }],
      '4xl': ['2.25rem', { lineHeight: '1.1' }],
    },
    extend: {
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
    },
  },
  plugins: [],
}
```

---

## File Checklist

When setting up a new project:

- [ ] Add Google Fonts link for Montserrat, Merriweather, JetBrains Mono
- [ ] Install lucide-react icons
- [ ] Copy CSS variables to globals.css
- [ ] Update tailwind.config with theme extensions
- [ ] Set `border-radius` values (8px default)
- [ ] Configure dark mode (`class` strategy)
- [ ] Copy component patterns as needed

---

## Sources

- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui Colors](https://ui.shadcn.com/colors)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/colors)
- [Google Fonts - Montserrat](https://fonts.google.com/specimen/Montserrat)
- [Google Fonts - Merriweather](https://fonts.google.com/specimen/Merriweather)
- [Lucide Icons](https://lucide.dev/)
- [The Divinity School](https://www.endemic.org/the-divinity-school/home) - Design inspiration
