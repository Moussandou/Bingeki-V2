# Design System: Brutalist Manga 🎨

Bingeki V2 adopts a **"Brutalist Manga"** aesthetic. This blueprint is designed to allow pixel-perfect reconstruction of the interface from scratch.

## 1. Global Visual Layers (Z-Stack)

1.  **Base Layer (Z: -2)**: Solid background color (`#F5F5F5` Light / `#121212` Dark).
2.  **Pattern Layer (Z: -1)**: Halftone dots or Speedlines.
3.  **Content Layer (Z: 0)**: Non-panel elements (text, simple images).
4.  **Panel Layer (Z: 1)**: Manga Panels with solid shadows.
5.  **Overlay Layer (Z: 10)**: Modals, fixed menus, navigation bars.

## 2. Background Patterns (Geometry)

### 2.1 Halftone Dots
- **Shape**: Perfect circles (radial-gradient).
- **Dot Diameter**: `2px`.
- **Grid Spacing**: `20px x 20px` (Square grid).
- **Falloff**: Sharp edge at `2.5px` (0.5px anti-aliasing).
- **Opacity**: `0.1` (Light/AMOLED) or `0.05` (Dark).
- **Color**: `var(--color-dots)`.

### 2.2 Speedlines
- **Type**: Radial conic gradient originating from the center.
- **Ray Angle**: `2deg` solid ray, `10deg` transparent gap (Repeating).
- **Opacity**: `0.05`.

## 3. The "Manga Panel" Anatomy

Every card or container must follow this exact layering stack from bottom to top:

1.  **The Shadow (Bottom)**: 
    - Offset: `6px` Right, `6px` Down.
    - Blur/Spread: `0`.
    - Color: `#000000` (Solid).
2.  **The Core Container**:
    - Background: `var(--color-surface)`.
    - Border: `4px` solid `#000000` (or theme-specific).
    - BorderRadius: `0px` (No rounded corners except for specific avatar badges).
3.  **The Content (Top)**: Standard padding `16px` (`--space-md`).

### 3.1 Interactive States (Physics)
When a panel is interactive (`data-hoverable="true"`):
- **On Hover / Active**: 
    - **Transform**: `translate(-2px, -2px)`.
    - **Shadow Offset**: Expands to `8px, 8px`.
    - **Shadow Color**: Switches to `var(--color-primary)` (`#FF2E63`).
    - **Transition**: `0.2s` using `cubic-bezier(0.19, 1, 0.22, 1)` (snappy but smooth).

## 4. Typography Blueprint

### 4.1 High-Impact Titles (`.manga-title`)
- **Block Background**: Solid `#000000` (Light) or `#FFFFFF` (Dark).
- **Text Color**: Inverted (White on Black, etc.).
- **Font**: `Outfit` 900 (Extra Bold).
- **Transform**: `rotate(-1deg)` (Counter-clockwise).
- **Spacing**: `0.1em` top/bottom, `0.5em` left/right padding.
- **Casing**: `UPPERCASE`.

### 4.2 Outlined Text
- **Effect**: 1px solid stroke in 4 directions.
- **Specifics**: `-1px -1px 0 #000`, `1px -1px 0 #000`, `-1px 1px 0 #000`, `1px 1px 0 #000`.

## 5. Mobile implementation (React Native)

To replicate "Brutalist Manga" on mobile:

### 5.1 Shadows (Android/iOS divergence)
- **iOS**: Use `shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0`.
- **Android**: Simulate the solid shadow using a background `View` behind the card, as `elevation` always adds blur.

### 5.2 Interactions
- Use `Pressable` with a `Scale` or `Translation` animation via **Reanimated 3**.
- Apply a short haptic feedback (`Haptics.notificationAsync`) on successful "Brutalist" clicks.
