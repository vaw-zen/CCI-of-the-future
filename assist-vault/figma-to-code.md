
---

# ✨ Component Authoring Guidelines (CSS Modules + `style.className`)

These instructions define how to build **scalable**, **theme-compliant**, and **responsive** components using **CSS Modules** and `style.className`. All layout, spacing, and visuals are handled via external `.css` or `.module.css` files—**never inline styles**.

---

## 🧱 Core Principles

1. ✅ **CSS in separate files** – use `.module.css` and `style.className`.
2. ✅ **Token-driven design** – use `var(--token-name)` for colors, spacing, etc.
3. ✅ **Semantic HTML** – use correct elements for structure and accessibility.
4. ✅ **Mobile-first, responsive layout** – default to mobile styles and override with media queries.
5. ✅ **1:1 Figma mapping** – copy spacing, sizing, typography exactly.

---

## 📁 File Structure

Each component gets a paired `.module.css` file:

```
Feedback.jsx
Feedback.module.css
```

In JSX:

```jsx
import styles from './Feedback.module.css';

<section className={styles.container}>
```

---

## 🎨 CSS Rules

### 🎯 Use CSS Variables

All values must use theme tokens:

```css
color: var(--text-primary);
padding: var(--padding-base);
background-color: var(--bg-elevated);
```

---

### ✍️ Class Naming Conventions

Use **BEM-like scoped naming**:

```css
.container {}
.container__heading {}
.container__iconWrapper {}
.container__image {}
```

Avoid generic class names (`box`, `text`, `image`) that don’t describe structure.

---

## 📱 Mobile-First & Responsive Design

### Default = Mobile

Start with vertical stacking and smaller spacing.

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: var(--padding-base);
}
```

### Tablet (`min-width: 768px`)

Adjust only if layout shifts in Figma:

```css
@media (min-width: 768px) {
  .container {
    flex-direction: row;
    gap: 60px;
    padding: 40px;
  }
}
```

### Desktop (`min-width: 1024px`)

Only use if large screen-specific changes are needed.

---

## ✅ Semantic HTML

Use the correct HTML structure:

| Content Type | Use this Tag             |
| ------------ | ------------------------ |
| Sections     | `<section>`, `<article>` |
| Titles       | `<h1>`–`<h6>`            |
| Paragraphs   | `<p>`                    |
| Lists        | `<ul>`, `<li>`           |
| Inline text  | `<span>`, `<strong>`     |

Apply `className={styles.foo}` to each one.

---

## 💬 Text & Typography


Use `font-weight`, `line-height`, `letter-spacing` if defined.

---

## 📐 Spacing & Layout

* Use `gap` over margins for spacing between flex items.
* Use `padding` for internal spacing.
* Avoid explicit `width`/`height` unless absolutely required.
* Let containers grow naturally.

```css
.container {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
}
```

---

## 🖼️ Images

```css
.image {
  width: 100%;
  height: auto;
  object-fit: cover;
  max-width: 413px;
  aspect-ratio: 413 / 361;
}
```

Avoid hardcoded `height`.

---

## 🔁 Icons

* Import from `icons.jsx`
* Never wrap icons in `div` for layout
* Apply spacing via flex container, not directly to the icon

```jsx
<div className={styles.iconWrapper}>
  <UilArrowRight className={styles.icon} />
</div>
```

```css
.iconWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 2px solid var(--text-primary);
  border-radius: 50%;
}

.icon {
  transform: rotate(-45deg);
  color: var(--ac-primary);
  font-size: 19px;
}
```

---

## 🧼 Clean Code Rules

* ❌ No inline `style={{…}}` unless unavoidable (e.g. animation keyframes)
* ❌ No hardcoded px values (always use tokens or Figma specs)
* ❌ No `!important`
* ❌ No unused CSS declarations
* ❌ No overlapping responsibilities between layout and typography

---

## 🧪 Sample Component (CSS Modules)

### `Feedback.jsx`

```jsx
import styles from './Feedback.module.css';
import { UilArrowRight } from '../../icons';

export default function Feedback() {
  return (
    <section className={styles.container}>
      <img src="img1.jpg" alt="Feedback" className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.heading}>Excellent</h3>
        <img src="stars.png" alt="5 stars" className={styles.stars} />
        <p className={styles.text}>Trust score 5.0 based on 1500 reviews</p>
        <div className={styles.cta}>
          <div className={styles.iconWrapper}>
            <UilArrowRight className={styles.icon} />
          </div>
          <span className={styles.ctaText}>read feedback</span>
        </div>
      </div>
      <img src="img2.jpg" alt="Feedback" className={styles.image} />
    </section>
  );
}
```

---


