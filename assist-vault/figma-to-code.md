

---

#### Inline Styles Only

* **Always** use JSX’s `style={{…}}` syntax.
* **Never** drop in external CSS files or `className` overrides for positional/layout styles.

#### CSS Variables

* Reference theme tokens **only** with `var(--…)` inside string values:

  ```jsx
  style={{ color: 'var(--text-primary)' }}
  ```

#### CamelCase Properties

* Convert all CSS names to camelCase:

  | CSS                | JSX style         |
  | ------------------ | ----------------- |
  | `background-color` | `backgroundColor` |
  | `border-radius`    | `borderRadius`    |
  | `font-size`        | `fontSize`        |

#### Semantic HTML

* Wrap content in the proper tags:

  * **Containers**: `<section>`, `<article>`, `<nav>`
  * **Headings**: `<h1>…<h6>`
  * **Lists**: `<ul>`, `<ol>`, `<li>`
  * **Text**: `<p>`, `<strong>`, `<span>`
* Apply inline styles directly to these elements.

#### Container Padding

* **Always** use the global padding token for containers:

  ```jsx
  style={{ padding: 'var(--padding-base)' }}
  ```
* This ensures automatic and consistent width—**do not use `maxWidth`** or manually adjust container width.

#### Avoid Explicit Height/Width

* **Do not** hardcode `height`, `width`, or `maxWidth` on containers or elements.
* Rely on padding, flex settings, and content-driven sizing to maintain design consistency.

#### Correct Font Size from Figma

* **Figma often adds \~10px to the actual font rendering**. Manually verify and reduce fontSize by \~10px if needed to match visual result in browser.

  ```jsx
  // If Figma says 30px, try 20px in code
  style={{ fontSize: '20px' }}
  ```

#### Icons

* **Only** import from `icons.jsx`:

  ```jsx
  import { SearchIcon, CheckIcon } from './icons';
  ```
* **Never** wrap icons in extra `<div>` for spacing—use parent flex layouts instead.
* **Do not** apply `display: 'flex'`, `padding`, or `margin` to the `<Icon />` itself unless absolutely required.

#### Flexbox Layout

* Use flexbox for grouping and alignment:

  ```jsx
  style={{
    display: 'flex',
    flexDirection: 'row' | 'column',
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}
  ```
* If a container has no children needing flex alignment, avoid `display: 'flex'`.

#### Exact Figma Measurements

* **Mirror** Figma’s values one-to-one for:

  * Spacing (`margin`, `padding`, `gap`)
  * Typography (`fontSize`, `lineHeight`, `fontWeight`)
  * Corners (`borderRadius`)
* **Avoid using `width`, `height`, or `maxWidth`** unless the component visually breaks without it.
* **Do not** round or estimate.

#### No Redundant CSS

* Omit zero-value overrides unless explicitly resetting a browser default.
* Remove any styles that do not visually change the component.

---

##### Example Component

```jsx
import { StarIcon } from './icons';

export function Card({ title, children }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: 'var(--padding-base)'
      }}
    >
      <h2 style={{ fontSize: '20px', color: 'var(--text-heading)' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StarIcon />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Featured
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}
```
