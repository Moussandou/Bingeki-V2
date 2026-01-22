# Design System: Brutalist Manga 🎨

Bingeki V2 adopts a **"Brutalist Manga"** aesthetic. This style combines the raw, bold nature of brutalism with the dynamic, high-energy visual language of shonen manga.

## Core Principles

1.  **Boldness**: Thick borders, high contrast, and uppercase typography.
2.  **Clarity**: UI elements are distinct and separated by clear lines.
3.  **Dynamism**: "Speed lines", sharp angles, and hover effects that feel tactile.

## Design Tokens

All colors are defined as CSS variables in `src/styles/theme.css` to support seamless Dark/Light mode switching.

### Colors
| Variable | Usage | Dark Mode (Default) |
| :--- | :--- | :--- |
| `--color-background` | App background | `#000000` |
| `--color-surface` | Card/Modal backgrounds | `#111111` |
| `--color-primary` | Main accent (Bingeki Red) | `#ff3e3e` |
| `--color-text` | Primary text | `#ffffff` |
| `--color-border-heavy` | Thick borders | `#ffffff` |

### Typography
- **Headings**: `var(--font-heading)` (Impactful, bold sans-serif)
- **Body**: `system-ui` (Readable sans-serif)

## Components Guide

### Buttons
- **Primary**: Solid background (`--color-primary`), uppercase, sharp corners.
- **Ghost**: Transparent background, thick border (`--color-border`).

### Cards & Modals
- **No Glassmorphism**: We avoid blur effects in favor of solid, opaque backgrounds.
- **Borders**: 2px or 3px solid borders only. No soft drop shadows; use hard shadows (`box-shadow: 4px 4px 0 ...`) for depth.

### Mobile First
- **Hit Areas**: All interactive elements are at least 44x44px.
- **Layout**: Stacks vertically on mobile, expands to grid on desktop.
- **Navigation**: Bottom bar for core mobile actions, Top bar for desktop.
