# Alumnos Solidarios — Web Application

## Overview
Community/organization web application for "Alumnos Solidarios". Full-stack app with React frontend and Express backend.

## Tech Stack
- **Frontend**: React + Vite, TypeScript, TailwindCSS, shadcn/ui, Wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: express-session + connect-pg-simple + bcrypt

## Features

### Authentication
- Registration and login with email/password (bcrypt hashed)
- Two roles: `admin` and `user`
- Session-based authentication (stored in PostgreSQL)
- Routes: `/auth`

### Admin Panel (`/admin`)
- Restricted to admin role only
- **News management**: Create, edit, delete news articles
- **Activities management**: Create, edit, delete events/activities
- **Products management**: Create, edit, delete store products; manage extra images
- **Promo codes**: Create, activate/deactivate, delete promotional codes

### Store (`/tienda`)
- Product listing with category filters and search
- Product detail page with image gallery
- Product reviews and star ratings (authenticated users)
- Add to cart functionality

### Shopping Cart (`/carrito`)
- Session-based cart (works for guests too)
- Update quantities, remove items
- Apply promotional codes with discount calculation
- Place orders (requires authentication)

### My Orders (`/mis-pedidos`)
- View order history for authenticated users

### Search (`/buscar`)
- Full-text search across products, news, and activities
- Real-time debounced search

### News & Activities
- News listing and detail pages
- Activities/Events listing with dates and locations

## Database Schema
Tables: `users`, `contact_messages`, `news`, `activities`, `products`, `product_images`, `product_reviews`, `promo_codes`, `cart_items`, `orders`, `order_items`, `session`

## Key Files
- `shared/schema.ts` — Drizzle schema + Zod types
- `shared/routes.ts` — API route definitions
- `server/index.ts` — Express app setup with sessions
- `server/routes.ts` — All API route handlers
- `server/storage.ts` — Database operations (IStorage interface)
- `server/db.ts` — Database connection
- `client/src/App.tsx` — React router
- `client/src/hooks/use-auth.ts` — Auth hooks
- `client/src/hooks/use-cart.ts` — Cart hooks

## Visual Style
- Warm cream/off-white background
- Primary pink accent (`hsl(340 82% 65%)`)
- Nunito (body) + Quicksand (display/headings) fonts
- Rounded pill/card UI elements
- Do NOT change the visual styling

## Admin Credentials (Development)
- Email: `admin@test.com`
- Password: `admin123`

## Running
Workflow "Start application" runs `npm run dev` which starts both backend (Express on port 5000) and frontend (Vite HMR proxy).
