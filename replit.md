# IndiVendi E-commerce Platform

## Overview

Shifa Nour is a full-stack e-commerce platform for premium fashion and lifestyle products. It's built as a monorepo with a React frontend, Express.js backend, and PostgreSQL database. The application features a modern, responsive design with a focus on luxury shopping experience for the Indian market.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Local state with React hooks and localStorage
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom luxury theme variables
- **Form Handling**: React Hook Form with Zod validation

### Static Site Architecture
- **Type**: Single Page Application (SPA) with client-side routing
- **Data Storage**: Local browser storage (localStorage) for cart and wishlist
- **Content**: Static mock data for products, categories, and brands
- **Deployment**: Static site deployment ready
- **Assets**: Optimized images and resources for fast loading

## Key Components

### Data Models
- **Users**: Authentication and profile management
- **Categories**: Product categorization with hierarchical structure
- **Brands**: Brand information and association
- **Products**: Complete product catalog with variants, pricing, and metadata
- **Cart**: Session-based shopping cart functionality
- **Wishlist**: User favorite products management

### Frontend Components
- **Layout Components**: Header with search, navigation, and cart indicator
- **Product Display**: Product cards, detailed product views, and filtering
- **Shopping Features**: Cart management, wishlist functionality
- **UI Elements**: Comprehensive component library based on Radix UI
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Data Flow

### State Management
- All state managed locally with React hooks and browser storage
- Cart and wishlist data persisted in localStorage
- Real-time updates through browser events
- Toast notifications for user feedback

### Shopping Cart Flow
1. Add products to cart (stored in localStorage)
2. Quantity updates trigger local storage changes
3. Real-time cart count updates in header via custom events
4. Persistent cart across browser sessions

## External Dependencies

### Core Dependencies
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Session-based with connect-pg-simple
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React and Font Awesome
- **Validation**: Zod schema validation
- **Date Handling**: date-fns utility library

### Development Tools
- **Build**: ESBuild for production server bundling
- **Type Checking**: TypeScript strict mode
- **Linting**: Built-in TypeScript compiler checks
- **Hot Reload**: Vite HMR for frontend, tsx for backend

### External Integrations
- **Image Hosting**: Unsplash for product images
- **Fonts**: Google Fonts (Inter) and Font Awesome icons
- **Deployment**: Static site deployment ready

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Development Server**: Vite on port 5173
- **Hot Reload**: Vite HMR for instant updates

### Production Build
1. Frontend built with Vite to `/dist`
2. Static files optimized for deployment
3. All assets bundled and minified

### Environment Configuration
- **Development**: Vite development server with HMR
- **Production**: Static file deployment
- **Deployment**: Ready for any static hosting platform

## Changelog
```
Changelog:
- June 24, 2025. Initial setup
- June 24, 2025. Converted to fully static React application with local storage
  - Removed all API dependencies and TanStack Query
  - Implemented local storage for cart and wishlist functionality
  - All data now uses hardcoded mock data for static site functionality
  - Cart updates work in real-time using browser events
  - Search and filtering work client-side using JavaScript
- June 24, 2025. Updated navigation to match Tata CliQ Luxury design
  - Single navigation bar with centered logo
  - Left-aligned "ALL" and "ECO" filters  
  - Secondary category navigation bar
  - Eco-friendly product filtering with green badges
- June 24, 2025. Enhanced hero section with full-size video carousel
  - Implemented full-screen video carousel showcasing Indian sellers' products
  - Added video controls (play/pause, navigation arrows)
  - Featured authentic Indian crafts: silk sarees, jewelry, pashmina, textiles
  - Included seller branding and location information
  - Added progress indicators and smooth transitions
- June 24, 2025. Complete Indian Made theme transformation
  - Updated logo to "IndiVendi by Artisans of Bharat" throughout application
  - Implemented vibrant Indian heritage color palette with 8 cultural colors
  - Added traditional paisley-inspired SVG patterns as background elements
  - Enhanced footer with cultural elements and artisan-focused content
  - Updated 404 page with Indian aesthetic and heritage messaging
  - Applied gradient backgrounds and cultural design elements throughout
- June 24, 2025. Cleaned up project structure for static deployment
  - Removed server-side code (Express.js, database connections)
  - Eliminated unnecessary dependencies (Drizzle ORM, TanStack Query, etc.)
  - Updated build configuration for static site deployment
  - Simplified Vite configuration for frontend-only development
  - Project now fully static and ready for deployment on any static hosting
- June 24, 2025. Successfully converted to fully functional static React application
  - Fixed all remaining mutation errors and API references
  - Created proper client-side Vite configuration
  - Started development server on port 5173
  - All features working: cart, wishlist, product browsing with localStorage persistence
- June 24, 2025. Converted client application to Next.js compliance
  - Migrated from Wouter to Next.js App Router with file-based routing
  - Added "use client" directives to all client-side components
  - Updated all navigation hooks to Next.js equivalents (useRouter, Link)
  - Fixed PostCSS configuration for Next.js compatibility
  - Application now runs on Next.js 15.3.4 with proper SSR/CSR hybrid architecture
  - Restored original React designs and styling for all pages while maintaining Next.js functionality
  - Simplified page layouts to match original React implementation exactly
  - Removed newsletter signup section from homepage per user request
  - Reordered homepage sections: Popular Categories, Celebrate Craftsmanship, Featured Products, Discover Categories, Spotlight On, Elite Retailers
  - Fixed cart page hydration errors with proper client-side mounting checks
  - Updated category pages to match Tata CLiQ Luxury design exactly with 14px font size, proper spacing, clean filter sidebar, and authentic layout matching reference screenshots
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
Theme: Indian Made - showcasing culture and tradition with vibrant colors and patterns
Logo: Shifa Nour by Artisans of Bharat (updated throughout application)
Primary brand color: Orange (#f97316 - orange-500) for main CTAs and highlights
Navigation style: Clean, minimal design without gradients - matching Tata CLiQ style
Button styling: Simple, eye-catching designs with orange primary color throughout app
Text colors: Gray-700 for navigation, black on hover for good contrast
Responsive design: Must work on all device sizes with proper tablet navigation display
Navigation: ALL and ECO categories with simple horizontal layout, no scroll on desktop
Typography: Clean, professional hierarchy with medium font weights
Mobile navigation: Categories in hamburger menu only, tablet/desktop show category bar
Design philosophy: Clean and modern while maintaining Indian cultural elements
```