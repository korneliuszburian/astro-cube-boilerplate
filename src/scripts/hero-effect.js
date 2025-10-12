import * as THREE from "three";

// Helper function to check if console logs should be visible
const shouldLog = () => {
  return window.location.hostname.includes("localhost") || window.location.hostname.includes("127.0.0.1");
};

export class HeroEffect1 {
  constructor(options = {}) {
    this.fpsStats = {
      frameCount: 0,
      lastTime: performance.now(),
      fps: 0
    };
    this.options = {
      container: options.container || document.querySelector(".hero"),
      depthMapUrl: options.depthMapUrl || "",
      imageUrl: options.imageUrl || "",
      intensity: options.intensity || 1.5,
      color: options.color || [10.0, 0.0, 0.0],
      scanSpeed: options.scanSpeed || 3,
      brightness: options.brightness || 2.5,
      redThreshold: options.redThreshold || 0.6,
      ...options
    };

    this.textureAspectRatio = 0;

    let heroElement = this.options.container;
    while (
      heroElement &&
      !heroElement.getAttribute("data-hero-variant") &&
      heroElement.parentElement
    ) {
      heroElement = heroElement.parentElement;
    }

    this.heroVariant = heroElement
      ? heroElement.getAttribute("data-hero-variant")
      : "main";

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.material = null;
    this.texture = null;
    this.depthTexture = null;
    this.canvas = null;
    this.wrapper = null;
    this.isVisible = false;
    this.initialized = false;
    this.animationFrameId = null;
    this.observer = null;
    this.mouseMoveThrottled = false;

    this.pointer = { x: 0, y: 0 };
    this.uniforms = {
      uPointer: { value: new THREE.Vector2(0, 0) },
      uProgress: { value: 0 },
      uMap: { value: null },
      uDepthMap: { value: null },
      uIntensity: { value: this.options.intensity },
      uColor: { value: new THREE.Vector3(...this.options.color) },
      uBrightness: { value: this.options.brightness },
      uRedThreshold: { value: this.options.redThreshold }
    };

    if (this.options.container) {
      this.setupObserver();
      this.isVisible = false;

      this.scanTween = null;
      this.fallbackAnimationActive = false;
      this.fallbackAnimationId = null;
    } else {
      if (shouldLog()) {
        console.error("Effect1: No container element found");
      }
    }
  }

  async init() {
    this.initialized = true;

    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("hero__canvas-wrapper");
    this.wrapper.style.position = "absolute";
    this.wrapper.style.top = "0";
    this.wrapper.style.left = "0";
    this.wrapper.style.width = "100%";
    this.wrapper.style.height = "100%";
    this.wrapper.style.overflow = "hidden";
    this.wrapper.style.willChange = "transform";

    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("hero__canvas");
    this.canvas.style.position = "relative";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.zIndex = "1";
    this.canvas.style.transform = "translateZ(0)";
    this.canvas.style.backfaceVisibility = "hidden";

    this.wrapper.appendChild(this.canvas);
    this.options.container.appendChild(this.wrapper);

    if (this.options.container) {
      if (
        window.getComputedStyle(this.options.container).position === "static"
      ) {
        this.options.container.style.position = "relative";
      }
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: "high-performance",
      precision: "mediump",
      depth: false,
      stencil: false
    });

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(
      this.options.container.offsetWidth,
      this.options.container.offsetHeight
    );

    await this.loadTextures();

    this.createEffect1Material();

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    window.addEventListener("mousemove", this.onMouseMove.bind(this), {
      passive: true
    });

    this.resizeTimeout = null;
    this.resizeHandler = () => {
      if (this.resizeTimeout) return;
      this.resizeTimeout = setTimeout(() => {
        this.onResize();
        this.resizeTimeout = null;
      }, 150);
    };
    window.addEventListener("resize", this.resizeHandler, { passive: true });

