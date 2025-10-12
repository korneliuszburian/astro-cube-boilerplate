/*
Modified FLIP Fluid Simulation for Gothic Sanctuary
Based on the original hero-effect-04.js with adaptations for our showcase

Original Copyright 2022 Matthias Müller - Ten Minute Physics
www.youtube.com/c/TenMinutePhysics
www.matthiasMueller.info/tenMinutePhysics

MIT License - See original file for full license
*/

const TARGET_LONG_SIDE = 128 * 74;
const MIN_GRID_SIZE = 8;
const CELL_CROP_X = 1;
const CELL_CROP_Y = 2;

const BASE = [
  ["~", 12198],
  [":", 6921],
  ["-", 5589],
  ["·", 3267],
  [" ", 0],
  [" ", 0],
];

const RENDER_CHARS = [
  [["D", 33195], ["D", 33195], ["d", 28686], ...BASE],
  [["O", 32244], ["O", 32244], ["o", 22527], ...BASE],
  [["T", 20718], ["T", 20718], ["t", 16572], ...BASE],
];

// Gothic-themed rendering characters
const GOTHIC_RENDER_CHARS = [
  [["†", 33195], ["‡", 32244], ["✙", 28686], ...BASE],
  [["☩", 32244], ["✠", 20718], ["✟", 16572], ...BASE],
  [["⚜", 28686], ["⚔", 22527], ["🗡", 16572], ...BASE],
];

let canvasEl, renderEl;
let GRID_SIZE, realWidth, realHeight, Y_RESOLUTION, X_RESOLUTION, RESOLUTION;
let cScale, simWidth, simHeight;
let f; // fluid simulation

const GRAVITY = -9.81;

// Speed constants for different interaction modes
const SPEED_SLOW = 1.0 / 60.0 / 16;
const SPEED_BASE = 1.0 / 60.0 / 3;
const SPEED_FAST = 1.0 / 60.0 / 1.25;

// Fluid simulation state
var scene = {
  gravity: GRAVITY,
  dt: SPEED_BASE,
  flipRatio: 0.9,
  numPressureIters: 30,
  numParticleIters: 2,
  frameNr: 0,
  overRelaxation: 1.9,
  compensateDrift: true,
  separateParticles: true,
  obstacleX: 0.0,
  obstacleY: 0.0,
  obstacleRadius: 0.3,
  paused: false,
  showObstacle: true,
  obstacleVelX: 0.0,
  obstacleVelY: 0.0,
  fluid: null,
  fluidType: 'water',
  density: 1000.0,
  interactionMode: 'touch',
  autoMode: false
};

// Cell type constants
var U_FIELD = 0;
var V_FIELD = 1;
var FLUID_CELL = 0;
var AIR_CELL = 1;
var SOLID_CELL = 2;

function shouldLog() {
  return window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1");
}

function initFluidSimulation() {
  canvasEl = document.getElementById("canvas");
  renderEl = document.querySelector(".render");

  if (!canvasEl || !renderEl) {
    console.error("Fluid simulation container not found");
    return;
  }

  // Calculate grid size based on container
  const container = canvasEl.parentElement;
  GRID_SIZE = Math.max(
    Math.round(
      Math.sqrt(
        (container.clientWidth * container.clientHeight) / TARGET_LONG_SIDE
      )
    ),
    MIN_GRID_SIZE
  );

  realWidth = Math.ceil(container.clientWidth / GRID_SIZE + CELL_CROP_X * 2) * GRID_SIZE;
  realHeight = Math.ceil(container.clientHeight / GRID_SIZE + CELL_CROP_Y * 2) * GRID_SIZE;
  Y_RESOLUTION = realHeight / GRID_SIZE;
  X_RESOLUTION = realWidth / GRID_SIZE;
  RESOLUTION = Y_RESOLUTION;

  // Set canvas dimensions
  canvasEl.width = realWidth;
  canvasEl.height = realHeight;
  canvasEl.style.width = realWidth + "px";
  canvasEl.style.height = realHeight + "px";
  renderEl.style.width = realWidth + "px";
  renderEl.style.height = realHeight + "px";

  // Set CSS variable for cell size
  document.documentElement.style.setProperty("--cell-size", GRID_SIZE + "px");

  // Simulation parameters
  simHeight = 2.0;
  cScale = canvasEl.height / simHeight;
  simWidth = canvasEl.width / cScale;

  // Setup scene and simulation
  setupScene();
  setupInteractionHandlers();

  // Start animation loop
  update();

  if (shouldLog()) {
    console.log(`Fluid simulation initialized: ${X_RESOLUTION}x${Y_RESOLUTION} grid`);
  }
}

