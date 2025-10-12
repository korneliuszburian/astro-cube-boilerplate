import { initHeroEffect } from "./hero-effect.js";
import { initHeroEffect2 } from "./hero-effect-02.js";
import { initHeroEffect3 } from "./hero-effect-03.js";

let heroEffects = [];

// Asset sets configuration (matching the structure from the reference)
const assetSets = {
  pictures_1: {
    raw1: '/assets/hero/pictures_1/raw-1.png',
    depth1: '/assets/hero/pictures_1/depth-1.png',
    raw2: '/assets/hero/pictures_1/raw-2.png',
    depth2: '/assets/hero/pictures_1/depth-2.png',
    edge2: '/assets/hero/pictures_1/edge-2.png',
    raw3: '/assets/hero/pictures_1/raw-3.jpg',
    depth3: '/assets/hero/pictures_1/depth-3.png'
  },
  pictures_2: {
    raw1: '/assets/hero/pictures_2/raw-1.png',
    depth1: '/assets/hero/pictures_2/depth-1.png',
    raw2: '/assets/hero/pictures_2/raw-2.png',
    depth2: '/assets/hero/pictures_2/depth-2.png',
    edge2: '/assets/hero/pictures_2/edge-2.png',
    raw3: '/assets/hero/pictures_2/raw-3.jpg',
    depth3: '/assets/hero/pictures_2/depth-3.png'
  },
  pictures_3: {
    raw1: '/assets/hero/pictures_3/raw-1.png',
    depth1: '/assets/hero/pictures_3/depth-1.png',
    raw2: '/assets/hero/pictures_3/raw-2.png',
    depth2: '/assets/hero/pictures_3/depth-2.png',
    edge2: '/assets/hero/pictures_3/edge-2.png',
    raw3: '/assets/hero/pictures_3/raw-3.jpg',
    depth3: '/assets/hero/pictures_3/depth-3.png'
  },
  pictures_4: {
    raw1: '/assets/hero/pictures_4/raw-1.png',
    depth1: '/assets/hero/pictures_4/depth-1.png',
    raw2: '/assets/hero/pictures_4/raw-2.png',
    depth2: '/assets/hero/pictures_4/depth-2.png',
    edge2: '/assets/hero/pictures_4/edge-2.png',
    raw3: '/assets/hero/pictures_4/raw-3.jpg',
    depth3: '/assets/hero/pictures_4/depth-3.png'
  },
  pictures_5: {
    raw1: '/assets/hero/pictures_5/raw-1.png',
    depth1: '/assets/hero/pictures_5/depth-1.png',
    raw2: '/assets/hero/pictures_5/raw-2.png',
    depth2: '/assets/hero/pictures_5/depth-2.png',
    edge2: '/assets/hero/pictures_5/edge-2.png',
    raw3: '/assets/hero/pictures_5/raw-3.jpg',
    depth3: '/assets/hero/pictures_5/depth-3.png'
  }
};

// Current state
let currentAssetSet = 'pictures_1';
let currentEffect = 'effect1';
let currentImage = 'raw1'; // Add current image state

// Parameter state
let currentParameters = {
  intensity: 2.0,
  brightness: 1.5,
  scanSpeed: 3.0
};

function shouldLog() {
  return window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1");
}

function cleanupHeroEffects() {
  heroEffects.forEach((effect) => effect?.destroy?.());
  heroEffects = [];
}

