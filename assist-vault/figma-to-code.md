
```jsx
When implementing UI from Figma designs to React components, follow these instructions:

1. Use inline CSS with style={{}} syntax in JSX
2. Reference CSS variables with `var(--variable-name)` within string values
3. Use camelCase for CSS properties (backgroundColor, borderRadius, etc.)
4. Import icons from icons.jsx component library
5. Use semantic HTML tags (section, h2, ul, li, strong, span, etc) with inline styles
6. Avoid unnecessary margins/height calculations if they don't affect layout
7. Use flexbox with display: 'flex', flexDirection, gap properties
8. Follow the Figma measurements for spacing, sizing and border radius
9. use icons from icon.jsx
10. avoid using useless css like padding: 0 or margin: 0 or display flex on icons

Example style pattern:
style={{ display: 'flex', flexDirection: 'column', gap: '29px', backgroundColor: 'var(--bg-primary)', borderRadius: '24px', padding: '24px' }}
```