    if (this.isVisible) {
      this.animate(performance.now());
      this.startScanAnimation();
    }
  }

  async loadTextures() {
    if (shouldLog()) {
      console.log("Effect1: Loading textures...");
    }
    const textureLoader = new THREE.TextureLoader();

    const isMobile = window.innerWidth < 768;

    try {
      textureLoader.setPath("");

      this.texture = await new Promise((resolve, reject) => {
        textureLoader.load(
          this.options.imageUrl,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = !isMobile;
            texture.anisotropy = isMobile ? 1 : 4;
            if (texture.image) {
              this.textureAspectRatio =
                texture.image.width / texture.image.height;
              if (shouldLog()) {
                console.log(
                  `Effect1: Image aspect ratio: ${this.textureAspectRatio}`
                );
              }
            }

            if (shouldLog()) {
              console.log("Effect1: Image texture loaded");
            }
            resolve(texture);
          },
          undefined,
          (error) => {
            if (shouldLog()) {
              console.error("Effect1: Error loading image texture:", error);
            }
            reject(error);
          }
        );
      });

      this.depthTexture = await new Promise((resolve, reject) => {
        textureLoader.load(
          this.options.depthMapUrl,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            if (shouldLog()) {
              console.log("Effect1: Depth map texture loaded");
            }
            resolve(texture);
          },
          undefined,
          (error) => {
            if (shouldLog()) {
              console.error("Effect1: Error loading depth map texture:", error);
            }
            reject(error);
          }
        );
      });

      this.uniforms.uMap.value = this.texture;
      this.uniforms.uDepthMap.value = this.depthTexture;
      if (shouldLog()) {
        console.log("Effect1: All textures loaded successfully");
      }

      this.updateCanvasSize();
    } catch (error) {
      if (shouldLog()) {
        console.error("Effect1: Error loading textures:", error);
      }
    }
  }

  updateCanvasSize() {
    if (!this.renderer || !this.options.container) return;

    const containerWidth = this.options.container.offsetWidth;
    const containerHeight = this.options.container.offsetHeight;

    if (this.texture && this.textureAspectRatio > 0) {
      const containerAspect = containerWidth / containerHeight;
      let newCanvasWidth, newCanvasHeight;

      if (this.textureAspectRatio > containerAspect) {
        newCanvasHeight = containerHeight;
        newCanvasWidth = containerHeight * this.textureAspectRatio;
        this.canvas.style.height = "100%";
        this.canvas.style.width = `${newCanvasWidth}px`;
        this.canvas.style.top = "0";
        this.canvas.style.left = `${(containerWidth - newCanvasWidth) / 2}px`;
      } else {
        newCanvasWidth = containerWidth;
        newCanvasHeight = containerWidth / this.textureAspectRatio;
        this.canvas.style.width = "100%";
        this.canvas.style.height = `${newCanvasHeight}px`;
        this.canvas.style.left = "0";
        this.canvas.style.top = `${(containerHeight - newCanvasHeight) / 2}px`;
      }

      this.canvas.style.position = "absolute";
      this.renderer.setSize(newCanvasWidth, newCanvasHeight);
    } else {
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.position = "relative";
      this.renderer.setSize(containerWidth, containerHeight);
    }
  }

  createEffect1Material() {
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform sampler2D uDepthMap;
        uniform vec2 uPointer;
        uniform float uProgress;
        uniform float uIntensity;
        uniform vec3 uColor;
        uniform float uBrightness;
        uniform float uRedThreshold;
        
        varying vec2 vUv;
        
        float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        
        float permute(float x) { return mod289(((x*34.0)+1.0)*x); }
        vec2 permute(vec2 x) { return mod289(((x*34.0)+1.0)*x); }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float mx_cell_noise_float(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          
          float d = 1.0e10;
          for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
              vec2 offset = vec2(float(i), float(j));
              vec2 g = offset + 0.5 - fp;
              float s = dot(g, g);
              d = min(d, s);
            }
          }
          
          return sqrt(d);
        }
        
        void main() {
          float strength = 0.01;
          
          vec4 depthMap = texture2D(uDepthMap, vUv);
          
          vec2 distortedUv = vUv + depthMap.r * uPointer * strength;
          
          vec4 texColor = texture2D(uMap, distortedUv);
          
          vec3 brightTexColor = texColor.rgb * uBrightness;
          
          float aspect = 16.0 / 9.0;
          vec2 tUv = vec2(vUv.x * aspect, vUv.y);
          vec2 tiling = vec2(120.0);
          vec2 tiledUv = mod(tUv * tiling, 2.0) - 1.0;
          
          float brightness = mx_cell_noise_float(tUv * tiling / 2.0);
          float dist = length(tiledUv);
          float dot = smoothstep(0.5, 0.49, dist) * brightness;
          
          float flow = 1.0 - smoothstep(0.0, 0.03, abs(depthMap.r - uProgress));
          float enhancedFlow = pow(flow, 0.8); 
          
          float redIntensity = brightTexColor.r / (brightTexColor.r + brightTexColor.g + brightTexColor.b + 0.001);
          bool isRedArea = redIntensity > uRedThreshold && brightTexColor.r > 0.3;
          
          vec3 scanColor = isRedArea ? vec3(2.0, 2.0, 2.0) : uColor; 
          
          vec3 mask = dot * enhancedFlow * scanColor * uIntensity;
          
          vec3 finalColor = 1.0 - (1.0 - brightTexColor) * (1.0 - mask);
          
          finalColor = pow(finalColor, vec3(0.85));
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });
  }

  onMouseMove(event) {
    if (!this.isVisible) return;

    if (this.mouseMoveThrottled) return;
    this.mouseMoveThrottled = true;

    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.uniforms.uPointer.value.set(this.pointer.x, this.pointer.y);

    setTimeout(() => {
      this.mouseMoveThrottled = false;
    }, 16);
  }

  onResize() {
    this.updateCanvasSize();
  }

  animate(timestamp) {
    if (!this.isVisible) return;

    this.fpsStats.frameCount++;
    const elapsed = timestamp - this.fpsStats.lastTime;

    if (elapsed >= 1000) {
      this.fpsStats.fps = (this.fpsStats.frameCount * 1000) / elapsed;
      this.fpsStats.frameCount = 0;
      this.fpsStats.lastTime = timestamp;
    }

    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }

    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  startScanAnimation() {
    if (shouldLog()) {
      console.log("Effect1: Starting scan animation");
    }

    this.fallbackAnimationActive = this.isVisible;
    this.uniforms.uProgress.value = 0;

    const animate = () => {
      if (!this.fallbackAnimationActive) return;

      // Much slower scanning - from 0.005 to 0.0005 (10x slower)
      this.uniforms.uProgress.value += 0.0005;
      if (this.uniforms.uProgress.value > 1) {
        this.uniforms.uProgress.value = 0;
      }
      this.fallbackAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isNowVisible = entry.isIntersecting;

          this.isVisible = isNowVisible;
          if (isNowVisible) {
            if (!this.initialized) {
              this.init();
            } else {
              this.animate(performance.now());
              
              if (!this.fallbackAnimationActive) {
                this.fallbackAnimationActive = true;

                if (!this.fallbackAnimationId) {
                  const animate = () => {
                    if (!this.fallbackAnimationActive) return;

                    this.uniforms.uProgress.value += 0.005;
                    if (this.uniforms.uProgress.value > 1) {
                      this.uniforms.uProgress.value = 0;
                    }
                    this.fallbackAnimationId = requestAnimationFrame(animate);
                  };

                  animate();
                }
              }
            }
          } else {
            this.fallbackAnimationActive = false;
            if (this.fallbackAnimationId) {
              cancelAnimationFrame(this.fallbackAnimationId);
              this.fallbackAnimationId = null;
            }

            if (this.animationFrameId) {
              cancelAnimationFrame(this.animationFrameId);
              this.animationFrameId = null;
            }
          }
        });
      },
      {
        threshold: [0, 0.1],
        rootMargin: "100px"
      }
    );

    this.observer.observe(this.options.container);
  }

  destroy() {
    if (!this.initialized) return;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.fallbackAnimationActive = false;
    if (this.fallbackAnimationId) {
      cancelAnimationFrame(this.fallbackAnimationId);
      this.fallbackAnimationId = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    window.removeEventListener("mousemove", this.onMouseMove.bind(this));
    window.removeEventListener("resize", this.resizeHandler);

    if (this.material) {
      this.material.dispose();
    }
    if (this.texture) {
      this.texture.dispose();
    }
    if (this.depthTexture) {
      this.depthTexture.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }

  updateOptions(options) {
    if (options.color) {
      this.uniforms.uColor.value = new THREE.Vector3(...options.color);
    }

    if (options.intensity) {
      this.uniforms.uIntensity.value = options.intensity;
    }

    if (options.brightness) {
      this.uniforms.uBrightness.value = options.brightness;
    }

    if (options.redThreshold) {
      this.uniforms.uRedThreshold.value = options.redThreshold;
    }

    this.options = {
      ...this.options,
      ...options
    };
  }
}

export function initHeroEffect(options = {}) {
  const defaultOptions = {
    container: document.querySelector(".hero"),
    imageUrl: "",
    depthMapUrl: "",
    intensity: 1.5,
    color: [10.0, 0.0, 0.0],
    scanSpeed: 3,
    brightness: 1.3,
    redThreshold: 0.6
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options
  };

  if (!mergedOptions.imageUrl) {
    if (shouldLog()) {
      console.error("Effect1: No image URL provided");
    }
    return null;
  }

  if (!mergedOptions.depthMapUrl) {
    if (shouldLog()) {
      console.error("Effect1: No depth map URL provided");
    }
    return null;
  }

  return new HeroEffect1(mergedOptions);
}
