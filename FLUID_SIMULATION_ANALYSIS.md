# FLIP Fluid Simulation Triangle Obstacle Analysis

## Overview
This is a sophisticated FLIP (Fluid-Implicit Particle) fluid simulation with a triangular obstacle system. The simulation uses advanced physics algorithms to create realistic fluid behavior with particle-based rendering.

## Core Architecture

### 1. Grid System Setup
```javascript
// Lines 94-104: Dynamic grid sizing based on screen
const GRID_SIZE = Math.max(
  Math.round(Math.sqrt((window.innerWidth * window.innerHeight) / TARGET_LONG_SIDE)),
  MIN_GRID_SIZE
);

const realWidth = Math.ceil(window.innerWidth / GRID_SIZE + CELL_CROP_X * 2) * GRID_SIZE;
const realHeight = Math.ceil(window.innerHeight / GRID_SIZE + CELL_CROP_Y * 2) * GRID_SIZE;
```

**How it works:**
- The simulation creates a grid that scales with screen size
- `TARGET_LONG_SIDE = 128 * 74` creates an optimal resolution for ASCII rendering
- `CELL_CROP_X/Y = 1/2` removes edge cells to prevent rendering artifacts
- Grid size determines both physics resolution and ASCII character size

### 2. Physics Constants
```javascript
const GRAVITY = -9.81;         // Standard Earth gravity
const SPEED_1 = 1.0/60.0/16;    // Slow motion for dragging
const SPEED_BASE = 1.0/60.0/3;  // Normal simulation speed
const SPEED_2 = 1.0/60.0/1.25;  // Fast motion after drag
```

## The Triangle Obstacle System

### Where the Triangle is Defined: **Lines 344-358**
```javascript
// Define triangle vertices based on obstacleX, obstacleY and obstacleRadius
const trianglePoints = [
  {
    x: obstacleX,
    y: obstacleY + obstacleRadius,
  }, // top vertex
  {
    x: obstacleX - obstacleRadius * Math.cos(Math.PI / 6),
    y: obstacleY - obstacleRadius * Math.sin(Math.PI / 6),
  }, // bottom left vertex
  {
    x: obstacleX + obstacleRadius * Math.cos(Math.PI / 6),
    y: obstacleY - obstacleRadius * Math.sin(Math.PI / 6),
  }, // bottom right vertex
];
```

**Triangle Mathematics:**
- **Equilateral Triangle**: All angles are 60°
- **Top Vertex**: Directly above center by `obstacleRadius`
- **Bottom Vertices**: Calculated using trigonometry:
  - `Math.cos(π/6) = cos(30°) = √3/2 ≈ 0.866`
  - `Math.sin(π/6) = sin(30°) = 0.5`
  - Bottom left: `x = centerX - radius * 0.866`, `y = centerY - radius * 0.5`
  - Bottom right: `x = centerX + radius * 0.866`, `y = centerY - radius * 0.5`

### Point-in-Triangle Test: **Lines 361-372**
```javascript
function pointInTriangle(px, py, v1, v2, v3) {
  let d1 = sign(px, py, v1.x, v1.y, v2.x, v2.y);
  let d2 = sign(px, py, v2.x, v2.y, v3.x, v3.y);
  let d3 = sign(px, py, v3.x, v3.y, v1.x, v1.y);
  let hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  let hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function sign(px, py, x1, y1, x2, y2) {
  return (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
}
```

**How Point-in-Triangle Works:**
- Uses **cross product sign test** (barycentric coordinate method)
- For each edge of triangle, calculate which side the point is on
- If point is on same side of all edges → inside triangle
- If point is on different sides → outside triangle
- `sign()` function calculates cross product to determine orientation

### Collision Response: **Lines 384-436**
```javascript
if (pointInTriangle(x, y, trianglePoints[0], trianglePoints[1], trianglePoints[2])) {
  // Find closest point on triangle and push particle out
  let closestPoint = { x: x, y: y };
  let minDist = Number.MAX_VALUE;

  // Check against each edge
  for (let i = 0; i < 3; i++) {
    let p1 = trianglePoints[i];
    let p2 = trianglePoints[(i + 1) % 3];

    let edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    let point = { x: x - p1.x, y: y - p1.y };

    let len = edge.x * edge.x + edge.y * edge.y;
    let t = Math.max(0, Math.min(1, (point.x * edge.x + point.y * edge.y) / len));

    let proj = {
      x: p1.x + t * edge.x,
      y: p1.y + t * edge.y,
    };

    let dist = Math.sqrt((x - proj.x) * (x - proj.x) + (y - proj.y) * (y - proj.y));
    if (dist < minDist) {
      minDist = dist;
      closestPoint = proj;
    }
  }

  // Push particle out
  let dx = x - closestPoint.x;
  let dy = y - closestPoint.y;
  let d = Math.sqrt(dx * dx + dy * dy);
  if (d > 0) {
    x = closestPoint.x;
    y = closestPoint.y;
  }

  this.particleVel[2 * i] = 0; // Zero velocity
  this.particleVel[2 * i + 1] = 0;
}
```

