/**
 * Dot For You - Product Data Management System
 * Handmade Clothing & Pants E-commerce Platform
 */

export interface ProductAsset {
  id: string;
  name: string;
  category: 'pants' | 'hoodies' | 'jackets' | 'accessories';
  collection: string;
  status: 'available' | 'disabled' | 'coming_soon' | 'pre_order';
  stock: number;
  price: number;
  materials: string[];
  features: string[];
  sizes: ProductSize[];
  images: ProductImages;
  care: CareInstructions;
  craftsmanship: CraftsmanshipInfo;
  description: string;
  story: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSize {
  size: string;
  available: boolean;
  measurements: {
    waist?: number;
    length?: number;
    chest?: number;
    hips?: number;
  };
}

export interface ProductImages {
  hero: string;
  gallery: string[];
  details: string[];
  lifestyle: string[];
  videos?: string[];
}

export interface CareInstructions {
  washing: string;
  drying: string;
  ironing: string;
  storage: string;
}

export interface CraftsmanshipInfo {
  technique: string;
  hoursSpent: number;
  artisan: string;
  madeIn: string;
  sustainability: string[];
}

// Dot For You Product Database - Based on actual product images
export const DOT_FOR_YOU_PRODUCTS: ProductAsset[] = [
  {
    id: "2",
    name: "Anarchy Cargo Pants",
    category: "pants",
    collection: "signature_collection",
    status: "available",
    stock: 3,
    price: 350,
    materials: ["100% Heavyweight Cotton", "Reinforced Stitching", "YKK Zippers"],
    features: ["Multiple Utility Pockets", "Adjustable Waist", "Double Knee Reinforcement", "Tactical Design"],
    sizes: [
      { size: "S", available: true, measurements: { waist: 76, length: 102 } },
      { size: "M", available: true, measurements: { waist: 81, length: 104 } },
      { size: "L", available: false, measurements: { waist: 86, length: 106 } },
      { size: "XL", available: true, measurements: { waist: 91, length: 108 } }
    ],
    images: {
      hero: "/images/products/2/Website/1.webp",
      gallery: [
        "/images/products/2/Website/1.webp",
        "/images/products/2/Website/2.webp",
        "/images/products/2/Website/3.webp"
      ],
      details: [
        "/images/products/2/Items/IMG_0779.png",
        "/images/products/2/Items/IMG_0780.png",
        "/images/products/2/Items/IMG_0781.png"
      ],
      lifestyle: [
        "/images/products/2/InstagramPost/2 First.png",
        "/images/products/2/InstagramPost/2 Second.png"
      ],
      videos: []
    },
    care: {
      washing: "Machine wash cold, inside out with similar colors",
      drying: "Tumble dry low or hang dry",
      ironing: "Medium heat, avoid zippers and buttons",
      storage: "Hang in cool, dry place"
    },
    craftsmanship: {
      technique: "Traditional tailoring with modern utility design",
      hoursSpent: 12,
      artisan: "Maria Kowalska",
      madeIn: "Warsaw, Poland",
      sustainability: ["Heavyweight cotton", "Reinforced stitching", "Zero waste pattern cutting"]
    },
    description: "Handcrafted cargo pants combining utility with street style. Features reinforced stitching and ample storage for everyday essentials.",
    story: "Born from the streets of Warsaw, these cargo pants represent freedom and functionality. Each pocket tells a story of urban exploration.",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-01")
  },
  {
    id: "3",
    name: "Shadow Veil Hoodie",
    category: "hoodies",
    collection: "signature_collection",
    status: "available",
    stock: 2,
    price: 420,
    materials: ["Organic Cotton Blend", "Ceremonial Thread", "French Terry"],
    features: ["Deep Hood", "Ritual Symbols", "Concealment Design", "Kangaroo Pocket"],
    sizes: [
      { size: "S", available: true, measurements: { chest: 96, length: 68 } },
      { size: "M", available: true, measurements: { chest: 101, length: 70 } },
      { size: "L", available: false, measurements: { chest: 106, length: 72 } }
    ],
    images: {
      hero: "/images/products/3/Website/1.webp",
      gallery: [
        "/images/products/3/Website/1.webp",
        "/images/products/3/Website/2.webp",
        "/images/products/3/Website/3.webp"
      ],
      details: [
        "/images/products/3/Items/IMG_0773.png",
        "/images/products/3/Items/IMG_0774.png",
        "/images/products/3/Items/IMG_0775.png"
      ],
      lifestyle: [
        "/images/products/3/InstagramPost/3 First.png",
        "/images/products/3/InstagramPost/3 Second.png"
      ]
    },
    care: {
      washing: "Machine wash cold, gentle cycle",
      drying: "Tumble dry low",
      ironing: "Low heat if needed",
      storage: "Fold to maintain shape"
    },
    craftsmanship: {
      technique: "Modern comfort wear with attention to detail",
      hoursSpent: 8,
      artisan: "Anna Nowak",
      madeIn: "Kraków, Poland",
      sustainability: ["Organic cotton", "Eco-friendly dyes", "Recycled packaging"]
    },
    description: "Premium hoodie with deep cowl and intricate details. The perfect blend of comfort and mystique.",
    story: "Inspired by Polish folklore and shadow theater, this hoodie provides both comfort and an air of mystery.",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-09-15")
  },
  {
    id: "4",
    name: "Iron Soul Boots",
    category: "accessories",
    collection: "workwear_collection",
    status: "available",
    stock: 1,
    price: 280,
    materials: ["Genuine Leather", "Iron Reinforcement", "Sacred Oils", "Solid Rubber Sole"],
    features: ["Steel Toes", "Combat Ready", "Soul Protection", "Reinforced Heel"],
    sizes: [
      { size: "42", available: true, measurements: { waist: 27, length: 30 } },
      { size: "43", available: false, measurements: { waist: 28, length: 30 } },
      { size: "44", available: true, measurements: { waist: 29, length: 31 } }
    ],
    images: {
      hero: "/images/products/4/Website/1.webp",
      gallery: [
        "/images/products/4/Website/1.webp",
        "/images/products/4/Website/2.webp",
        "/images/products/4/Website/3.webp"
      ],
      details: [
        "/images/products/4/Items/IMG_0776.png",
        "/images/products/4/Items/IMG_0777.png",
        "/images/products/4/Items/IMG_0778.png"
      ],
      lifestyle: [
        "/images/products/4/InstagramPost/4 First.png",
        "/images/products/4/InstagramPost/4 Second.png"
      ]
    },
    care: {
      washing: "Wipe with damp cloth",
      drying: "Air dry at room temperature",
      ironing: "Not applicable",
      storage: "Keep in cool, dry place away from direct sunlight"
    },
    craftsmanship: {
      technique: "Traditional bootmaking with modern reinforcement",
      hoursSpent: 20,
      artisan: "Piotr Wiśniewski",
      madeIn: "Gdańsk, Poland",
      sustainability: ["Genuine leather", "Steel reinforcement", "Natural oils"]
    },
    description: "Combat boots forged for the eternal journey. Each step resonates with the strength of ancient warriors.",
    story: "Forged in the shipyards of Gdańsk, these boots carry the spirit of Polish industrial heritage and resilience.",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-10-10")
  },
  {
    id: "5",
    name: "Ceremonial Shirt",
    category: "hoodies",
    collection: "signature_collection",
    status: "available",
    stock: 4,
    price: 180,
    materials: ["Linen Weave", "Ritual Dyes", "Silver Thread", "Natural Fibers"],
    features: ["Ceremonial Cut", "Ritual Symbols", "Sacred Weave", "Relaxed Fit"],
    sizes: [
      { size: "S", available: true, measurements: { chest: 96, length: 72 } },
      { size: "M", available: true, measurements: { chest: 101, length: 74 } },
      { size: "L", available: true, measurements: { chest: 106, length: 76 } }
    ],
    images: {
      hero: "/images/products/5/Website/1.webp",
      gallery: [
        "/images/products/5/Website/1.webp",
        "/images/products/5/Website/2.webp",
        "/images/products/5/Website/3.webp"
      ],
      details: [
        "/images/products/5/Items/IMG_0792.png",
        "/images/products/5/Items/IMG_0793.png",
        "/images/products/5/Items/IMG_0794.png"
      ],
      lifestyle: [
        "/images/products/5/InstagramPost/5 First.png",
        "/images/products/5/InstagramPost/5 Second.png"
      ]
    },
    care: {
      washing: "Hand wash cold, gentle",
      drying: "Hang dry in shade",
      ironing: "Warm iron with cloth",
      storage: "Fold and store in dry place"
    },
    craftsmanship: {
      technique: "Traditional textile art with modern touches",
      hoursSpent: 15,
      artisan: "Ewa Dąbrowska",
      madeIn: "Łódź, Poland",
      sustainability: ["Natural linen", "Plant-based dyes", "Hand-loom techniques"]
    },
    description: "Ceremonial garment worn during sacred moments. The silver threading channels mystical energies.",
    story: "Created in the textile capital of Poland, this shirt honors the ancient traditions of Łódź weavers.",
    createdAt: new Date("2024-01-25"),
    updatedAt: new Date("2024-09-20")
  },
  {
    id: "6",
    name: "Obsidian Denim",
    category: "pants",
    collection: "workwear_collection",
    status: "disabled",
    stock: 0,
    price: 220,
    materials: ["Dark Denim", "Obsidian Dust", "Shadow Weave", "Cotton Blend"],
    features: ["Midnight Black", "Comfort Fit", "Shadow Blessed", "Classic Cut"],
    sizes: [
      { size: "M", available: false, measurements: { waist: 81, length: 104 } },
      { size: "L", available: false, measurements: { waist: 86, length: 106 } }
    ],
    images: {
      hero: "/images/products/6/Website/1.webp",
      gallery: [
        "/images/products/6/Website/1.webp",
        "/images/products/6/Website/2.webp",
        "/images/products/6/Website/3.webp"
      ],
      details: [
        "/images/products/6/Items/IMG_0785.png",
        "/images/products/6/Items/IMG_0786.png",
        "/images/products/6/Items/IMG_0787.png"
      ],
      lifestyle: [
        "/images/products/6/InstagramPost/6 First.png",
        "/images/products/6/InstagramPost/6 Second.png"
      ]
    },
    care: {
      washing: "Wash in cold water, inside out",
      drying: "Hang dry in shade",
      ironing: "Medium heat",
      storage: "Hang in dark place"
    },
    craftsmanship: {
      technique: "Modern denim processing with traditional techniques",
      hoursSpent: 10,
      artisan: "Jakub Kowalczyk",
      madeIn: "Wrocław, Poland",
      sustainability: ["Recycled denim", "Natural dyes", "Water conservation"]
    },
    description: "Jeans woven with obsidian dust for ultimate darkness. Currently undergoing ritual enhancement.",
    story: "From the Gothic architecture of Wrocław comes these denim pieces that capture the city's mysterious atmosphere.",
    createdAt: new Date("2024-04-15"),
    updatedAt: new Date("2024-10-12")
  }
];

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
};

