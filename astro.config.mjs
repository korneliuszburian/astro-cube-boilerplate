import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false
    }), 
    react({
      include: ['**/three-components/**']
    }),
    partytown(), 
    sitemap()
  ],
  vite: {
    optimizeDeps: {
      include: ['three']
    }
  }
  // View Transitions are now stable in Astro 5.x - no experimental flag needed
});
