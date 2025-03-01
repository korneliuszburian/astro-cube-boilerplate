/**
 * Theme utilities for Voyager Design System
 * Handles theme switching with ViewTransition API support and fallbacks
 */

// Check for View Transitions API support
const supportsViewTransitions = typeof document !== 'undefined'
  ? 'startViewTransition' in document
  : false;

/**
 * Initialize theme system
 * Sets up the theme from localStorage or defaults to 'iceland'
 */
export function initThemeSystem() {
  if (typeof document === 'undefined') return; // SSR check

  // Add support class to document if View Transitions API is available
  if (supportsViewTransitions) {
    document.documentElement.classList.add('supports-view-transitions');
  }

  // Set initial theme from localStorage or default
  const savedTheme = localStorage.getItem('voyager-theme') || 'iceland';
  setTheme(savedTheme, false);

  // Listen for theme change events from any component
  window.addEventListener('themeChanged', (e) => {
    if (e.detail && e.detail.theme) {
      setTheme(e.detail.theme, true);
    }
  });
}

/**
 * Set the current theme
 * @param {string} themeName - The theme to switch to
 * @param {boolean} animate - Whether to animate the transition
 */
export function setTheme(themeName, animate = true) {
  if (typeof document === 'undefined') return; // SSR check

  const html = document.documentElement;
  const themeMetaColor = document.querySelector('meta[name="theme-color"]');

  // Define meta colors for each theme
  const themeColors = {
    iceland: '#0b1733',
    thailand: '#0a3e2b',
    berlin: '#1a0e0c',
    spain: '#5f2c82'
  };

  const applyThemeChange = () => {
    // Set data-theme attribute
    html.dataset.theme = themeName;

    // Save to localStorage
    localStorage.setItem('voyager-theme', themeName);

    // Update meta theme-color if it exists
    if (themeMetaColor && themeColors[themeName]) {
      themeMetaColor.setAttribute('content', themeColors[themeName]);
    }

    // Update active classes on theme switcher buttons
    document.querySelectorAll('.theme-switcher__option').forEach(button => {
      button.classList.toggle(
        'theme-switcher__option--active',
        button.dataset.theme === themeName
      );
    });

    // Dispatch an event for components to react to
    // (beyond the initial themeChanged event)
    window.dispatchEvent(new CustomEvent('themeApplied', {
      detail: { theme: themeName }
    }));
  };

  // Don't animate if specifically told not to
  // or if it's the initial page load
  if (!animate || !supportsViewTransitions) {
    applyThemeChange();
    return;
  }

  // Use View Transitions API if available
  if (supportsViewTransitions) {
    document.startViewTransition(() => {
      applyThemeChange();
    });
  } else {
    applyThemeChange();
  }
}

/**
 * Get current theme name
 * @returns {string} Current theme name
 */
export function getCurrentTheme() {
  if (typeof document === 'undefined') return 'iceland'; // Default for SSR

  return document.documentElement.dataset.theme || 'iceland';
}

/**
 * Check if the current theme is of a specific name
 * @param {string} themeName - Theme name to check against
 * @returns {boolean} True if current theme matches
 */
export function isTheme(themeName) {
  return getCurrentTheme() === themeName;
}

/**
 * Load theme-specific assets preemptively for better performance
 * @param {string} themeName - Theme to preload assets for
 */
export function preloadThemeAssets(themeName) {
  // Theme-specific asset paths
  const themeAssets = {
    iceland: [
      '/img/patterns/iceland-pattern.svg',
      '/img/textures/ice-noise.png',
      '/img/backgrounds/iceland-bg-1.jpg',
      '/img/backgrounds/iceland-bg-2.jpg',
      '/img/backgrounds/iceland-bg-3.jpg'
    ],
    thailand: [
      '/img/patterns/thailand-pattern.svg',
      '/img/textures/leaf-noise.png',
      '/img/backgrounds/thailand-bg-1.jpg',
      '/img/backgrounds/thailand-bg-2.jpg',
      '/img/backgrounds/thailand-bg-3.jpg'
    ],
    berlin: [
      '/img/patterns/berlin-pattern.svg',
      '/img/textures/fire-noise.png',
      '/img/backgrounds/berlin-bg-1.jpg',
      '/img/backgrounds/berlin-bg-2.jpg',
      '/img/backgrounds/berlin-bg-3.jpg'
    ],
    spain: [
      '/img/patterns/spain-pattern.svg',
      '/img/textures/wave-noise.png',
      '/img/backgrounds/spain-bg-1.jpg',
      '/img/backgrounds/spain-bg-2.jpg',
      '/img/backgrounds/spain-bg-3.jpg'
    ]
  };

  if (!themeAssets[themeName]) return;

  // Preload images
  themeAssets[themeName].forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = path.endsWith('.svg') ? 'image' : 'image';
    link.href = path;
    link.type = path.endsWith('.svg') ? 'image/svg+xml' :
                 path.endsWith('.png') ? 'image/png' : 'image/jpeg';
    document.head.appendChild(link);
  });
}

/**
 * Setup theme switcher buttons
 * @param {string} selectorClass - CSS class to identify theme switcher buttons
 */
export function setupThemeSwitcherButtons(selectorClass = '.theme-switcher__option') {
  if (typeof document === 'undefined') return; // SSR check

  const themeButtons = document.querySelectorAll(selectorClass);

  themeButtons.forEach(button => {
    const themeName = button.dataset.theme;
    if (!themeName) return;

    button.addEventListener('click', () => {
      // Don't do anything if already on this theme
      if (getCurrentTheme() === themeName) return;

      // Preload assets for smoother transition
      preloadThemeAssets(themeName);

      // Dispatch theme change event
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: themeName }
      }));
    });

    // Preload assets on hover for even smoother transitions
    button.addEventListener('mouseenter', () => {
      preloadThemeAssets(themeName);
    });
  });
}

// Initialize on page load in the browser
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initThemeSystem();
    setupThemeSwitcherButtons();
  });
}
