# ♞ ChessStore — Chess E-Commerce Platform

<div align="center">

![ChessStore Banner](https://img.shields.io/badge/ChessStore-E--Commerce-yellow?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeT0iMjAiIGZvbnQtc2l6ZT0iMjAiPu+YnjwvdGV4dD48L3N2Zz4=)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![.NET](https://img.shields.io/badge/.NET-9-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

A modern, full-stack e-commerce platform for chess enthusiasts. Built on a microservices architecture with a .NET backend and a React + TypeScript frontend.

</div>

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [API Structure](#-api-structure)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Dependencies](#-dependencies)

---

##  Features

###  User Features

| Feature | Description |
|---------|-------------|
| **Product Listing** | Browse products with category, price range, and sorting filters |
| **Fuzzy Search** | Real-time browser-side keyword search across product name, description, and category |
| **Product Detail** | Quantity selector, stock control, VAT-inclusive price display, Free Shipping badge |
| **Cart Management** | Add/remove items, update quantities, slide-in drawer |
| **Favorites** | Favorites list persisted to localStorage, accessible at `/favorites` |
| **Checkout Flow** | 3-step checkout process (Address → Payment → Confirmation) |
| **Order Tracking** | Order history with status information |
| **JWT Authentication** | Secure session management with access token + refresh token |

###  Visual & UX Features

| Feature | Description |
|---------|-------------|
| **Hero Slider** | Swiper v14 homepage banner with auto-play and fade effect |
| **Featured Products** | Auto-scrolling responsive product carousel |
| **Hover Overlay** | Favorite / Add to Cart / View icons revealed on product card hover |
| **Badge System** | Free Shipping (≥₺500), Out of Stock, Last X, In Stock badges |
| **Category Showcase** | 3-column promotional block for Boards / Piece Sets / Books & Training |
| **Tabbed Slider** | Category-filtered Swiper-based product slider |
| **Scroll Animations** | Page scroll animations powered by Framer Motion |
| **Breadcrumb** | Clickable navigation trail on product detail pages |
| **WhatsApp Button** | Animated contact button with tooltip, fixed to the bottom-right |
| **Scroll to Top** | Framer Motion animated button that appears after 300px of scrolling |
| **Chess Background** | Chess piece SVG pattern at 2.5% opacity |
| **Poppins Font** | Loaded via Google Fonts |

###  Admin Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Summary statistics panel |
| **Product Management** | Add, edit, and delete products via modal forms |
| **Category Management** | Add, edit, and delete categories |
| **Protected Routes** | JWT token required; unauthorized access redirected |

---

##  Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 6.0 | Type safety |
| Tailwind CSS | v4 | Styling (utility-first, no `@apply`) |
| Vite | 8 | Build tool and dev server |
| React Router DOM | 7 | Client-side routing |
| Zustand | 5 | Global state management (cart, auth, favorites) |
| Swiper | 14 | Hero slider and product carousels |
| Framer Motion | 13 | Animations |
| Axios | 1.19 | HTTP client |
| react-hot-toast | 2.6 | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| .NET 9 / C# | Microservices |
| ASP.NET Core | REST API |
| Entity Framework Core | ORM |
| PostgreSQL | Database (Catalog, Identity, Order) |
| Redis | Session / caching |
| RabbitMQ | Inter-service messaging |
| Ocelot / YARP | API Gateway |
| JWT Bearer | Authentication |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker / Docker Compose | Postgres, Redis, RabbitMQ containers |

---

##  Architecture

The project is composed of independently running microservices. All client requests are routed through a single API Gateway.

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│              (Vite + TypeScript + Tailwind v4)       │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP (localhost:5000)
                        ▼
┌─────────────────────────────────────────────────────┐
│                    API Gateway                       │
│              (Ocelot / YARP — Port 5000)             │
└──┬──────────┬────────┬────────┬────────┬────────────┘
   │          │        │        │        │
   ▼          ▼        ▼        ▼        ▼
Identity   Catalog   Cart    Order   Payment
  API        API      API     API      API
(Auth/JWT) (Products)(Cart)(Orders)(Payment)
   │          │                │
   ▼          ▼                ▼
PostgreSQL PostgreSQL      PostgreSQL
                    
        ┌───────────────────┐
        │  RabbitMQ (MQ)    │  ◄── Notification.API
        └───────────────────┘
        
        ┌───────────────────┐
        │  Redis (Cache)    │
        └───────────────────┘
```

### Microservices & Ports

| Service | Port | Description |
|---------|------|-------------|
| **ApiGateway** | 5000 | Routes all incoming requests |
| **Identity.API** | 5001 | Registration, login, JWT, token refresh |
| **Catalog.API** | 5002 | Products and categories CRUD |
| **Cart.API** | 5003 | Cart management |
| **Order.API** | 5004 | Order creation and tracking |
| **Payment.API** | 5005 | Payment processing |
| **Notification.API** | 5006 | Email / notification service |

---

##  Installation

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chessstore.git
cd chessstore
```

### 2. Start Infrastructure (Docker)

Spin up PostgreSQL, Redis, and RabbitMQ containers:

```bash
docker-compose up -d
```

Verify they are running:

```bash
docker ps
# postgres (5432), redis (6379), rabbitmq (5672 / 15672) should be running
```

### 3. Install Backend Dependencies

```bash
dotnet restore ECommerce.sln
```

### 4. Install Frontend Dependencies

```bash
cd client
npm install
```

---

##  Running the App

### Start All Backend Services

Launch all .NET microservices with a single command:

```bash
./start-all.sh
```

To follow the logs:

```bash
tail -f logs/ApiGateway.log
tail -f logs/Catalog.API.log
tail -f logs/*.log          # all at once
```

To stop all services:

```bash
./stop-all.sh
```

### Start the Frontend

```bash
cd client
npm run dev
```

The application runs at: **http://localhost:5174**

> **Note:** Vite proxies requests with the `/gateway` prefix to `http://localhost:5000`.

### Production Build Only

```bash
cd client
npm run build
```

---

##  Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | ProductList | Home page — hero slider, featured products, filtered product list |
| `/product/:id` | ProductDetail | Product detail — quantity selector, stock status, favorite button |
| `/cart` | Cart | Shopping cart page |
| `/checkout` | Checkout | 3-step checkout flow (protected) |
| `/orders` | Orders | Order history (protected) |
| `/favorites` | Favorites | Favorites page |
| `/login` | Login | Login |
| `/register` | Register | Registration |
| `/admin` | AdminLayout | Admin panel (protected) |
| `/admin/dashboard` | Dashboard | Statistics |
| `/admin/products` | AdminProducts | Product management |
| `/admin/categories` | AdminCategories | Category management |

---

##  Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `Header` | Logo, search bar, favorites icon, cart, login/logout |
| `Footer` | 4-column grid, social icons, GDPR-compliant newsletter form |
| `CategoryNav` | Top category tab navigation |
| `CartDrawer` | Slide-in cart drawer from the right |
| `ProtectedRoute` | Route guard requiring a valid JWT token |

### UI Components

| Component | Description |
|-----------|-------------|
| `ProductCard` | Hover overlay, badge system, favorite/cart/view icons, VAT-inclusive price |
| `HeroSlider` | Swiper-based auto-play homepage banner |
| `FeaturedSlider` | Featured products carousel with a "View All" link |
| `TabProductSlider` | Category-tabbed Swiper slider |
| `CategoryShowcase` | 3-column category promotional block |
| `FilterSidebar` | Category + price range filter sidebar |
| `Pagination` | Smart pagination with page range display |
| `Breadcrumb` | Clickable navigation trail |
| `WhatsAppButton` | Animated WhatsApp contact button |
| `ScrollToTop` | Scroll-to-top button that appears after 300px of scrolling |

### Stores (Zustand)

| Store | Description |
|-------|-------------|
| `authStore` | Token management, login/logout |
| `cartStore` | Cart item count, drawer open/close |
| `favoriteStore` | Favorites list, localStorage persistence |

---

## 🔌 API Structure

All requests pass through `http://localhost:5000/gateway`.

### Authentication (Identity)

```
POST   /identity/api/auth/register       — Register
POST   /identity/api/auth/login          — Login (returns JWT)
POST   /identity/api/auth/refresh        — Refresh token
```

### Catalog

```
GET    /catalog/api/products             — Product list (paginated, filtered)
GET    /catalog/api/products/:id         — Product detail
POST   /catalog/api/products             — Add product (admin)
PUT    /catalog/api/products/:id         — Update product (admin)
DELETE /catalog/api/products/:id         — Delete product (admin)

GET    /catalog/api/categories           — Category list
POST   /catalog/api/categories           — Add category (admin)
PUT    /catalog/api/categories/:id       — Update category (admin)
DELETE /catalog/api/categories/:id       — Delete category (admin)
```

### Cart

```
GET    /cart/api/cart                    — Get cart
POST   /cart/api/cart/items              — Add item
PUT    /cart/api/cart/items/:id          — Update quantity
DELETE /cart/api/cart/items/:id          — Remove item
```

### Orders

```
GET    /order/api/orders                 — My orders
POST   /order/api/orders                 — Create order
```

---

##  Environment Variables

Configure the following values in each service's `appsettings.json` or `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=chessstore_db;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "Secret": "<your-secret-key>",
    "Issuer": "ChessStore",
    "Audience": "ChessStore",
    "ExpiryMinutes": 60
  },
  "Redis": {
    "ConnectionString": "localhost:6379"
  },
  "RabbitMQ": {
    "Host": "localhost",
    "Username": "guest",
    "Password": "guest"
  }
}
```

No additional configuration is needed for services running via Docker Compose (`postgres`, `redis`, `rabbitmq`).

---

##  Project Structure

```
chessstore/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.ts    # Axios + JWT interceptor + refresh
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── FeaturedSlider.tsx
│   │   │   ├── TabProductSlider.tsx
│   │   │   ├── CategoryShowcase.tsx
│   │   │   ├── CategoryNav.tsx
│   │   │   ├── FilterSidebar.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── WhatsAppButton.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Favorites.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── admin/
│   │   │       ├── AdminLayout.tsx
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Products.tsx
│   │   │       └── Categories.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts
│   │   │   └── favoriteStore.ts
│   │   ├── types/
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   ├── auth.ts
│   │   │   └── category.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               # Poppins, chess SVG pattern
│   ├── package.json
│   └── vite.config.ts
│
├── src/Services/                   # .NET Microservices
│   ├── ApiGateway/                 # Ocelot / YARP gateway
│   ├── Identity/Identity.API/      # JWT Auth
│   ├── Catalog/Catalog.API/        # Products & Categories
│   ├── Cart/Cart.API/              # Cart
│   ├── Order/Order.API/            # Orders
│   ├── Payment/Payment.API/        # Payment
│   └── Notification/Notification.API/
│
├── docker-compose.yml              # PostgreSQL, Redis, RabbitMQ
├── start-all.sh                    # Start all services
├── stop-all.sh                     # Stop all services
└── ECommerce.sln                   # .NET Solution file
```

---

##  Dependencies

### Frontend

| Package | Version | Description |
|---------|---------|-------------|
| `react` | 19.2 | UI library |
| `react-dom` | 19.2 | DOM rendering |
| `react-router-dom` | 7.18 | Routing |
| `zustand` | 5.0 | State management |
| `axios` | 1.19 | HTTP client |
| `swiper` | 14.1 | Slider / carousel |
| `framer-motion` | 13.1 | Animations |
| `react-hot-toast` | 2.6 | Toast notifications |
| `tailwindcss` | 4.3 | CSS framework |
| `typescript` | 6.0 | Type support |
| `vite` | 8.2 | Build tool |

### Backend (.NET NuGet)

| Package | Description |
|---------|-------------|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT validation |
| `Microsoft.EntityFrameworkCore` | ORM |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | PostgreSQL driver |
| `StackExchange.Redis` | Redis client |
| `MassTransit.RabbitMQ` | RabbitMQ messaging |
| `Ocelot` / `YARP` | API Gateway |

---

<div align="center">

**♞ ChessStore** — Built for chess enthusiasts.

</div>