function setupScene() {
  var res = RESOLUTION;
  var tankHeight = 1.0 * simHeight;
  var tankWidth = 1.0 * simWidth;
  var h = tankHeight / res;

  // Calculate number of particles for dam break
  var relWaterHeight = 0.618;
  var relWaterWidth = 0.8;

  var r = 0.3 * h; // particle radius w.r.t. cell size
  var dx = 2.0 * r;
  var dy = (Math.sqrt(3.0) / 2.0) * dx;

  var numX = Math.floor((relWaterWidth * tankWidth - 2.0 * h - 2.0 * r) / dx);
  var numY = Math.floor((relWaterHeight * tankHeight - 2.0 * h - 2.0 * r) / dy);
  var maxParticles = numX * numY;

  // Create fluid with current density
  f = scene.fluid = new FlipFluid(
    scene.density,
    tankWidth,
    tankHeight,
    h,
    r,
    maxParticles
  );

  // Create particles
  f.numParticles = numX * numY;
  var p = 0;
  for (var i = 0; i < numX; i++) {
    for (var j = 0; j < numY; j++) {
      // Center horizontally by adding offset to x position
      let xOffset = (tankWidth - numX * dx) / 2;
      // Center vertically by adding offset to y position
      let yOffset = (tankHeight - numY * dy) * -0.5;

      f.particlePos[p++] = h + r + dx * i + (j % 2 == 0 ? 0.0 : r) + xOffset;
      f.particlePos[p++] = h + r + dy * j + yOffset;
    }
  }

  // Setup grid cells for tank
  var n = f.fNumY;
  for (var i = 0; i < f.fNumX; i++) {
    for (var j = 0; j < f.fNumY; j++) {
      var s = 1.0; // fluid
      if (i == 0 || i == f.fNumX - 1 || j == 0) s = 0.0; // solid
      f.s[i * n + j] = s;
    }
  }

  // Initialize obstacle in the middle
  scene.obstacleX = simWidth / 2;
  scene.obstacleY = simHeight * 0.54;
}

function setupInteractionHandlers() {
  var mouseDown = false;

  function startDrag(x, y) {
    let bounds = canvasEl.getBoundingClientRect();
    let mx = x - bounds.left - canvasEl.clientLeft;
    let my = y - bounds.top - canvasEl.clientTop;
    mouseDown = true;

    x = mx / cScale;
    y = (canvasEl.height - my) / cScale;

    setObstacle(x, y, true);
    scene.paused = false;
  }

  function drag(x, y) {
    if (mouseDown && scene.interactionMode === 'touch') {
      let bounds = canvasEl.getBoundingClientRect();
      let mx = x - bounds.left - canvasEl.clientLeft;
      let my = y - bounds.top - canvasEl.clientTop;
      x = mx / cScale;
      y = (canvasEl.height - my) / cScale;
      setObstacle(x, y, false);
    }
  }

  function endDrag() {
    mouseDown = false;
    scene.obstacleVelX = 0.0;
    scene.obstacleVelY = 0.0;
  }

  // Mouse events
  canvasEl.addEventListener("mousedown", (event) => {
    if (scene.interactionMode === 'touch') {
      scene.obstacleRadius = 0.0;
      scene.dt = SPEED_SLOW;
      startDrag(event.clientX, event.clientY);
    }
  });

  canvasEl.addEventListener("mouseup", (event) => {
    if (scene.interactionMode === 'touch') {
      scene.dt = SPEED_FAST;
      endDrag();
    }
  });

  canvasEl.addEventListener("mousemove", (event) => {
    drag(event.clientX, event.clientY);
  });

  // Touch events
  canvasEl.addEventListener("touchstart", (event) => {
    if (scene.interactionMode === 'touch') {
      event.preventDefault();
      scene.obstacleRadius = 0.0;
      scene.dt = SPEED_SLOW;
      startDrag(event.touches[0].clientX, event.touches[0].clientY);
    }
  });

  canvasEl.addEventListener("touchend", (event) => {
    if (scene.interactionMode === 'touch') {
      scene.dt = SPEED_FAST;
      endDrag();
    }
  });

  canvasEl.addEventListener("touchmove", (event) => {
    if (scene.interactionMode === 'touch') {
      event.preventDefault();
      event.stopImmediatePropagation();
      drag(event.touches[0].clientX, event.touches[0].clientY);
    }
  }, {
    passive: false,
  });

  // Keyboard events
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "p":
      case "P":
        scene.paused = !scene.paused;
        break;
      case "m":
      case "M":
        scene.paused = false;
        simulate();
        scene.paused = true;
        break;
    }
  });
}