**Collision Physics Breakdown:**
1. **Find Closest Point**: For each triangle edge, project particle onto edge
2. **Edge Projection**: Uses dot product to find closest point on line segment
3. **Distance Calculation**: Euclidean distance to closest point
4. **Position Correction**: Move particle to closest point on triangle boundary
5. **Velocity Zeroing**: Stop particle movement when hitting obstacle

## Fluid Physics System

### FLIP Algorithm Components

#### 1. Particle Integration: **Lines 199-214**
```javascript
integrateParticles(dt) {
  for (var i = 0; i < this.numParticles; i++) {
    let gravityX = 0;
    let gravityY = GRAVITY;

    if (window.gravityVector) {
      gravityX = window.gravityVector.x;
      gravityY = window.gravityVector.y;
    }

    this.particleVel[2 * i] += dt * gravityX;
    this.particleVel[2 * i + 1] += dt * gravityY;
    this.particlePos[2 * i] += this.particleVel[2 * i] * dt;
    this.particlePos[2 * i + 1] += this.particleVel[2 * i + 1] * dt;
  }
}
```

**Integration Method:**
- **Explicit Euler Integration**: `position += velocity * dt`
- **Gravity Application**: Standard acceleration with optional device motion
- **Device Motion Support**: Uses accelerometer data for mobile tilt control

#### 2. Particle Separation: **Lines 216-329**
```javascript
pushParticlesApart(numIters) {
  // Count particles per cell
  this.numCellParticles.fill(0);
  for (var i = 0; i < this.numParticles; i++) {
    var xi = clamp(Math.floor(x * this.pInvSpacing), 0, this.pNumX - 1);
    var yi = clamp(Math.floor(y * this.pInvSpacing), 0, this.pNumY - 1);
    var cellNr = xi * this.pNumY + yi;
    this.numCellParticles[cellNr]++;
  }

  // Create spatial hash grid
  for (var i = 0; i < this.numParticles; i++) {
    // ... fill cellParticleIds array
  }

  // Push particles apart
  var minDist = 2.0 * this.particleRadius;
  for (var iter = 0; iter < numIters; iter++) {
    // Check neighboring cells and push overlapping particles
  }
}
```

**Spatial Optimization:**
- **Grid-Based Collision Detection**: Only check nearby particles
- **Hash Map**: Efficient particle lookup in neighboring cells
- **Iterative Separation**: Multiple passes for stable configuration

#### 3. Velocity Transfer: **Lines 512-658**
```javascript
transferVelocities(toGrid, flipRatio) {
  if (toGrid) {
    // P2G (Particle to Grid): Transfer particle velocities to grid
    for (var i = 0; i < this.numParticles; i++) {
      // Bilinear interpolation to grid points
      f[nr0] += pv * d0; d[nr0] += d0;
    }
  } else {
    // G2P (Grid to Particle): Transfer grid velocities back to particles
    var picV = (weighted average of grid velocities);
    var flipV = v + (grid velocity - previous grid velocity);
    this.particleVel[2 * i + component] = (1.0 - flipRatio) * picV + flipRatio * flipV;
  }
}
```

**FLIP Method Explained:**
- **PIC (Particle in Cell)**: Simple velocity interpolation from grid
- **FLIP**: Incremental velocity change from previous frame
- **Blend**: `0.9 * FLIP + 0.1 * PIC` for stability
- **Preserves Detail**: FLIP maintains fluid vorticity and detail

#### 4. Incompressibility Solver: **Lines 660-722**
```javascript
solveIncompressibility(numIters, dt, overRelaxation, compensateDrift) {
  for (var iter = 0; iter < numIters; iter++) {
    for (var i = 1; i < this.fNumX - 1; i++) {
      for (var j = 1; j < this.fNumY - 1; j++) {
        // Calculate velocity divergence
        var div = this.u[right] - this.u[center] + this.v[top] - this.v[center];

        // Apply pressure correction
        var p = -div / s;
        p *= overRelaxation;

        // Update velocities
        this.u[center] -= sx0 * p;
        this.u[right] += sx1 * p;
        this.v[center] -= sy0 * p;
        this.v[top] += sy1 * p;
      }
    }
  }
}
```

**Pressure Solver:**
- **Divergence-Free Constraint**: Enforce incompressibility
- **Jacobi Iteration**: Multiple iterations for convergence
- **Over-Relaxation**: `1.9 * pressure` for faster convergence
- **Boundary Conditions**: No-slip conditions at walls

## Interaction System

### Mouse/Touch Controls: **Lines 996-1064**
```javascript
function startDrag(x, y) {
  let bounds = canvasEl.getBoundingClientRect();
  let mx = x - bounds.left - canvasEl.clientLeft;
  let my = y - bounds.top - canvasEl.clientTop;

  x = mx / cScale;  // Convert to simulation coordinates
  y = (canvasEl.height - my) / cScale;

  setObstacle(x, y, true);
  scene.paused = false;
}
```

