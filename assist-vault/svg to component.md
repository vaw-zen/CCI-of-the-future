Add [IconName] component to icons.jsx based on @[filename].svg with these requirements:
1. Convert to single-line component
2. Make strokeWidth and animate configurable via props
3. Convert hardcoded colors to currentColor
4. Preserve viewBox dimensions
5. Keep all original paths and attributes

Example format:
export function IconName({ strokeWidth = 1.5, animate, ...props }) {
    return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path stroke="currentColor" strokeWidth={strokeWidth} ... /></svg>);
}
```

So for your recent icons, the prompts would be:

For EmailFillIcon:
```
Add EmailFillIcon component to icons.jsx based on @smsFill.svg:
- Convert fill="#667085" to fill="currentColor"
- Keep viewBox="0 0 20 21"
- Make single-line component
```

For ArrowInputIcon:
```
Add ArrowInputIcon component to icons.jsx based on @arrow-down-fill.svg:
- Convert fill="#101828" to fill="currentColor"
- Keep viewBox="0 0 25 24"
- Make single-line component
```

For animated icons like BellIcon:
```
Add BellIcon component to icons.jsx based on @bell.svg:
- Add animate prop for animation control
- Make strokeWidth configurable (default 1.5)
- Convert to single-line
- Use currentColor for stroke
- Include animation transforms
```

The resulting component should look like:
```jsx
export function IconName({ strokeWidth = 1.5, animate, ...props }) { return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path stroke="currentColor" strokeWidth={strokeWidth} d="..." />{animate && <animateTransform .../>}</svg>); }
```

Key points to remember:
1. Always destructure props with defaults: `{ strokeWidth = 1.5, animate, ...props }`
2. Use single-line format
3. Convert colors to currentColor
4. Keep original viewBox dimensions
5. Include animation conditionally with `{animate && <animateTransform/>}`
6. Pass through remaining props with `{...props}`