// Dynamic product management functions
export function getAvailableProducts(): ProductAsset[] {
  return DOT_FOR_YOU_PRODUCTS.filter(product =>
    product.status === 'available' && product.stock > 0
  );
}

export function getProductsByCategory(category: ProductAsset['category']): ProductAsset[] {
  return DOT_FOR_YOU_PRODUCTS.filter(product => product.category === category);
}

export function getProductsByCollection(collectionKey: string): ProductAsset[] {
  return DOT_FOR_YOU_PRODUCTS.filter(product => product.collection === collectionKey);
}

export function getProductById(id: string): ProductAsset | undefined {
  return DOT_FOR_YOU_PRODUCTS.find(product => product.id === id);
}

export function getProductsByStatus(status: ProductAsset['status']): ProductAsset[] {
  return DOT_FOR_YOU_PRODUCTS.filter(product => product.status === status);
}

export function getComingSoonProducts(): ProductAsset[] {
  return DOT_FOR_YOU_PRODUCTS.filter(product => product.status === 'coming_soon');
}

export function searchProducts(query: string): ProductAsset[] {
  const searchTerms = query.toLowerCase().split(' ');
  return DOT_FOR_YOU_PRODUCTS.filter(product => {
    const searchableText = [
      product.name,
      product.description,
      product.story,
      ...product.materials,
      ...product.features,
      product.category,
      product.collection
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableText.includes(term));
  });
}

export function getProductsInPriceRange(min: number, max: number): ProductAsset[] {
  return DOT_FOR_YOU_PRODUCTS.filter(product =>
    product.price >= min && product.price <= max
  );
}

export function getAvailableSizes(productId: string): string[] {
  const product = getProductById(productId);
  if (!product) return [];

  return product.sizes
    .filter(size => size.available)
    .map(size => size.size);
}

export function getAllCollections() {
  return COLLECTIONS;
}

// Stock management functions
export function updateProductStock(id: string, newStock: number): boolean {
  const productIndex = DOT_FOR_YOU_PRODUCTS.findIndex(p => p.id === id);
  if (productIndex === -1) return false;

  DOT_FOR_YOU_PRODUCTS[productIndex].stock = newStock;
  DOT_FOR_YOU_PRODUCTS[productIndex].status = newStock > 0 ? 'available' : 'disabled';
  DOT_FOR_YOU_PRODUCTS[productIndex].updatedAt = new Date();

  return true;
}

export function decreaseStock(id: string, quantity: number = 1): boolean {
  const product = getProductById(id);
  if (!product || product.stock < quantity) return false;

  return updateProductStock(id, product.stock - quantity);
}
