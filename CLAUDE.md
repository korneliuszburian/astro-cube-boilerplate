# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Gothic-themed e-commerce platform built with Astro, featuring a dark fantasy aesthetic inspired by medieval merchant sanctuaries. The project uses the CUBE CSS methodology combined with Tailwind CSS for styling and includes custom Three.js components for interactive elements.

## Development Commands

### Core Development
- `npm run dev` - Start local development server at `localhost:4321`
- `npm run build` - Build production site to `./dist/` (includes `astro check`)
- `npm run preview` - Preview production build locally
- `npm run astro ...` - Run Astro CLI commands (add, check, etc.)

### Package Management
- `npm install` - Install dependencies (requires Node.js >=22.12.2)

## Architecture Overview

### Tech Stack
- **Framework**: Astro 5.9.3 with React integration for Three.js components
- **Styling**: CUBE CSS methodology with Tailwind CSS (utility-second approach)
- **Design System**: Custom design tokens with Utopia responsive scaling
- **3D Graphics**: Three.js with React integration in `/three-components/`
- **Performance**: Partytown for third-party script isolation

### Key Architectural Patterns

#### Design Token System
- Design tokens stored in `src/design-tokens/` (colors, spacing, typography, viewports)
- Token-to-Tailwind conversion utility in `src/css-utils/tokens-to-tailwind.ts`
- Responsive clamp generation via `src/css-utils/clamp-generator.ts`
- Gothic color palette defined in `colors.json` with custom CSS variables

#### Component Architecture
- **Gothic UI Components**: Custom-styled components with Blizzard Diablo-style button assets
  - `GothicButton.astro` - 6 button variants with sprite-based backgrounds
  - `GothicFrame.astro` - Decorative frame components
  - `GothicIcon.astro` - Themed icon components
- **Layout Components**:
  - `Layout.astro` - Base layout with Gothic theming and view transitions
  - `GameMenuLayout.astro` - Game-specific layout variations

#### CSS Organization (CUBE CSS)
```
src/css/
├── global/          # Global styles, reset, variables
├── components/      # Component-specific styles
├── utilities/       # Utility classes
└── blocks/          # Block-level compositions
```

#### Page Structure
- Main entry: `src/pages/index.astro`
- E-commerce pages: `shop.astro`, `items.astro`, `collections.astro`
- Experimental: `index_new.astro` (alternative homepage)

#### Asset Management
- Button assets: `/assets/graphics/buttons/[Button X]/`
- Gothic cursor: `/assets/cursors/gothic-default.cur`
- Public assets served from `/public/`

### Development Patterns

#### Styling Approach
- Primary: CUBE CSS methodology with custom CSS
- Secondary: Tailwind CSS utilities (applyBaseStyles: false)
- Design tokens drive consistent theming
- Responsive typography using Utopia fluid scaling

#### Component Development
- Astro components with TypeScript interfaces
- Scoped styling with global theme variables
- Accessibility-first approach (focus states, reduced motion, high contrast)
- Mobile-responsive scaling for button components

#### Performance Considerations
- Three.js optimized via Vite dependency optimization
- Image lazy loading and responsive sizing
- View transitions for smooth navigation
- Partytown isolation for third-party scripts

## Key Dependencies

### Core Framework
- `astro` - Main framework
- `@astrojs/react` - React integration for Three.js
- `@astrojs/tailwind` - Tailwind CSS integration
- `@astrojs/partytown` - Third-party script isolation

### Styling & Design
- `tailwindcss` - Utility framework (utility-second)
- `postcss-nesting` - CSS nesting support
- Design token utilities (custom)

### 3D & Interactive
- `three` - 3D graphics library
- `@types/three` - TypeScript definitions

### Development Tools
- `@astrojs/check` - TypeScript checking
- `prettier` + `prettier-plugin-astro` - Code formatting

## Theme-Specific Notes

### Gothic Sanctuary Theme
- Color palette: Dark charcoal base with brass, bone, and ember highlights
- Typography: Times New Roman serif with Cinzel for buttons
- Atmosphere: Medieval merchant sanctuary with dark fantasy elements
- Custom scrollbar styling and cursor theming

### Button System
- 6 distinct button variants with sprite-based backgrounds
- Size variations (small, medium, large) with transform scaling
- Disabled states and hover effects with brightness/saturation changes
- Responsive scaling for mobile devices
- # Astro

> Astro is an all-in-one web framework for building websites. 

- Astro uses island architecture and server-first design to reduce client-side JavaScript overhead and ship high performance websites.
- Astro’s friendly content-focused features like content collections and built-in Markdown support make it an excellent choice for blogs, marketing, and e-commerce sites amongst others.
- The `.astro` templating syntax provides powerful server rendering in a format that follows HTML standards and will feel very familiar to anyone who has used JSX.
- Astro supports popular UI frameworks like React, Vue, Svelte, Preact, and Solid through official integrations.
- Astro is powered by Vite, comes with a fast development server, bundles your JavaScript and CSS for you, and makes building websites feel fun.

## Documentation Sets

- [Abridged documentation](https://docs.astro.build/llms-small.txt): a compact version of the documentation for Astro, with non-essential content removed
- [Complete documentation](https://docs.astro.build/llms-full.txt): the full documentation for Astro
- [API Reference](https://docs.astro.build/_llms-txt/api-reference.txt): terse, structured descriptions of Astro’s APIs
- [How-to Recipes](https://docs.astro.build/_llms-txt/how-to-recipes.txt): guided examples of adding features to an Astro project
- [Build a Blog Tutorial](https://docs.astro.build/_llms-txt/build-a-blog-tutorial.txt): a step-by-step guide to building a basic blog with Astro
- [Deployment Guides](https://docs.astro.build/_llms-txt/deployment-guides.txt): recipes for how to deploy an Astro website to different services
- [CMS Guides](https://docs.astro.build/_llms-txt/cms-guides.txt): recipes for how to use different content management systems in an Astro project
- [Backend Services](https://docs.astro.build/_llms-txt/backend-services.txt): advice on how to integrate backend services like Firebase, Sentry, and Supabase in an Astro project
- [Migration Guides](https://docs.astro.build/_llms-txt/migration-guides.txt): advice on how to migrate a project built with another tool to Astro
- [Additional Guides](https://docs.astro.build/_llms-txt/additional-guides.txt): guides to e-commerce, authentication, testing, and digital asset management in Astro projects

## Notes

- The complete documentation includes all content from the official documentation
- The content is automatically generated from the same source as the official documentation

## Optional

- [The Astro blog](https://astro.build/blog/): the latest news about Astro development
- @.claude\docs.md