function setObstacle(x, y, reset) {
  var vx = 0.0;
  var vy = 0.0;

  if (!reset) {
    vx = (x - scene.obstacleX) / scene.dt;
    vy = (y - scene.obstacleY) / scene.dt;
  }

  scene.obstacleX = x;
  scene.obstacleY = y;
  var r = scene.obstacleRadius;
  var f = scene.fluid;
  var n = f.fNumY;
  var cd = Math.sqrt(2) * f.h;

  for (var i = 1; i < f.fNumX - 2; i++) {
    for (var j = 1; j < f.fNumY - 2; j++) {
      f.s[i * n + j] = 1.0;

      let dx = (i + 0.5) * f.h - x;
      let dy = (j + 0.5) * f.h - y;

      if (dx * dx + dy * dy < r * r) {
        f.s[i * n + j] = 0.0;
        f.u[i * n + j] = vx;
        f.u[(i + 1) * n + j] = vx;
        f.v[i * n + j] = vy;
        f.v[i * n + j + 1] = vy;
      }
    }
  }

  scene.showObstacle = true;
  scene.obstacleVelX = vx;
  scene.obstacleVelY = vy;
}

// Auto mode - automatic obstacle movement
function updateAutoMode() {
  if (!scene.autoMode) return;

  const time = scene.frameNr * 0.02;
  const centerX = simWidth / 2;
  const centerY = simHeight / 2;
  const radius = Math.min(simWidth, simHeight) * 0.3;

  scene.obstacleX = centerX + Math.cos(time) * radius;
  scene.obstacleY = centerY + Math.sin(time * 0.7) * radius * 0.6;

  setObstacle(scene.obstacleX, scene.obstacleY, false);
}

function simulate() {
  if (!scene.paused) {
    updateAutoMode(); // Update auto mode if active

    scene.fluid.simulate(
      scene.dt,
      scene.gravity,
      scene.flipRatio,
      scene.numPressureIters,
      scene.numParticleIters,
      scene.overRelaxation,
      scene.compensateDrift,
      scene.separateParticles,
      scene.obstacleX,
      scene.obstacleY,
      scene.obstacleRadius
    );
    scene.frameNr++;
  }
}

function update() {
  // Gradually increase obstacle radius for visual effect
  const MAX_RADIUS = window.innerWidth > window.innerHeight ? 0.47 : 0.37;
  scene.obstacleRadius = (scene.obstacleRadius * 3 + MAX_RADIUS) / 4;

  simulate();

  const renderAscii = scene.paused ? false : true;

  if (renderAscii) {
    let toRender = "";
    const useGothicChars = Math.random() > 0.5; // Randomly switch between character sets

    for (let i = f.fNumY - CELL_CROP_Y; i > CELL_CROP_Y; i--) {
      let row = "";
      for (let j = CELL_CROP_X; j < f.fNumX - CELL_CROP_X; j++) {
        const CURRENT_RENDER_CHAR = useGothicChars
          ? GOTHIC_RENDER_CHARS[Math.floor((i + j + 1) % GOTHIC_RENDER_CHARS.length)]
          : RENDER_CHARS[Math.floor((i + j + 1) % RENDER_CHARS.length)];

        const RENDER_CHAR_DICTIONARY = CURRENT_RENDER_CHAR.sort(
          (a, b) => a[1] - b[1]
        )
          .map(([char]) => char)
          .join("");

        const cellColor = f.cellColor[3 * (j * f.fNumY + i)];
        row += RENDER_CHAR_DICTIONARY[
          Math.floor(cellColor * RENDER_CHAR_DICTIONARY.length)
        ];
      }
      toRender += row + "\n";
    }
    renderEl.innerHTML = toRender;
  } else {
    renderEl.innerHTML = "";
  }

  requestAnimationFrame(update);
}

