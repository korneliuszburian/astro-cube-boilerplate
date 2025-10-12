/**
 * Dot For You - Product Management System
 * Comprehensive product catalog with TypeScript types and utilities
 */

import type { Product, ProductVariant, ProductCategory, ProductStatus } from './types';
import productsData from './products.json';

// Export all products with type safety
export const products: Product[] = productsData as Product[];

// Collections
export const COLLECTIONS = {
  signature_collection: {
    name: "Signature Collection",
    description: "Our most iconic designs, handcrafted with attention to every detail",
    theme: "Timeless pieces that define the Dot For You aesthetic"
  },
  workwear_collection: {
    name: "Workwear Collection",
    description: "Durable garments inspired by Polish craftsmanship and industrial heritage",
    theme: "Built to last, designed for creators and makers"
  },
  comfort_collection: {
    name: "Comfort Collection",
    description: "Everyday essentials that prioritize comfort without sacrificing style",
    theme: "Soft fabrics, relaxed fits, sustainable materials"
  }
} as const;

// Product filtering functions
export function getAvailableProducts(): Product[] {
  return products.filter(product =>
    product.status === 'available' &&
    product.variants.some(variant => variant.available && variant.inventory > 0)
  );
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(product => product.category === category);
}

export function getProductsByCollection(collectionKey: string): Product[] {
  return products.filter(product => product.collection === collectionKey);
}

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(product => product.slug === slug);
}

export function getProductsByStatus(status: ProductStatus): Product[] {
  return products.filter(product => product.status === status);
}

export function getComingSoonProducts(): Product[] {
  return products.filter(product => product.status === 'coming_soon');
}

export function getSoldOutProducts(): Product[] {
  return products.filter(product => product.status === 'disabled' ||
    !product.variants.some(variant => variant.available && variant.inventory > 0)
  );
}

// Search functionality
export function searchProducts(query: string): Product[] {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

  return products.filter(product => {
    const searchableText = [
      product.name,
      product.description,
      product.story,
      product.sku,
      ...product.materials,
      ...product.features,
      ...product.tags,
      product.category,
      product.collection,
      product.artisan
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
}

// Price filtering
export function getProductsInPriceRange(min: number, max: number): Product[] {
  return products.filter(product => product.price >= min && product.price <= max);
}

export function getProductsUnderPrice(maxPrice: number): Product[] {
  return products.filter(product => product.price <= maxPrice);
}

// Tag filtering
export function getProductsByTag(tag: string): Product[] {
  return products.filter(product =>
    product.tags.some(productTag =>
      productTag.toLowerCase().includes(tag.toLowerCase())
    )
  );
}

export function getProductsByTags(tags: string[]): Product[] {
  return products.filter(product =>
    tags.every(tag =>
      product.tags.some(productTag =>
        productTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  );
}

// Material filtering
export function getProductsByMaterial(material: string): Product[] {
  return products.filter(product =>
    product.materials.some(productMaterial =>
      productMaterial.toLowerCase().includes(material.toLowerCase())
    )
  );
}

// Inventory management
export function getTotalStock(productId: string): number {
  const product = getProductById(productId);
  if (!product) return 0;

  return product.variants.reduce((total, variant) => total + variant.inventory, 0);
}

export function getAvailableSizes(productId: string): string[] {
  const product = getProductById(productId);
  if (!product) return [];

  return product.variants
    .filter(variant => variant.available && variant.inventory > 0)
    .map(variant => variant.attributes.size || variant.name);
}

export function getVariantById(productId: string, variantId: string): ProductVariant | undefined {
  const product = getProductById(productId);
  if (!product) return undefined;

  return product.variants.find(variant => variant.id === variantId);
}

export function isInStock(productId: string): boolean {
  return getTotalStock(productId) > 0;
}

// Featured products
export function getFeaturedProducts(limit: number = 4): Product[] {
  return getAvailableProducts()
    .filter(product => product.tags.includes('featured') || product.price > 300)
    .slice(0, limit);
}

export function getNewArrivals(limit: number = 8): Product[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return products
    .filter(product => new Date(product.publishedAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

// Product recommendations
export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
}

export function getCrossSellProducts(productId: string, limit: number = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];

  // Cross-sell products from different categories
  return products
    .filter(p => p.id !== productId && p.category !== product.category && p.status === 'available')
    .slice(0, limit);
}

// Sorting utilities
export function sortProductsByPrice(products: Product[], ascending: boolean = true): Product[] {
  return [...products].sort((a, b) =>
    ascending ? a.price - b.price : b.price - a.price
  );
}

export function sortProductsByName(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortProductsByDate(products: Product[], newest: boolean = true): Product[] {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return newest ? dateB - dateA : dateA - dateB;
  });
}

// Analytics utilities
export function getProductCount(): number {
  return products.length;
}

export function getAveragePrice(): number {
  if (products.length === 0) return 0;
  const total = products.reduce((sum, product) => sum + product.price, 0);
  return Math.round(total / products.length);
}

export function getPriceRange(): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 };

  const prices = products.map(p => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};

  products.forEach(product => {
    counts[product.category] = (counts[product.category] || 0) + 1;
  });

  return counts;
}

export function getCollectionCounts(): Record<string, number> {
  const counts: Record<string, number> = {};

  products.forEach(product => {
    counts[product.collection] = (counts[product.collection] || 0) + 1;
  });

  return counts;
}

// Utility function to generate product URLs
export function getProductUrl(product: Product): string {
  return `/products/${product.slug}`;
}

export function getProductImageUrl(product: Product, type: 'hero' | 'gallery' | 'details' | 'lifestyle' = 'hero'): string {
  if (type === 'hero') return product.images.hero;
  if (type === 'gallery' && product.images.gallery.length > 0) return product.images.gallery[0];
  if (type === 'details' && product.images.details.length > 0) return product.images.details[0];
  if (type === 'lifestyle' && product.images.lifestyle.length > 0) return product.images.lifestyle[0];

  return product.images.hero;
}

// Validation utilities
export function validateProduct(product: Partial<Product>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!product.price || product.price <= 0) {
    errors.push('Product price must be greater than 0');
  }

  if (!product.category) {
    errors.push('Product category is required');
  }

  if (!product.status) {
    errors.push('Product status is required');
  }

  if (!product.images || !product.images.hero) {
    errors.push('Product hero image is required');
  }

  if (!product.variants || product.variants.length === 0) {
    errors.push('Product must have at least one variant');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export everything
export default {
  products,
  COLLECTIONS,
  getAvailableProducts,
  getProductsByCategory,
  getProductsByCollection,
  getProductById,
  getProductBySlug,
  getProductsByStatus,
  getComingSoonProducts,
  getSoldOutProducts,
  searchProducts,
  getProductsInPriceRange,
  getProductsUnderPrice,
  getProductsByTag,
  getProductsByTags,
  getProductsByMaterial,
  getTotalStock,
  getAvailableSizes,
  getVariantById,
  isInStock,
  getFeaturedProducts,
  getNewArrivals,
  getRelatedProducts,
  getCrossSellProducts,
  sortProductsByPrice,
  sortProductsByName,
  sortProductsByDate,
  getProductCount,
  getAveragePrice,
  getPriceRange,
  getCategoryCounts,
  getCollectionCounts,
  getProductUrl,
  getProductImageUrl,
  validateProduct
};