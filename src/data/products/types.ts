/**
 * Dot For You - Product Management Types
 * Comprehensive TypeScript definitions for e-commerce products
 */

// Core product types
export type ProductCategory = 'pants' | 'hoodies' | 'accessories';
export type ProductStatus = 'available' | 'disabled' | 'coming_soon' | 'pre_order';
export type Currency = 'PLN' | 'EUR' | 'USD';

// Product variant size types
export type SizeType = string; // Could be extended to specific sizes like 'XS' | 'S' | 'M' | 'L' | 'XL'
export type SizeSystem = 'EU' | 'UK' | 'US';

// Main product interface
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  story: string;
  price: number;
  comparePrice?: number;
  sku: string;
  status: ProductStatus;
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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  publishedAt: string; // ISO date string
}

// Product images structure
export interface ProductImages {
  hero: string;
  gallery: string[];
  details: string[];
  lifestyle: string[];
  sizeChart?: string;
  videos?: string[];
}

// Product variant interface
export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  sku: string;
  inventory: number;
  available: boolean;
  attributes: VariantAttributes;
}

// Variant attributes
export interface VariantAttributes {
  size?: SizeType;
  color?: string;
  material?: string;
  measurements?: Record<string, number>;
  weight?: number; // in grams
}

// SEO metadata
export interface ProductSEO {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
}

// Inventory information
export interface InventoryInfo {
  trackQuantity: boolean;
  allowBackorder: boolean;
  location: string;
  restockDate?: string | null;
  lowStockThreshold?: number;
}

// Craftsmanship details
export interface CraftsmanshipInfo {
  technique: string;
  hoursSpent: number;
  artisan: string;
  madeIn: string;
  sustainability: string[];
  careInstructions: CareInstructions;
}

// Care instructions
export interface CareInstructions {
  washing: string;
  drying: string;
  ironing: string;
  storage: string;
}

// Collection interface
export interface Collection {
  name: string;
  description: string;
  theme: string;
  image?: string;
  products?: Product[]; // Optional, can be populated dynamically
}

// Product filter options
export interface ProductFilters {
  category?: ProductCategory[];
  status?: ProductStatus[];
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  materials?: string[];
  collections?: string[];
  inStock?: boolean;
  featured?: boolean;
}

// Sort options
export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';

// Search options
export interface SearchOptions {
  query: string;
  filters?: ProductFilters;
  sort?: SortOption;
  limit?: number;
  offset?: number;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Product search result
export interface ProductSearchResult {
  products: Product[];
  pagination: Pagination;
  filters: ProductFilters;
  sort: SortOption;
}

// Shopping cart item (for future implementation)
export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  addedAt: string; // ISO date string
}

// Shopping cart (for future implementation)
export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

// Order interface (for future implementation)
export interface Order {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// Order item
export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  total: number;
}

// Customer information
export interface CustomerInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Address interface
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

// Order status
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

// Payment status
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

// Product review (for future implementation)
export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  rating: number; // 1-5
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
}

// Product analytics
export interface ProductAnalytics {
  productId: string;
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  revenue: number;
  period: {
    start: string;
    end: string;
  };
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Product management API responses
export interface ProductListResponse extends ApiResponse<Product[]> {
  pagination?: Pagination;
}

export interface ProductResponse extends ApiResponse<Product> {}

// Inventory update request
export interface InventoryUpdateRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  operation: 'set' | 'add' | 'subtract';
}

// Product recommendation types
export interface ProductRecommendation {
  product: Product;
  type: 'related' | 'cross_sell' | 'up_sell' | 'featured';
  score: number;
  reason: string;
}

// Wishlist item (for future implementation)
export interface WishlistItem {
  productId: string;
  variantId?: string;
  addedAt: string;
  priority?: 'high' | 'medium' | 'low';
}

// Product comparison
export interface ProductComparison {
  products: Product[];
  attributes: (keyof Product)[];
  addedAt: string;
}

// Export all types for easy importing
export type {
  Product,
  ProductCategory,
  ProductStatus,
  Currency,
  SizeType,
  SizeSystem,
  ProductImages,
  ProductVariant,
  VariantAttributes,
  ProductSEO,
  InventoryInfo,
  CraftsmanshipInfo,
  CareInstructions,
  Collection,
  ProductFilters,
  SortOption,
  SearchOptions,
  Pagination,
  ProductSearchResult,
  CartItem,
  Cart,
  Order,
  OrderItem,
  CustomerInfo,
  Address,
  OrderStatus,
  PaymentStatus,
  ProductReview,
  ProductAnalytics,
  ApiResponse,
  ProductListResponse,
  ProductResponse,
  InventoryUpdateRequest,
  ProductRecommendation,
  WishlistItem,
  ProductComparison
};