// Fluid class (simplified version of the original)
class FlipFluid {
  constructor(density, width, height, spacing, particleRadius, maxParticles) {
    this.density = density;
    this.fNumX = Math.floor(width / spacing);
    this.fNumY = Math.floor(height / spacing);
    this.h = Math.max(width / this.fNumX, height / this.fNumY);
    this.fInvSpacing = 1.0 / this.h;
    this.fNumCells = this.fNumX * this.fNumY;

    this.u = new Float32Array(this.fNumCells);
    this.v = new Float32Array(this.fNumCells);
    this.du = new Float32Array(this.fNumCells);
    this.dv = new Float32Array(this.fNumCells);
    this.prevU = new Float32Array(this.fNumCells);
    this.prevV = new Float32Array(this.fNumCells);
    this.p = new Float32Array(this.fNumCells);
    this.s = new Float32Array(this.fNumCells);
    this.cellType = new Int32Array(this.fNumCells);
    this.cellColor = new Float32Array(3 * this.fNumCells);

    this.maxParticles = maxParticles;
    this.particlePos = new Float32Array(2 * this.maxParticles);
    this.particleColor = new Float32Array(3 * this.maxParticles);
    for (var i = 0; i < this.maxParticles; i++)
      this.particleColor[3 * i + 2] = 1.0;

    this.particleVel = new Float32Array(2 * this.maxParticles);
    this.particleDensity = new Float32Array(this.fNumCells);
    this.particleRestDensity = 0.0;

    this.particleRadius = particleRadius;
    this.pInvSpacing = 1.0 / (2.2 * particleRadius);
    this.pNumX = Math.floor(width * this.pInvSpacing) + 1;
    this.pNumY = Math.floor(height * this.pInvSpacing) + 1;
    this.pNumCells = this.pNumX * this.pNumY;

    this.numCellParticles = new Int32Array(this.pNumCells);
    this.firstCellParticle = new Int32Array(this.pNumCells + 1);
    this.cellParticleIds = new Int32Array(maxParticles);

    this.numParticles = 0;
  }

  integrateParticles(dt) {
    for (var i = 0; i < this.numParticles; i++) {
      let gravityX = 0;
      let gravityY = scene.gravity;

      if (window.gravityVector && scene.interactionMode === 'gravity') {
        gravityX = window.gravityVector.x * 10;
        gravityY = window.gravityVector.y * 10;
      }

      this.particleVel[2 * i] += dt * gravityX;
      this.particleVel[2 * i + 1] += dt * gravityY;
      this.particlePos[2 * i] += this.particleVel[2 * i] * dt;
      this.particlePos[2 * i + 1] += this.particleVel[2 * i + 1] * dt;
    }
  }