function initializeHeroEffects() {
  cleanupHeroEffects();

  const heroContainers = document.querySelectorAll(".hero__image-container");
  if (!heroContainers.length) {
    if (shouldLog()) {
      console.log("No hero containers found");
    }
    return;
  }

  heroContainers.forEach((container) => {
    const assets = assetSets[currentAssetSet];
    if (!assets) {
      if (shouldLog()) {
        console.error("Asset set not found:", currentAssetSet);
      }
      return;
    }

    // Get the appropriate image based on current effect and current image
    let imageUrl, depthMapUrl, edgeMapUrl;

    if (currentEffect === 'effect1') {
      imageUrl = assets[currentImage]; // Use current image (raw1, raw2, or raw3)
      depthMapUrl = assets[currentImage.replace('raw', 'depth')]; // Corresponding depth map
    } else if (currentEffect === 'effect2') {
      imageUrl = assets[currentImage];
      depthMapUrl = assets[currentImage.replace('raw', 'depth')];
      edgeMapUrl = assets.edge2; // Effect 2 always uses edge2
    } else if (currentEffect === 'effect3') {
      imageUrl = assets[currentImage];
      depthMapUrl = assets[currentImage.replace('raw', 'depth')];
    }

    let effect;

    if (currentEffect === 'effect1') {
      effect = initHeroEffect({
        container,
        imageUrl: imageUrl,
        depthMapUrl: depthMapUrl,
        intensity: currentParameters.intensity,
        brightness: currentParameters.brightness,
        color: [15.0, 0.0, 0.0],
        scanSpeed: currentParameters.scanSpeed
      });
    } else if (currentEffect === 'effect2') {
      effect = initHeroEffect2({
        container,
        imageUrl: imageUrl,
        depthMapUrl: depthMapUrl,
        edgeMapUrl: edgeMapUrl,
        intensity: currentParameters.intensity,
        brightness: currentParameters.brightness,
        color: [0.9, 0.39, 0.12],
        scanSpeed: currentParameters.scanSpeed
      });
    } else if (currentEffect === 'effect3') {
      effect = initHeroEffect3({
        container,
        imageUrl: imageUrl,
        depthMapUrl: depthMapUrl,
        intensity: currentParameters.intensity,
        brightness: currentParameters.brightness,
        color: [0.9, 0.39, 0.12],
        scanSpeed: currentParameters.scanSpeed
      });
    }

    if (effect) {
      heroEffects.push(effect);
      if (shouldLog()) {
        console.log(`Initialized ${currentEffect} with ${currentAssetSet} and ${currentImage}`);
      }
    }
  });

  // Update global reference
  window.heroEffects = heroEffects;
}

function switchEffect(effectName) {
  if (currentEffect === effectName) return;

  currentEffect = effectName;
  initializeHeroEffects();

  // Update UI button states
  updateEffectButtons();

  if (shouldLog()) {
    console.log("Switched to effect:", effectName);
  }
}

function switchAssetSet(assetSetName) {
  if (currentAssetSet === assetSetName) return;

  currentAssetSet = assetSetName;
  initializeHeroEffects();

  // Update UI button states
  updateAssetButtons();

  if (shouldLog()) {
    console.log("Switched to asset set:", assetSetName);
  }
}

function switchImage(imageName) {
  if (currentImage === imageName) return;

  currentImage = imageName;
  initializeHeroEffects();

  // Update UI button states
  updateImageButtons();

  if (shouldLog()) {
    console.log("Switched to image:", imageName);
  }
}


function updateEffectButtons() {
  const effectButtons = document.querySelectorAll('[data-effect]');
  effectButtons.forEach(btn => {
    const effectName = btn.getAttribute('data-effect');
    if (effectName === currentEffect) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateAssetButtons() {
  const assetButtons = document.querySelectorAll('[data-set]');
  assetButtons.forEach(btn => {
    const assetName = btn.getAttribute('data-set');
    if (assetName === currentAssetSet) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateImageButtons() {
  const imageButtons = document.querySelectorAll('[data-image]');
  imageButtons.forEach(btn => {
    const imageName = btn.getAttribute('data-image');
    if (imageName === currentImage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateParameters(params) {
  // Update current parameters state
  currentParameters = {
    ...currentParameters,
    ...params
  };

  // Update all active hero effects with new parameters
  heroEffects.forEach(effect => {
    if (effect && effect.updateOptions) {
      effect.updateOptions(params);
    }
  });

  if (shouldLog()) {
    console.log("Updated parameters:", currentParameters);
  }
}

function updateIntensity(value) {
  updateParameters({ intensity: parseFloat(value) });
}

function updateBrightness(value) {
  updateParameters({ brightness: parseFloat(value) });
}

function updateScanSpeed(value) {
  updateParameters({ scanSpeed: parseFloat(value) });
}

// Make heroEffects and currentParameters globally accessible
window.heroEffects = heroEffects;
window.currentParameters = currentParameters;

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initializeHeroEffects();

  if (shouldLog()) {
    console.log("Hero effects manager initialized");
  }
});

// Cleanup on page unload
window.addEventListener("pagehide", () => {
  cleanupHeroEffects();
});

// Reinitialize on astro page load (for view transitions)
document.addEventListener("astro:page-load", () => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initializeHeroEffects();
  }, 100);
});

// Export functions for manual control
export {
  initializeHeroEffects,
  cleanupHeroEffects,
  switchEffect,
  switchAssetSet,
  switchImage,
  updateParameters,
  updateIntensity,
  updateBrightness,
  updateScanSpeed,
  currentAssetSet,
  currentEffect,
  currentImage,
  currentParameters,
  heroEffects
};
