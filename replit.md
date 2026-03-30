# Bahar - Arabian Luxury E-Commerce

## Project Overview
A luxury e-commerce platform for premium Saudi products. The app features a beautiful dark navy and gold design with full shopping cart, product catalog, offers, checkout flow, and an admin dashboard.

## Architecture
- **pnpm monorepo** with workspaces
- **Frontend**: `artifacts/bahar/` — React 19 + Vite + Tailwind CSS 4 + shadcn/ui
- **Backend**: `artifacts/api-server/` — Express.js 5 + Pino logging
- **Database**: PostgreSQL via Drizzle ORM (`lib/db/`)
- **Shared packages**:
  - `lib/api-client-react` — React Query API client
  - `lib/api-zod` — Shared Zod validation schemas
  - `lib/db` — Drizzle ORM database client & schema

## Running the Project
Two workflows run simultaneously:
- **Start application** (port 5000): `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/bahar dev`
- **Backend API** (port 8080): `PORT=8080 pnpm --filter @workspace/api-server dev`

Frontend proxies `/api` requests to `http://localhost:8080`.

## Key Pages
- `/` — Home (hero, featured products)
- `/products` — Product catalog
- `/offers` — Special offers
- `/cart` — Shopping cart (localStorage-based)
- `/checkout` — Checkout flow
- `/liked` — Liked/wishlist products
- `/about`, `/contact` — Info pages
- `/admin` — Admin login & dashboard

## Cart Implementation
Cart is managed via React Context (`use-cart.tsx`) and persisted to `localStorage` under the key `bahar_cart`. Cart items contain: productId, productName, quantity, unitPrice, totalPrice, imageUrl.

## Database
PostgreSQL with Drizzle ORM. Tables: `products`, `offers`, `orders`, `customers`, `site_settings`.
Run migrations: `pnpm --filter @workspace/db run push`

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (set by Replit)
- `PORT` — Server port (5000 for frontend, 8080 for backend)
- `BASE_PATH` — Vite base path (set to `/`)