**Coordinate Transformation:**
- Screen coordinates → Simulation coordinates
- Y-axis inversion for different coordinate systems
- Dynamic obstacle radius based on interaction

### Obstacle Grid Modification: **Lines 954-990**
```javascript
function setObstacle(x, y, reset) {
  var r = scene.obstacleRadius;
  var f = scene.fluid;

  for (var i = 1; i < f.numX - 2; i++) {
    for (var j = 1; j < f.numY - 2; j++) {
      f.s[i * n + j] = 1.0;  // Set as fluid cell

      dx = (i + 0.5) * f.h - x;
      dy = (j + 0.5) * f.h - y;

      if (dx * dx + dy * dy < r * r) {
        f.s[i * n + j] = 0.0;  // Set as solid cell (obstacle)
        f.u[i * n + j] = vx;  // Set velocity for moving obstacle
        f.v[i * n + j] = vy;
      }
    }
  }
}
```

**Grid-Based Obstacle:**
- Mark grid cells as solid/obstacle
- Radius-based collision detection
- Velocity transfer for moving obstacles

## Rendering System

### ASCII Rendering: **Lines 1176-1199**
```javascript
if (renderAscii) {
  let toRender = "";
  for (let i = f.fNumY - CELL_CROP_Y; i > CELL_CROP_Y; i--) {
    let row = "";
    for (let j = CELL_CROP_X; j < f.fNumX - CELL_CROP_X; j++) {
      const CURRENT_RENDER_CHAR = RENDER_CHARS[Math.floor((i + j + 1) % RENDER_CHARS.length)];

      const RENDER_CHAR_DICTIONARY = CURRENT_RENDER_CHAR.sort((a, b) => a[1] - b[1])
        .map(([char]) => char).join("");

      const cellColor = f.cellColor[3 * (j * f.fNumY + i)];
      row += RENDER_CHAR_DICTIONARY[Math.floor(cellColor * RENDER_CHAR_DICTIONARY.length)];
    }
    toRender += row + "\n";
  }
  renderEl.innerHTML = toRender;
}
```

**ASCII Art Generation:**
- **Character Sets**: Different character dictionaries for visual variety
- **Density Mapping**: Cell color determines character brightness
- **Animated Patterns**: Character sets cycle based on position + time
- **Crop System**: Remove edge artifacts with `CELL_CROP_X/Y`

### Character Brightness Mapping: **Lines 27-46**
```javascript
const BASE = [
  ["~", 12198],   // Medium brightness character
  [":", 6921],    // Lower brightness
  ["-", 5589],    // Even lower
  ["·", 3267],    // Very low
  [" ", 0],       // Empty space
];

const RENDER_CHARS = [
  [["D", 33195], ["D", 33195], ["d", 28686], ...BASE],  // Bright set
  [["O", 32244], ["O", 32244], ["o", 22527], ...BASE],  // Medium set
  [["T", 20718], ["T", 20718], ["t", 16572], ...BASE],  // Dark set
];
```

**Visual System:**
- **Luminance Values**: Characters sorted by pixel brightness
- **Dynamic Selection**: Different character sets for visual variety
- **Fluid Density Mapping**: Higher density = brighter characters

## Key Innovations

### 1. Triangle Obstacle System
- **Geometric Precision**: Exact mathematical triangle definition
- **Robust Collision**: Edge-based collision detection
- **Smooth Response**: Closest point projection for natural particle behavior

### 2. Spatial Hashing
- **Efficient Collision**: Only check nearby particles
- **Grid-Based Lookup**: O(1) particle neighbor finding
- **Memory Efficient**: Reusable grid structure

### 3. FLIP Hybrid Method
- **Best of Both Worlds**: PIC stability + FLIP detail preservation
- **Tunable Blend**: Adjustable flip ratio for different effects
- **Vorticity Preservation**: Maintains fluid swirls and detail

### 4. Adaptive Resolution
- **Screen-Size Scaling**: Grid adapts to display size
- **Performance Optimization**: Maintains 60fps on various devices
- **Visual Consistency**: Consistent ASCII rendering across resolutions

## Performance Optimizations

1. **Typed Arrays**: Use Float32Array and Int32Array for performance
2. **Memory Pooling**: Pre-allocate arrays, reuse during simulation
3. **Spatial Hashing**: Reduce collision detection from O(n²) to O(n)
4. **Grid Culling**: Only simulate active regions
5. **ASCII Caching**: Reuse character dictionaries

## Mathematical Foundation

### Core Equations:
1. **Navier-Stokes**: `∂v/∂t + (v·∇)v = -∇p/ρ + ν∇²v + g`
2. **Incompressibility**: `∇·v = 0`
3. **Pressure Projection**: `∇²p = ρ/Δt · ∇·v*`

### Discretization:
- **Staggered Grid**: MAC grid for stability
- **Semi-Lagrangian**: Advection for numerical stability
- **Implicit Pressure**: Guaranteed incompressibility

This implementation represents a sophisticated fluid simulation that combines academic research algorithms with practical optimizations for real-time ASCII art rendering. The triangle obstacle system is particularly impressive for its geometric precision and smooth collision response.