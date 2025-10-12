# Dynamic Routes Error Fix - Astro 5.x

## Error Fixed
```
GetStaticPathsRequired
`getStaticPaths()` function required for dynamic routes.
getStaticPaths() function is required for dynamic routes. Make sure that you export a getStaticPaths function from your dynamic route.
```

## Root Cause
The file `src/pages/products/[id].astro` existed but was **empty**. In Astro's static site generation (SSG) mode, all dynamic routes (files with `[param]` syntax) **must** export a `getStaticPaths()` function.

## Solution
**Deleted** `src/pages/products/[id].astro` because:
1. It was empty and non-functional
2. You already have `src/pages/products/[slug].astro` which properly handles product pages
3. Having both `[id].astro` and `[slug].astro` would create routing conflicts

## How Dynamic Routes Work in Astro 5.x

### Static (SSG) Mode - Default
Dynamic routes **require** `getStaticPaths()` to pre-generate all possible pages at build time:

```astro
---
// src/pages/products/[slug].astro
export function getStaticPaths() {
  return products.map((product) => ({
    params: { slug: product.slug },
    props: { product },
  }));
}

const { product } = Astro.props;
---
```

### On-Demand (SSR) Mode - Alternative
If you want dynamic routes that render on-demand (not at build time), set `prerender = false`:

```astro
---
// This would work for SSR, but you're using SSG
export const prerender = false;

const { id } = Astro.params;
const product = await fetchProductById(id);
---
```

## Your Current Setup ✅

You're using **slug-based routing** which is the correct approach:
- File: `src/pages/products/[slug].astro`
- URLs: `/products/pants-1`, `/products/pants-2`, etc.
- Method: Static Site Generation (SSG) with `getStaticPaths()`

### Why Slug > ID

**Slug-based routing** (what you have):
- ✅ SEO-friendly: `/products/gothic-hoodie-black`
- ✅ Human-readable URLs
- ✅ Better for sharing/bookmarking
- ✅ More descriptive

**ID-based routing** (what the empty file would have done):
- ❌ Less SEO-friendly: `/products/12345`
- ❌ Not human-readable
- ❌ Doesn't describe content
- ❌ Requires database lookup

## Astro Routing Priority

When multiple dynamic routes exist, Astro prioritizes them:
1. Static routes (no params)
2. Dynamic routes with named parameters `[slug]`
3. Rest parameters `[...path]`

If you had both `[id].astro` and `[slug].astro`, Astro would sort them alphabetically, which could cause unpredictable behavior.

## Verification

After deletion, verify the setup:
```bash
npm run dev
```

Navigate to:
- ✅ `/products/pants-1` - Should work
- ✅ `/products/pants-2` - Should work
- ✅ `/shop` - Should work
- ❌ `/products/1` - Should 404 (no ID-based routes)

## Official Documentation References

- [Dynamic Routes (Astro 5.x)](https://docs.astro.build/en/guides/routing/#dynamic-routes)
- [getStaticPaths()](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
- [Route Priority Order](https://docs.astro.build/en/guides/routing/#route-priority-order)

## Key Takeaways

1. **All dynamic routes in SSG mode need `getStaticPaths()`**
   - Empty dynamic route files will cause build errors
   - Must return an array of `{ params: {...} }` objects

2. **One dynamic route per param name**
   - Don't mix `[id].astro` and `[slug].astro` in the same directory
   - Choose one parameter naming convention

3. **Slug-based routing is best practice**
   - Better SEO
   - Better user experience
   - Industry standard

---

**Status**: ✅ Fixed - Empty `[id].astro` deleted, error resolved
**Current Routing**: Slug-based via `[slug].astro`
**No TypeScript Errors**: Confirmed
