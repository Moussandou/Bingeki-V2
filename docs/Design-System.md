# Bingeki V2 Design System: Surgical Specifications 🧬

This document provides a surgical-level technical breakdown of the **Brutalist Manga** design system. It is intended for developers maintaining the core UI primitives and implementing new features.

---

## 1. Style Architecture

Styling is modularized across four core CSS files located in `src/styles/`:

| File | Responsibility |
| :--- | :--- |
| `tokens.css` | Raw design tokens (colors, spacing, typography, effects). |
| `animations.css` | All `@keyframes`, easing functions, and transition utilities. |
| `manga-theme.css` | Domain-specific manga effects (Panels, Halftones, Speedlines). |
| `global.css` | Reset, high-level responsive logic, and common utility classes. |

---

## 2. UI Primitive API Reference

### 2.1 Card Component (`<Card />`)
Low-level container for all layout pieces.

- **Status**: ✅ Production Ready
- **Path**: `src/components/ui/Card.tsx`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'default' \| 'glass' \| 'manga'` | `'default'` | Determines the border/background logic. |
| `hoverable` | `boolean` | `false` | Enables lift-off or shadow expansion on hover. |

**Code Example:**
```tsx
<Card variant="manga" hoverable={true}>
  <h3>New Chapter!</h3>
  <p>Read the latest release now.</p>
</Card>
```

### 2.2 Button Component (`<Button />`)
Primary action trigger with integrated haptics.

- **Path**: `src/components/ui/Button.tsx`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'manga'` | `'primary'` | Visual style architecture. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` | Padding and font-size scale. |
| `isLoading` | `boolean` | `false` | Replaces content with a theme-aware spinner. |
| `icon` | `ReactNode` | - | Prepends an icon before the children. |

**Logic**: Triggers `haptic('light')` on every click via `useHaptics` hook.

### 2.3 Input Component (`<Input />`)
Form primitive with focus and error states.

| State | CSS Rule | Visual Feedback |
| :--- | :--- | :--- |
| **Normal** | `.input` | 1px glass border, `--color-surface` bg. |
| **Focus** | `.input:focus` | 2px `--color-primary-glow` shadow, surface hover bg. |
| **Error** | `.error` | `#ff3333` border color. |

---

## 3. Responsive Logic & Matrix

The application uses three primary breakpoints to ensure the manga aesthetic scales correctly.

| Component | Desktop (>1024px) | Tablet (768px - 1023px) | Mobile (<767px) |
| :--- | :--- | :--- | :--- |
| `.container` | `max-width: 1200px` | `padding: 0 1rem` | `padding: 0 0.75rem` |
| `h1` size | Browser Default | `1.75rem` | `1.5rem` |
| `.manga-panel` | `padding: var(--space-md)` | `padding: var(--space-md)` | `padding: 1rem` |
| Navigation | Grid/Flex row | Persistent sidebar/Flex | Bottom Sheet / Mobile Menu |

**Mobile Utilities**:
- `.hidden-mobile`: Removes element below 768px.
- `.mobile-stack`: Forces `grid-template-columns: 1fr` on mobile.

---

## 4. Layering (z-index) Hierarchy

To avoid z-index wars, follow this standardized scale:

| Level | z-index | Usage |
| :--- | :--- | :--- |
| **Background** | `-1` | `.manga-bg-container`, `.manga-halftone`. |
| **Base** | `1` | All standard page content and cards. |
| **Sticky UI** | `10` | Navigation bars, floating action buttons (FAB). |
| **Overlays** | `100` | Modals, context menus, and tooltips. |
| **System** | `999` | Critical alerts, loading screens, maintenance pages. |

---

## 5. Performance & Bot Context

The design system is **context-aware** regarding performance and SEO crawlers.

- **Bot Detection**: When `body.is-bot` is present, `* { animation: none !important; transition: none !important; }` is applied. This ensures page-speed tools and bots see the final, stable UI immediately.
- **Scrollbar**: Custom styled using `-webkit-scrollbar` pseudo-elements to match the theme colors (`--color-primary` on hover).

---

## 6. Accessibility (A11y) Standards

1.  **Motion Control**: Always use `initial={false}` in Framer Motion for non-critical layout changes to prevent "flash of unstyled animation."
2.  **Focus States**: All interactive elements MUST have a visible `:focus` state. Default: `outline: none` but replaced by `box-shadow` or `border-color` matching `--color-primary`.
3.  **Spoilers**: The `.spoiler-blur` utility (5px blur) must be accessible via click/hover to reveal content, used primarily for plot details and NSFW media.

---

> [!CAUTION]
> **Implementation Warning**: Never use hardcoded colors in CSS modules. Use the CSS variables from `tokens.css` to ensure full theme compatibility (Light/Dark/AMOLED).
