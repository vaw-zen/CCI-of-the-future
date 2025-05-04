# CSS Conversion Guide: px to vw (Simplified)

Convert **ALL** `px` units to `vw` units throughout the entire stylesheet, with base/desktop, tablet, and mobile breakpoints:

---

## 1. **Base/Desktop Styles (outside media queries):**
- **Convert all styles with `px` units to `vw` using desktop reference: `vw = (px / 1920) * 100`**
- Example: `20px` → `1.04vw` (20 / 1920 * 100)
- If you encounter an existing `vw` value in desktop styles, assume it’s based on a 1920px reference. Reverse-calculate its original px using: `px = (vw × 1920) ÷ 100`. Then apply the resulting px value when converting to tablet and mobile vw breakpoints.
- **No `px` units should remain** in the base styles
- Convert ALL properties: borders, margins, paddings, font-sizes, heights, widths, etc.
- **These base styles will apply to ALL desktop screens** regardless of size

---

## 2. **Media Queries Conversion:**

### a. **Tablet screens (@media screen and (max-width: 1024px)):**
- Convert ALL `px` values to `vw` using: `vw = (px / 768) * 100`
- Example: `16px` → `1.56vw` (16 / 768 * 100)
- If this media query doesn't exist, create it and include converted base styles
- **No `px` units should remain** inside this media query

### b. **Mobile screens (@media screen and (max-width: 480px)):**
- Convert ALL `px` values to `vw` using: `vw = (px / 412) * 100`
- Example: `14px` → `3.56vw` (14 / 412 * 100)
- If this media query doesn't exist, create it and include converted base styles
- **No `px` units should remain** inside this media query

---

## 3. **CRITICAL: Cross-checking Between All Styles**
- Create a master list of ALL selectors from base styles and ALL media queries
- Every selector with properties in base styles MUST have corresponding entries in ALL media queries
- If a property exists in the base styles, it MUST be converted and included in ALL media queries
- **Systematically cross-reference base styles and both media queries** to ensure no selector conversions are missed

---

## 4. **Adding Missing Property Overrides:**
- For ANY property in the base styles, check if it exists in EACH media query
- If the property is missing in a media query, ADD it with the appropriate `vw` conversion
- If a selector from the base styles is missing entirely in a media query, ADD the complete selector with ALL properties converted to the appropriate `vw` value for that media query

Example:
```css
/* Base style (desktop) - already in vw units based on 1920px */
.item { 
  font-size: 0.73vw;  /* (14 / 1920 * 100) */
  margin: 0.52vw;     /* (10 / 1920 * 100) */
}

/* What should be in ALL media queries (with appropriate conversions for each) */
@media screen and (max-width: 1024px) {
  .item { 
    font-size: 1.37vw;  /* (14 / 1024 * 100) */
    margin: 0.98vw;     /* (10 / 1024 * 100) */
  }
}

@media screen and (max-width: 600px) {
  .item { 
    font-size: 3.56vw;  /* (14 / 393 * 100) */
    margin: 2.54vw;     /* (10 / 393 * 100) */
  }
}
```

---

## 5. **Implementation Process:**
1. Make a complete list of ALL selectors in the entire CSS file
2. For EACH selector:
   - Convert ALL `px` values to `vw` in base styles using desktop formula (1920px reference)
   - Ensure the selector appears in BOTH tablet and mobile media queries with proper conversions for each screen size
   - Check ALL properties within each selector for `px` values
3. Perform a final regex search for any remaining `px` values anywhere in the file

---

## 6. **Thorough Verification:**
- Search for any remaining `px` units anywhere using regex: `\d+px`
- Common missed elements: navigation links, borders, paddings, margins, box-shadows, font-sizes
- Review the ENTIRE CSS file to ensure complete conversion in base styles and ALL media queries
- Double-check math calculations for accuracy (round to 2 decimal places)
- **Verify each entry in your master list appears in base styles AND BOTH media queries**

---

## ✅ Key Points:
- Convert **ALL** `px` to `vw` throughout entire CSS file - **NO EXCEPTIONS**
- Base styles use desktop reference (1920px) for conversion and apply to all desktop screens
- **No separate large screen media query** is needed
- Add missing properties/selectors to media queries when they exist in base styles
- **Never leave a converted selector in one place but miss it in another**
- Maintain original CSS structure and formatting
- Verify conversions using regex search for any remaining `px` values
- Use a systematic approach to ensure nothing is missed
- Round all calculations to 2 decimal places for consistency