# SOFIA E-commerce Platform

## Overview

SOFIA is a full-stack e-commerce platform for premium Dry fruits  products. It's built as a monorepo with a React frontend, Express.js backend, and PostgreSQL database. The application features a modern, responsive design with a focus on luxury shopping experience for the Indian market.

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

## User Preferences
```
Preferred communication style: Simple, everyday language.
Theme: SOFIA - showcasing culture and tradition with vibrant colors and patterns
Logo: SOFIA (updated throughout application)
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