  handleParticleCollisions(obstacleX, obstacleY, obstacleRadius) {
    var h = 1.0 / this.fInvSpacing;
    var r = this.particleRadius;

    var minX = h + r;
    var maxX = (this.fNumX - 1) * h - r;
    var minY = h + r;
    var maxY = (this.fNumY - 1) * h - r;

    for (var i = 0; i < this.numParticles; i++) {
      var x = this.particlePos[2 * i];
      var y = this.particlePos[2 * i + 1];

      // Check collision with circular obstacle
      let dx = x - obstacleX;
      let dy = y - obstacleY;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < obstacleRadius + r) {
        // Push particle outside obstacle
        let pushDist = obstacleRadius + r - dist;
        if (dist > 0) {
          x += (dx / dist) * pushDist;
          y += (dy / dist) * pushDist;
        } else {
          x = obstacleX + obstacleRadius + r;
          y = obstacleY;
        }

        // Dampen velocity
        this.particleVel[2 * i] *= 0.5;
        this.particleVel[2 * i + 1] *= 0.5;
      }

      // Wall collisions
      if (x < minX) {
        x = minX;
        this.particleVel[2 * i] = 0.0;
      }
      if (x > maxX) {
        x = maxX;
        this.particleVel[2 * i] = 0.0;
      }
      if (y < minY) {
        y = minY;
        this.particleVel[2 * i + 1] = 0.0;
      }
      if (y > maxY) {
        y = maxY;
        this.particleVel[2 * i + 1] = 0.0;
      }

      this.particlePos[2 * i] = x;
      this.particlePos[2 * i + 1] = y;
    }
  }

  // Simplified versions of other required methods...
  updateParticleDensity() {
    // Simplified density calculation
    var n = this.fNumY;
    var h = this.h;
    var h1 = this.fInvSpacing;
    var h2 = 0.5 * h;

    var d = this.particleDensity;
    d.fill(0.0);

    for (var i = 0; i < this.numParticles; i++) {
      var x = this.particlePos[2 * i];
      var y = this.particlePos[2 * i + 1];

      x = Math.max(h, Math.min(x, (this.fNumX - 1) * h));
      y = Math.max(h, Math.min(y, (this.fNumY - 1) * h));

      var x0 = Math.floor((x - h2) * h1);
      var y0 = Math.floor((y - h2) * h1);

      if (x0 >= 0 && x0 < this.fNumX && y0 >= 0 && y0 < this.fNumY) {
        d[x0 * n + y0] += 1.0;
      }
    }

    if (this.particleRestDensity == 0.0) {
      var sum = 0.0;
      var numFluidCells = 0;

      for (var i = 0; i < this.fNumCells; i++) {
        if (this.cellType[i] == FLUID_CELL) {
          sum += d[i];
          numFluidCells++;
        }
      }

      if (numFluidCells > 0)
        this.particleRestDensity = sum / numFluidCells;
    }
  }

  transferVelocities(toGrid, flipRatio) {
    // Simplified velocity transfer
    var n = this.fNumY;
    var h = this.h;
    var h1 = this.fInvSpacing;

    if (toGrid) {
      this.prevU.set(this.u);
      this.prevV.set(this.v);
      this.u.fill(0.0);
      this.v.fill(0.0);

      for (var i = 0; i < this.fNumCells; i++)
        this.cellType[i] = this.s[i] == 0.0 ? SOLID_CELL : AIR_CELL;

      for (var i = 0; i < this.numParticles; i++) {
        var x = this.particlePos[2 * i];
        var y = this.particlePos[2 * i + 1];
        var xi = Math.floor(x * h1);
        var yi = Math.floor(y * h1);
        var cellNr = xi * n + yi;
        if (cellNr >= 0 && cellNr < this.fNumCells && this.cellType[cellNr] == AIR_CELL)
          this.cellType[cellNr] = FLUID_CELL;
      }
    }

    // Transfer particle velocities to grid
    for (var i = 0; i < this.numParticles; i++) {
      var x = this.particlePos[2 * i];
      var y = this.particlePos[2 * i + 1];
      var xi = Math.floor(x * h1);
      var yi = Math.floor(y * h1);
      var cellNr = xi * n + yi;

      if (cellNr >= 0 && cellNr < this.fNumCells) {
        this.u[cellNr] += this.particleVel[2 * i];
        this.v[cellNr] += this.particleVel[2 * i + 1];
      }
    }
  }

  solveIncompressibility(numIters, dt, overRelaxation, compensateDrift) {
    // Simplified incompressibility solver
    this.p.fill(0.0);
    this.prevU.set(this.u);
    this.prevV.set(this.v);

    var n = this.fNumY;

    for (var iter = 0; iter < numIters; iter++) {
      for (var i = 1; i < this.fNumX - 1; i++) {
        for (var j = 1; j < this.fNumY - 1; j++) {
          if (this.cellType[i * n + j] != FLUID_CELL) continue;

          var center = i * n + j;
          var left = (i - 1) * n + j;
          var right = (i + 1) * n + j;
          var bottom = i * n + j - 1;
          var top = i * n + j + 1;

          var div = this.u[right] - this.u[center] + this.v[top] - this.v[center];
          var p = -div / 4.0;
          p *= overRelaxation;
          this.p[center] += p;

          this.u[center] -= p;
          this.u[right] += p;
          this.v[center] -= p;
          this.v[top] += p;
        }
      }
    }
  }

  updateCellColors() {
    this.cellColor.fill(0.0);

    for (var i = 0; i < this.fNumCells; i++) {
      if (this.cellType[i] == SOLID_CELL) {
        this.cellColor[3 * i] = 0.3;
        this.cellColor[3 * i + 1] = 0.3;
        this.cellColor[3 * i + 2] = 0.3;
      } else if (this.cellType[i] == FLUID_CELL) {
        var d = this.particleDensity[i];
        if (this.particleRestDensity > 0.0)
          d /= this.particleRestDensity;

        // Color based on fluid type
        if (scene.fluidType === 'blood') {
          this.cellColor[3 * i] = Math.min(d * 0.8, 1.0); // Red
          this.cellColor[3 * i + 1] = Math.min(d * 0.1, 0.2); // Green
          this.cellColor[3 * i + 2] = Math.min(d * 0.2, 0.3); // Blue
        } else if (scene.fluidType === 'mercury') {
          this.cellColor[3 * i] = Math.min(d * 0.7, 0.9); // Silver
          this.cellColor[3 * i + 1] = Math.min(d * 0.7, 0.9); // Silver
          this.cellColor[3 * i + 2] = Math.min(d * 0.75, 0.95); // Silver
        } else {
          // Water - blue tones
          this.cellColor[3 * i] = Math.min(d * 0.2, 0.3); // Red
          this.cellColor[3 * i + 1] = Math.min(d * 0.4, 0.6); // Green
          this.cellColor[3 * i + 2] = Math.min(d * 0.9, 1.0); // Blue
        }
      }
    }
  }

  simulate(dt, gravity, flipRatio, numPressureIters, numParticleIters, overRelaxation, compensateDrift, separateParticles, obstacleX, obstacleY, obstacleRadius) {
    var numSubSteps = 1;
    var sdt = dt / numSubSteps;

    for (var step = 0; step < numSubSteps; step++) {
      this.integrateParticles(sdt, gravity);
      this.handleParticleCollisions(obstacleX, obstacleY, obstacleRadius);
      this.transferVelocities(true);
      this.updateParticleDensity();
      this.solveIncompressibility(numPressureIters, sdt, overRelaxation, compensateDrift);
      this.transferVelocities(false, flipRatio);
    }

    this.updateCellColors();
  }
}

