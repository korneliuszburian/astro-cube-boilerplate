/**
 * Product Data Management System
 * Gothic Sanctuary - Sacred Relics Database
 */

export interface ProductAsset {
  id: string;
  name: string;
  collection: string;
  status: 'available' | 'disabled' | 'coming_soon';
  maxQuantity: number;
  price: number;
  materials: string[];
  traits: string[];
  images: {
    main: string;
    angles: string[];
    details: string[];
  };
  careInstructions: string;
  origin: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary' | 'artifact';
}

// Gothic Sanctuary Product Database
export const GOTHIC_RELICS: ProductAsset[] = [
  {
    id: "anarchy_pants_2",
    name: "ANARCHY CARGO PANTS",
    collection: "forbidden_collection",
    status: "available",
    maxQuantity: 3,
    price: 350,
    materials: ["100% HEAVY COTTON", "REINFORCED STITCHING"],
    traits: ["MULTIPLE_POCKETS", "TACTICAL_DESIGN", "DRILLED_MARKS"],
    images: {
      main: "/images/products/2/Website/1.webp",
      angles: ["/images/products/2/Website/2.webp", "/images/products/2/Website/3.webp"],
      details: ["/images/products/2/Website/1.webp", "/images/products/2/Website/2.webp"]
    },
    careInstructions: "REVERSE-WASH UNDER MOON'S EYE. MAX 30°C. HANG DRY IN SHADOW.",
    origin: "ENHANCED WRANGLER BASE",
    description: "Cargo pants imbued with anarchist spirit. Multiple pockets serve as vessels for your dark instruments.",
    rarity: "rare"
  },
  {
    id: "gothic_hoodie_3",
    name: "SHADOW VEIL HOODIE",
    collection: "forbidden_collection", 
    status: "available",
    maxQuantity: 2,
    price: 420,
    materials: ["ORGANIC COTTON BLEND", "CEREMONIAL THREAD"],
    traits: ["DEEP_HOOD", "RITUAL_SYMBOLS", "CONCEALMENT"],
    images: {
      main: "/images/products/3/Website/1.webp",
      angles: ["/images/products/3/Website/2.webp", "/images/products/3/Website/3.webp"],
      details: ["/images/products/3/Website/1.webp", "/images/products/3/Website/2.webp"]
    },
    careInstructions: "WASH IN BLESSED WATERS. SACRED RITUAL CLEANSING ONLY.",
    origin: "MONASTERY WORKSHOP",
    description: "Hooded garment woven with protective enchantments. The deep cowl shields the wearer from malevolent gazes.",
    rarity: "legendary"
  },
  {
    id: "combat_boots_4",
    name: "IRON SOUL BOOTS",
    collection: "warrior_artifacts",
    status: "available", 
    maxQuantity: 1,
    price: 280,
    materials: ["GENUINE LEATHER", "IRON REINFORCEMENT", "SACRED OILS"],
    traits: ["STEEL_TOES", "COMBAT_READY", "SOUL_PROTECTION"],
    images: {
      main: "/images/products/4/Website/1.webp",
      angles: ["/images/products/4/Website/2.webp", "/images/products/4/Website/3.webp"],
      details: ["/images/products/4/Website/1.webp", "/images/products/4/Website/2.webp"]
    },
    careInstructions: "ANOINT WITH SACRED OILS. POLISH WITH MOONLIGHT.",
    origin: "BLACKSMITH'S FORGE",
    description: "Combat boots forged for the eternal battle. Each step resonates with the strength of ancient warriors.",
    rarity: "artifact"
  },
  {
    id: "ritual_shirt_5",
    name: "CEREMONIAL SHROUD",
    collection: "ritual_garments",
    status: "available",
    maxQuantity: 4,
    price: 180,
    materials: ["LINEN WEAVE", "RITUAL DYES", "SILVER THREAD"],
    traits: ["CEREMONIAL_CUT", "RITUAL_SYMBOLS", "SACRED_WEAVE"],
    images: {
      main: "/images/products/5/Website/1.webp", 
      angles: ["/images/products/5/Website/2.webp", "/images/products/5/Website/3.webp"],
      details: ["/images/products/5/Website/1.webp", "/images/products/5/Website/2.webp"]
    },
    careInstructions: "HAND-WASH IN SPRING WATER. DRY UNDER STARLIGHT.",
    origin: "TEMPLE SEAMSTRESS",
    description: "Ceremonial garment worn during sacred rites. The silver threading channels mystical energies.",
    rarity: "common"
  },
  {
    id: "dark_jeans_6",
    name: "OBSIDIAN DENIM",
    collection: "everyday_darkness",
    status: "disabled",
    maxQuantity: 0,
    price: 220,
    materials: ["DARK DENIM", "OBSIDIAN DUST", "SHADOW WEAVE"],
    traits: ["MIDNIGHT_BLACK", "COMFORT_FIT", "SHADOW_BLESSED"],
    images: {
      main: "/images/products/6/Website/1.webp",
      angles: ["/images/products/6/Website/2.webp", "/images/products/6/Website/3.webp"],
      details: ["/images/products/6/Website/1.webp", "/images/products/6/Website/2.webp"]
    },
    careInstructions: "WASH IN DARKNESS. AVOID SUNLIGHT DURING DRYING.",
    origin: "SHADOW LOOM",
    description: "Jeans woven with obsidian dust for ultimate darkness. Currently undergoing ritual enhancement.",
    rarity: "rare"
  }
];

export const COLLECTIONS = {
  forbidden_collection: {
    name: "Forbidden Collection",
    description: "Garments banned by conventional society, infused with rebellious spirit",
    theme: "Anarchist mysticism and revolutionary darkness"
  },
  warrior_artifacts: {
    name: "Warrior Artifacts", 
    description: "Battle-tested gear forged for eternal conflict",
    theme: "Combat readiness meets mystical protection"
  },
  ritual_garments: {
    name: "Ritual Garments",
    description: "Sacred vestments for ceremonial purposes",
    theme: "Spiritual connection through sacred attire"
  },
  everyday_darkness: {
    name: "Everyday Darkness",
    description: "Daily wear infused with gothic essence",
    theme: "Bringing darkness to mundane existence"
  }
};

// Utility functions
export function getAvailableProducts(): ProductAsset[] {
  return GOTHIC_RELICS.filter(product => product.status === 'available');
}

export function getProductsByCollection(collectionKey: string): ProductAsset[] {
  return GOTHIC_RELICS.filter(product => product.collection === collectionKey);
}

export function getProductById(id: string): ProductAsset | undefined {
  return GOTHIC_RELICS.find(product => product.id === id);
}

export function getProductsByRarity(rarity: ProductAsset['rarity']): ProductAsset[] {
  return GOTHIC_RELICS.filter(product => product.rarity === rarity);
}

export function getAllCollections() {
  return COLLECTIONS;
}
