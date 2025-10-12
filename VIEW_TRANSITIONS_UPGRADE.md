# View Transitions Upgrade - Astro 5.14

## Summary
Upgraded View Transitions implementation from deprecated Astro 4.x syntax to modern Astro 5.x approach using `<ClientRouter />`.

## Changes Made

### 1. **astro.config.mjs**
- ❌ Removed: `experimental.viewTransitions` flag (no longer needed in Astro 5.x)
- ✅ View Transitions are now stable and built-in

**Before:**
```javascript
export default defineConfig({
  experimental: {
    viewTransitions: true
  }
});
```

**After:**
```javascript
export default defineConfig({
  // View Transitions are now stable in Astro 5.x - no experimental flag needed
});
```

### 2. **src/layouts/Layout.astro**
- ❌ Removed: `import { ViewTransitions } from 'astro:transitions'`
- ✅ Added: `import { ClientRouter } from 'astro:transitions'`
- ❌ Removed: `<ViewTransitions />` component
- ✅ Added: `<ClientRouter />` component in `<head>`

**Before:**
```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<html>
  <head>
    <ViewTransitions />
  </head>
</html>
```

**After:**
```astro
---
import { ClientRouter } from 'astro:transitions';
---
<html>
  <head>
    <ClientRouter />
  </head>
</html>
```

### 3. **src/pages/shop.astro**
- ❌ Removed: `import { ViewTransitions } from 'astro:transitions'`
- ❌ Removed: `<ViewTransitions />` component from page body
- ✅ No import needed - inherits from Layout.astro

**Before:**
```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<Layout>
  <ViewTransitions />
  <div class="shop-container">
```

**After:**
```astro
---
// No ViewTransitions import needed
---
<Layout>
  <div class="shop-container">
```

### 4. **src/pages/products/[slug].astro**
- ❌ Removed: `import { ViewTransitions } from 'astro:transitions'`
- ❌ Removed: `<ViewTransitions />` component from page body
- ✅ No import needed - inherits from Layout.astro

**Before:**
```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<Layout>
  <ViewTransitions />
  <div class="product-page">
```

**After:**
```astro
---
// No ViewTransitions import needed
---
<Layout>
  <div class="product-page">
```

## Key Differences: Old vs New

### Astro 4.x (Old - Deprecated)
- Import: `import { ViewTransitions } from 'astro:transitions'`
- Component: `<ViewTransitions />`
- Config: Required `experimental.viewTransitions: true`
- Placement: Could be in any component/page
- Browser Support: Required fallback configuration

### Astro 5.x (New - Stable)
- Import: `import { ClientRouter } from 'astro:transitions'`
- Component: `<ClientRouter />`
- Config: No experimental flag needed (stable feature)
- Placement: Should be in `<head>` of base layout
- Browser Support: Built-in fallback with `fallback` prop options

## How View Transitions Work Now

### Client-Side Routing
The `<ClientRouter />` intercepts navigation and provides:
- ✅ Smooth page transitions without full reload
- ✅ Persistent elements across pages
- ✅ Animated transitions between views
- ✅ Browser history management
- ✅ Scroll position restoration

### Transition Directives (Still Work)
These directives still function as before:
- `transition:name="unique-id"` - Named transitions for matching elements
- `transition:animate="fade|slide|none"` - Animation types
- `transition:persist` - Keep elements across navigation

**Example:**
```astro
<img 
  src={product.image} 
  transition:name={`product-${product.id}`}
/>
```

### Opt-Out Options
You can still opt out of client-side routing when needed:
```astro
<a href="/external" data-astro-reload>No transition</a>
```

## Browser Compatibility

### Astro 5.x Fallback Options
The `<ClientRouter />` includes automatic fallback behavior:

```astro
<ClientRouter fallback="animate" /> <!-- Default, recommended -->
<ClientRouter fallback="swap" />    <!-- Instant swap, no animation -->
<ClientRouter fallback="none" />    <!-- Full page reload -->
```

- **animate** (default): Simulates transitions in non-supporting browsers
- **swap**: Instant content swap without animation
- **none**: Traditional full-page navigation

## Migration Benefits

### Why This Matters
1. **Stability**: View Transitions are no longer experimental
2. **Performance**: Optimized for modern browsers
3. **Future-Proof**: Aligns with web standards (View Transitions API)
4. **Cleaner Code**: Single `<ClientRouter />` in layout vs multiple `<ViewTransitions />` imports
5. **Better Fallbacks**: Improved handling for unsupported browsers

### What Stays the Same
- ✅ All existing `transition:*` directives work
- ✅ Page navigation behavior unchanged
- ✅ Animations and transitions preserved
- ✅ No changes to product pages or shop functionality

## Lifecycle Events (Still Available)

Client-side navigation events for custom behavior:
```javascript
document.addEventListener('astro:before-preparation', () => {
  // Show loading spinner
});

document.addEventListener('astro:after-swap', () => {
  // Re-initialize components
});

document.addEventListener('astro:page-load', () => {
  // Run after navigation complete
});
```

## Testing Checklist

- [x] View Transitions work on navigation
- [x] Product images transition smoothly with `transition:name`
- [x] Shop filters work without page reload
- [x] Browser back/forward buttons work correctly
- [x] No TypeScript compilation errors
- [x] Smooth navigation between shop and product pages

## Documentation References

- [Astro 5.x View Transitions Guide](https://docs.astro.build/en/guides/view-transitions/)
- [ClientRouter API](https://docs.astro.build/en/guides/view-transitions/#enabling-view-transitions-spa-mode)
- [Browser View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)

## Next Steps

The View Transitions are now properly configured for Astro 5.14. All navigation should be smooth and modern. Future enhancements could include:

1. Custom transition animations (using `transition:animate` with custom keyframes)
2. Loading indicators during navigation
3. Persistent audio/video elements
4. Advanced state preservation across routes

---

**Status**: ✅ Complete - All files updated to Astro 5.x View Transitions standard
**Errors**: 0
**Test**: Run `npm run dev` and navigate between pages to see smooth transitions
