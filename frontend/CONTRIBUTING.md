# Contributing - UI Guidelines (Material UI)

This project uses **Material UI (MUI)** for UI components and styling.

These guidelines help keep the UI consistent across the project.
They are not strict rules, but recommended practices when working with Material UI.

You can find more information about MUI here:
https://mui.com/material-ui/getting-started/

The main goal is to ensure the interface works well with our theme styling and supports both light and dark mode.

---

## 1. Prefer Material UI components

Whenever possible, use **MUI components** instead of plain HTML elements.
This keeps the UI consistent and ensures proper styling with the theme.

**Example:**

```tsx
<Button variant="contained">Save</Button>
<Typography variant="h6">Inventory</Typography>
<Card />
```

**Instead of:**

```html
<button>
  <h2>
    <div></div>
  </h2>
</button>
```

---

## 2. Avoid custom CSS if possible

Try to avoid creating new CSS files. Instead, use the `sx` prop provided by MUI.
This keeps styling connected to the theme and makes it easier to maintain.

**Example:**

```tsx
<Box sx={{ mt: 4 }}>
```

---

## 3. Use theme colors

Avoid hardcoding colors. Prefer using theme values such as:

```tsx
<Typography color="text.secondary">
<Box sx={{ bgcolor: "background.paper" }}>
```

**Instead of:**

```css
color: "#333";
backgroundcolor: "#fff";
```

---

## 4. Use component props when available

Some MUI components already have props for styling.
If a prop exists, prefer using it instead of `sx`.

**Example:**

```tsx
<Typography color="text.primary">
```

**Instead of:**

```tsx
<Typography sx={{ color: "text.primary" }}>
```

---

## 5. Layout

For layout, prefer using MUI components such as:

- `Box`
- `Stack`
- `Container`

**Example:**

```tsx
<Stack spacing={2}>
  <Button />
  <Button />
</Stack>
```

These components help keep layout consistent and responsive.

---

## 6. Accessing the theme

You can access the theme in two common ways.

### Inside `sx`:

```tsx
<Button
  sx={(theme) => ({
    backgroundColor: theme.palette.primary.main,
  })}
>
  Save
</Button>
```

### Using the `useTheme()` hook:

```tsx
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const theme = useTheme();

<Button sx={{ backgroundColor: theme.palette.primary.main }}>Save</Button>;
```

---

## 7. Shared styles in `theme.ts`

Some shared styles are defined in `theme.ts`, such as colors, border radius, and gradients.
If a style value is used in multiple places, consider adding it to the theme instead of repeating it in different components.

**Example:**

```tsx
sx={(theme) => ({
    background: theme.gradients.button,
})}
```

This allows us to reuse styles and change them globally later if needed.

---

## 8. Responsive design

The UI should be responsive and mobile-friendly.

We aim to support screen widths down to 320px, so components should adapt well to smaller screens.

**Recommendations:**

- Use MUI's responsive system (`xs`, `sm`, `md`, etc.)
- Prefer flexible layouts (`Stack`, `Box`) over fixed sizes
- Avoid hardcoded widths where possible
- Test components on smaller screen sizes

---