// Device motion support
function setupDeviceMotion() {
  window.addEventListener("devicemotion", (event) => {
    let x = event.accelerationIncludingGravity.x;
    let y = event.accelerationIncludingGravity.y;

    if (!x && !y) {
      console.warn("No acceleration data available");
      return;
    }

    // Adjust for screen orientation
    if (window.orientation === 90 || window.orientation === -90) {
      const temp = x;
      x = -y;
      y = temp;
    }

    window.gravityVector = {
      x: x / 9.81,
      y: -y / 9.81,
    };
  });
}

// Request device motion permission
async function requestDeviceMotion() {
  if (typeof DeviceMotionEvent?.requestPermission === "function") {
    try {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission === "granted") {
        setupDeviceMotion();
      }
    } catch (err) {
      console.error("Error requesting device motion permission:", err);
    }
  } else {
    setupDeviceMotion();
  }
}

// Export functions for external control
window.fluidSimulation = {
  init: initFluidSimulation,
  scene: scene,
  setFluidType: (type) => {
    scene.fluidType = type;
    if (type === 'blood') scene.density = 1060.0;
    else if (type === 'mercury') scene.density = 13534.0;
    else scene.density = 1000.0;
  },
  setInteractionMode: (mode) => {
    scene.interactionMode = mode;
    scene.autoMode = mode === 'auto';
  },
  pause: () => { scene.paused = true; },
  resume: () => { scene.paused = false; },
  reset: () => {
    setupScene();
    scene.frameNr = 0;
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initFluidSimulation, 100);

  // Request device motion permission on first interaction
  document.addEventListener('click', requestDeviceMotion, { once: true });
  document.addEventListener('touchend', requestDeviceMotion, { once: true });
});

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initFluidSimulation();
  }, 250);
});