# Astro 5.14 E-commerce Product Management - Best Practices Guide

## Overview

This guide covers the best practices for managing e-commerce products in Astro 5.14, specifically for the Dot For You handmade clothing brand.

## Recommended Architecture

### 1. Content Collections Approach (Recommended)

**Why Content Collections?**
- Type safety with TypeScript
- Automatic schema validation
- Performance optimized (build-time generation)
- SEO friendly
- Easy content management

**Structure:**
```
src/content/
├── products/
│   ├── product-1.md
│   ├── product-2.md
│   └── product-3.md
└── collections/
    ├── collection-1.md
    └── collection-2.md
```

### 2. Hybrid Approach (Current Implementation)

**When to Use:**
- When you need runtime product updates
- When product data comes from external APIs
- When you have complex business logic

**Structure:**
```
src/utils/
├── products.ts          # Product types and data
├── collections.ts       # Collection management
└── inventory.ts         # Stock management
```

## Product Data Schema Best Practices

### Core Product Schema

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  story: string;
  price: number;
  comparePrice?: number;
  sku: string;
  status: 'available' | 'sold_out' | 'coming_soon' | 'pre_order';
  category: ProductCategory;
  collection: string;
  tags: string[];
  materials: string[];
  features: string[];
  images: ProductImages;
  variants: ProductVariant[];
  seo: ProductSEO;
  inventory: InventoryInfo;
  craftsmanship: CraftsmanshipInfo;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}
```

### Supporting Interfaces

```typescript
interface ProductImages {
  hero: string;
  gallery: string[];
  details: string[];
  lifestyle: string[];
  sizeChart?: string;
  videos?: string[];
}

interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  sku: string;
  inventory: number;
  available: boolean;
  attributes: VariantAttributes;
}

interface VariantAttributes {
  size?: string;
  color?: string;
  material?: string;
  measurements?: Record<string, number>;
}

interface CraftsmanshipInfo {
  technique: string;
  hoursSpent: number;
  artisan: string;
  madeIn: string;
  sustainability: string[];
  careInstructions: CareInstructions;
}
```

## File Organization Strategies

### Option 1: Content Collections (Type-Safe)

**src/content/config.ts**
```typescript
import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.enum(['pants', 'hoodies', 'accessories']),
    status: z.enum(['available', 'sold_out', 'coming_soon']),
    images: z.object({
      hero: z.string(),
      gallery: z.array(z.string()),
    }),
    // ... other fields
  }),
});

export const collections = {
  products,
};
```

**src/content/products/product-1.md**
```yaml
---
name: "Anarchy Cargo Pants"
description: "Handcrafted cargo pants..."
price: 350
category: pants
status: available
images:
  hero: "/images/products/2/Website/1.webp"
  gallery:
    - "/images/products/2/Website/1.webp"
    - "/images/products/2/Website/2.webp"
---
# Product Description

Detailed product description in markdown...
```

### Option 2: TypeScript Data Files (Flexible)

**src/data/products/index.ts**
```typescript
import { Product } from '@/types/product';
import productData from './products.json';

export const products: Product[] = productData;

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}
```

**src/data/products/products.json**
```json
[
  {
    "id": "2",
    "name": "Anarchy Cargo Pants",
    "price": 350,
    "category": "pants",
    "status": "available",
    "images": {
      "hero": "/images/products/2/Website/1.webp",
      "gallery": ["/images/products/2/Website/1.webp", "/images/products/2/Website/2.webp"]
    }
  }
]
```

### Option 3: Hybrid API + Local Data

**src/utils/products.ts**
```typescript
// Combine local data with API fetching
export async function getAllProducts(): Promise<Product[]> {
  // Start with local products
  const localProducts = getLocalProducts();

  // Enhance with real-time data
  const enrichedProducts = await Promise.all(
    localProducts.map(async (product) => {
      const inventory = await fetchInventory(product.id);
      return { ...product, inventory };
    })
  );

  return enrichedProducts;
}
```

## Image Management Best Practices

### Directory Structure
```
public/images/products/
├── 2/
│   ├── Website/
│   │   ├── 1.webp    # Hero image
│   │   ├── 2.webp    # Gallery images
│   │   └── 3.webp
│   ├── Items/
│   │   ├── IMG_0779.png
│   │   ├── IMG_0780.png
│   │   └── IMG_0781.png
│   └── InstagramPost/
│       ├── 2 First.png
│       ├── 2 Second.png
│       └── 2 SizeChart.png
└── 3/
    └── ...
