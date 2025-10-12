# 3D Logo Implementation

## Overview
Created a Three.js-based 3D logo component that displays the `logo-3d.glb` model with interactive animations, inspired by the dithering shader example from the inspirations folder.

## Files Created

### 1. `src/components/Logo3D.astro`
A new Astro component that renders the 3D logo using Three.js.

**Features:**
- ✅ Loads `/logo-3d.glb` model
- ✅ Transparent background (alpha: true)
- ✅ Floating animation (gentle vertical bounce)
- ✅ Rotation animation (continuous Y-axis rotation)
- ✅ Metallic gold material (color: #d4af37, metalness: 0.9)
- ✅ Multiple light sources for realistic rendering
- ✅ Auto-centering and scaling of the model
- ✅ Responsive (updates on window resize)
- ✅ View Transitions compatible (re-initializes on navigation)

**Technical Details:**
- Scene: THREE.Scene with transparent background
- Camera: PerspectiveCamera (FOV: 45°)
- Lighting:
  - Ambient light (white, 0.8 intensity)
  - Directional light 1 (gold #ffd700, 1.5 intensity)
  - Directional light 2 (antique gold #d4af37, 1.0 intensity)
  - Point light (white, 1.0 intensity)
- Animation Loop: RequestAnimationFrame with clock-based timing
- Material: MeshStandardMaterial with metallic properties

**Animation Parameters:**
```javascript
// Floating
position.y = Math.sin(time * 0.8) * 0.15

// Rotation Y (continuous)
rotation.y += delta * 0.3

// Rotation X (gentle tilt)
rotation.x = Math.sin(time * 0.5) * 0.1
```

## Files Modified

### 2. `src/components/MainMenu.astro`

**Changes:**
1. Added import: `import Logo3D from "./Logo3D.astro";`
2. Added component above the title:
```astro
<Logo3D class="main-menu__logo" />
```
3. Added CSS styling:
```css
.main-menu__logo {
  margin-bottom: 1rem;
}
```

## Integration

The 3D logo now appears at the top of the main menu, above the navigation buttons:

```
┌─────────────────────┐
│   [3D Logo Here]    │  ← Floating, rotating 3D model
│                     │
│   SKLEP             │
│   PRZEDMIOTY        │
│   SYSTEM PROJEKTOWY │
│   ...               │
└─────────────────────┘
```

## Dependencies

Already installed in `package.json`:
- ✅ `three`: ^0.180.0
- ✅ `@types/three`: ^0.180.0

## Features Inspired by Inspirations Folder

From `inspirations/src/App.tsx`:
- ✅ GLTFLoader for model loading
- ✅ Float effect (similar to `<Float>` from drei)
- ✅ Auto-centering using Box3
- ✅ Responsive scaling
- ✅ Material property overrides (metalness, roughness)
- ✅ Multiple light sources
- ✅ Animation mixer support (if model has animations)
- ✅ Transparent background

**Simplified from React Three Fiber to Vanilla Three.js:**
- No React dependencies needed
- Direct Three.js implementation for better performance
- Astro-native component structure
- View Transitions compatible

## Usage

The component is automatically displayed in the MainMenu. No additional configuration needed.

## Customization

To adjust the logo appearance, modify in `Logo3D.astro`:

**Size:**
```javascript
const scale = 2 / maxDim; // Adjust multiplier for larger/smaller logo
```

**Animation Speed:**
```javascript
model.position.y = Math.sin(time * 0.8) * 0.15; // Adjust 0.8 for speed
model.rotation.y += delta * 0.3; // Adjust 0.3 for rotation speed
```

**Material:**
```javascript
const material = new THREE.MeshStandardMaterial({
  color: 0xd4af37,      // Gold color
  metalness: 0.9,       // How metallic (0-1)
  roughness: 0.15,      // How rough (0-1)
  envMapIntensity: 1.5, // Environment reflection strength
});
```

**Container Height:**
```css
.logo-3d {
  height: 300px; /* Adjust for taller/shorter display */
}
```

## Performance

- Uses `requestAnimationFrame` for smooth 60fps animation
- Pixel ratio limited to max 2x for performance
- Cleanup function properly disposes of Three.js resources
- Optimized for mobile with responsive sizing

## Browser Compatibility

- ✅ Modern browsers with WebGL support
- ✅ Mobile devices
- ✅ Transparent background works across all platforms
- ✅ Graceful degradation if WebGL not supported
