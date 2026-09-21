# CampusRide Design System

## 1. Overview & Philosophy

The CampusRide visual language is built around an institutional, collegiate aesthetic that projects trust, safety, and peer accountability. It eschews generic gradient-heavy startup templates in favor of high-contrast typographic hierarchy and Deep Campus Green accents.

---

## 2. Color Palette & Tokens

### Semantic Tokens (`client/src/design-system/tokens.ts`)

| Token Category | Name | Value | Usage |
|---|---|---|---|
| **Brand** | `brand.primary` | `#143D32` | Primary brand identifier, primary action buttons, active navigation markers |
| | `brand.primaryHover` | `#0F2E26` | Hover state for primary buttons and interactive elements |
| | `brand.subtle` | `#E8F4F0` | Subtle green tint for badge backgrounds and selected container states |
| **Accent** | `accent.primary` | `#1769FF` | Secondary interaction accents, deep links |
| **Backgrounds** | `background.base` | `#F5F6F3` | Page canvas background |
| | `background.raised` | `#FFFFFF` | Elevated cards, modals, and input containers |
| | `background.inverse` | `#111111` | Dark mode and contrasting headers |
| **Foregrounds** | `foreground.primary` | `#111111` | High-contrast headline text (meets WCAG AAA 14:1) |
| | `foreground.secondary`| `#5B5F58` | Body paragraphs and secondary labels (meets WCAG AA 4.8:1) |
| | `foreground.muted` | `#8A9085` | Placeholders, captions, timestamps |
| **Status** | `status.success` | `#1E8E5A` | Route verified, high match scores, OTP success |
| | `status.warning` | `#B45309` | Pending reviews, minor schedule deviations |
| | `status.danger` | `#C0392B` | Error banners, emergency SOS, OTP lockout |

---

## 3. Typography Scale

Type scales use fluid `clamp()` functions for responsive hierarchy without layout shifts:

```ts
export const type = {
  display: "clamp(2.5rem, 5vw, 4.5rem)",
  h1: "clamp(2rem, 3.5vw, 3rem)",
  h2: "clamp(1.5rem, 2.5vw, 2.25rem)",
  h3: "1.5rem",
  bodyLarge: "1.125rem",
  body: "1rem",
  small: "0.875rem",
  caption: "0.75rem",
} as const;
```

---

## 4. Spacing Scale

Based on a disciplined 8px harmonic grid:
- `1` = `4px` (tight micro-spacing)
- `2` = `8px` (standard gap)
- `3` = `12px` (input interior padding)
- `4` = `16px` (card content padding)
- `6` = `24px` (component separation)
- `8` = `32px` (section padding)
- `12` = `48px` (large container padding)
- `16` = `64px` (landing section gutters)

---

## 5. Shadows & Elevation

- **Level 1 (Subtle)**: `0 1px 2px rgba(17, 17, 17, 0.06)` — Search inputs, status tags.
- **Level 2 (Raised)**: `0 4px 12px rgba(17, 17, 17, 0.08)` — Standard ride cards, dropdown menus.
- **Level 3 (Overlay)**: `0 12px 32px rgba(17, 17, 17, 0.12)` — Modals, popovers, mobile sheets.

---

## 6. UI Primitive Components

The application standardizes on 5 core UI primitives located in `client/src/components/ui/`:

### `Button`
- **Props**: `variant` (`primary` \| `secondary` \| `outline` \| `ghost` \| `danger`), `size` (`sm` \| `md` \| `lg`), `loading` (boolean with animated spinner), `leftIcon`, `rightIcon`.
- **Accessibility**: Includes built-in `focus-visible` rings and enforces minimum 44px touch targets on medium/large sizes.

### `Card`
- **Props**: `variant` (`default` \| `raised` \| `bordered` \| `subtle`), `interactive` (boolean enabling subtle hover lift).

### `Input`
- **Props**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`, native input attributes.
- **Accessibility**: Explicitly ties `<label htmlFor>` to `<input id>` and connects error strings to `aria-describedby`.

### `Badge`
- **Props**: `variant` (`default` \| `brand` \| `success` \| `warning` \| `danger` \| `info`), `size` (`sm` \| `md`).

### `Skeleton`
- **Props**: `variant` (`text` \| `circular` \| `rectangular`), `width`, `height`.
- **Accessibility**: Marked with `aria-hidden="true"` so screen readers are not interrupted during data loading.