```

### Image Optimization

```typescript
// Astro Image component usage
import { Image } from 'astro:assets';

<Image
  src={product.images.hero}
  alt={product.name}
  width={800}
  height={1000}
  format="webp"
  loading="lazy"
  densities={[1, 2]}
/>
```

### Responsive Images Strategy

```typescript
interface ResponsiveImageSet {
  src: string;
  alt: string;
  sizes: {
    small: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
  };
}
```

## Performance Optimization

### 1. Build-Time Generation
- Use Content Collections for static product data
- Generate all product pages at build time
- Create sitemap automatically

### 2. Caching Strategy
```typescript
// API caching with TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cachedProducts: Product[] | null = null;
let cacheTimestamp = 0;

export async function getProducts(): Promise<Product[]> {
  const now = Date.now();

  if (cachedProducts && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedProducts;
  }

  const products = await fetchProducts();
  cachedProducts = products;
  cacheTimestamp = now;

  return products;
}
```

### 3. Lazy Loading
```typescript
// Intersection Observer for product images
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement;
      img.src = img.dataset.src!;
      observer.unobserve(img);
    }
  });
});
```

## SEO Best Practices

### 1. Dynamic Meta Tags
```astro
---
import { getProductById } from '@/utils/products';

const product = getProductById(Astro.params.id);
const title = `${product.name} - Dot For You`;
const description = product.description;
const image = product.images.hero;
---

<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={image} />
<meta property="og:type" content="product" />
```

### 2. Structured Data
```astro
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "{product.name}",
  "description": "{product.description}",
  "image": "{product.images.hero}",
  "brand": {
    "@type": "Brand",
    "name": "Dot For You"
  },
  "offers": {
    "@type": "Offer",
    "price": "{product.price}",
    "priceCurrency": "PLN",
    "availability": "{product.status === 'available' ? 'InStock' : 'OutOfStock'}"
  }
}
</script>
```

## Inventory Management

### Stock Tracking
```typescript
interface InventoryManager {
  checkStock(productId: string): Promise<number>;
  reserveStock(productId: string, quantity: number): Promise<boolean>;
  releaseReservation(reservationId: string): Promise<void>;
  updateStock(productId: string, newStock: number): Promise<void>;
}
```

### Real-time Updates
```typescript
// WebSocket or Server-Sent Events for stock updates
const eventSource = new EventSource('/api/stock-updates');

eventSource.addEventListener('stock-change', (event) => {
  const { productId, newStock } = JSON.parse(event.data);
  updateProductStockUI(productId, newStock);
});
```

## Recommended Implementation for Dot For You

Based on your current setup with numbered products and organized image folders, I recommend:

### Phase 1: Immediate Implementation
1. **Enhanced TypeScript Product Files** (Current approach, improved)
2. **Comprehensive Product Catalog** covering all products 2-13
3. **Better Image Management** using your existing folder structure

### Phase 2: Future Enhancement
1. **Add Content Collections** for blog posts, lookbooks, stories
2. **Implement Inventory API** for real-time stock management
3. **Add Product Search** with Astro's built-in search capabilities

### File Structure
```
src/
├── content/
│   ├── collections/          # Collection descriptions
│   └── lookbooks/           # Style guides and stories
├── data/
│   └── products/
│       ├── index.ts         # Product data and utilities
│       ├── products.json    # All product information
│       └── types.ts         # Type definitions
├── pages/
│   ├── shop.astro          # Main shop page
│   ├── products/
│   │   └── [id].astro      # Individual product pages
│   └── api/
│       └── inventory.ts    # Real-time stock API
```

## Migration Strategy

1. **Keep Current Structure** - It's working well
2. **Add Product Catalog** - Cover all products 2-13
3. **Enhance Image Management** - Use existing folder structure
4. **Add SEO Improvements** - Meta tags and structured data
5. **Future: Content Collections** - For marketing content

This approach provides the best balance of maintainability, performance, and flexibility for your handmade clothing brand.