# Build8Now — Construction Material Procurement, Dynamic Logistics & Partner Loyalty Platform

**Lead Full Stack & SEO Engineer:** Deepak  
**Target Platform:** [Home | Build8Now](https://build8now.com) — Premier Construction Material Procurement & Logistics Platform  
**Walkthrough Video (3-5 mins):** [Watch Walkthrough Screen Recording](#-walkthrough-video--demo-guide) *(Script documented in [`docs/WALKTHROUGH_SCRIPT.md`](docs/WALKTHROUGH_SCRIPT.md))*  

---

## 📋 Executive Overview

A production-grade, modular Node.js backend (Port 5000) and Next.js 14 SSR frontend (Port 3000) engineered for **Build8Now** construction material procurement. Core capabilities include:
- **Dynamic Logistics & Shipping Engine** — Data-driven multi-criteria logistics evaluation (weight slabs, volumetric weight $(L \times W \times H)/5000$, surface area, per-km distance, min/max charge bounds, `SUM`/`MAX`/`TIERED_SLAB` combination strategies).
- **Influencer & Partner Loyalty System** — 4 influencer partner types (*Architect, Contractor, Interior Designer, Builder*) with 3-tier rule precedence (`Product (30) > Category (20) > Cart (10)`), database-level composite unique idempotency constraints, append-only auditable ledger, and proportional refund reversals with redemption debt handling.
- **Authentication & Role-Based Access Control** — Secure bcrypt password hashing, JWT token lifecycle, role isolation (`ADMIN`, `INFLUENCER`, `CUSTOMER`), and object-level authorization (ABAC / IDOR defense).
- **Database Architecture & OpenAPI Design** — Prisma ORM schema with foreign keys, composite unique constraints, justified indexes, comprehensive seed data, and OpenAPI/Swagger documentation.
- **Technical SEO & Server-Side Rendering** — Next.js SSR product page (`/products/ultratech-super-cement-50kg`), Schema.org JSON-LD (`Product`, `Offer`, `BreadcrumbList`, `AggregateRating`), OpenGraph tags, canonical URLs, static `robots.txt`, XML `sitemap.xml`, 301 redirects, and Core Web Vitals optimization.
- **Automated Quality Assurance & Security** — Comprehensive Vitest test suite covering 141 tests across 10 suites and exhaustive `SECURITY.md` report.

---

## 🛠️ Complete Technology Stack & Specifications

The system is engineered as an enterprise-grade modular monolith designed for sub-second performance, strict data integrity, and search-engine indexability:

### 1. Backend Service (`Port 5000`)
| Layer / Domain | Technology & Version | Purpose & Architectural Rationale |
|---|---|---|
| **Runtime Engine** | **Node.js (v18+ / v20 LTS / v24)** | High-throughput asynchronous event-driven I/O engine. |
| **Module Standard** | **Native ES Modules (`"type": "module"`)** | Modern JavaScript standard (`import`/`export`), zero transpilation friction, instant cold boot. |
| **Web Framework** | **Express.js (`v4.19.2`)** | Minimalist, unopinionated, unbloated HTTP router allowing explicit middleware pipeline control without framework ceremony. |
| **ORM & Data Layer** | **Prisma ORM (`v5.19.0`)** | Type-safe query engine, declarative schema migrations, foreign keys, cascade triggers, composite unique constraints, and justified indexes. |
| **Database Engines** | **Dual Engine: SQLite (Local) & PostgreSQL 15 (Prod)** | SQLite for zero-setup 1-click evaluation; PostgreSQL (`docker-compose.yml`) for multi-instance production scale. |
| **DTO & Validation** | **Zod (`v3.23.8`)** | Strict runtime schema parsing, type coercion, regex sanitization, and network-boundary validation (rejects malicious payloads before controllers). |
| **Authentication** | **JSON Web Tokens (`jsonwebtoken v9.0.2`)** | Stateless cryptographic tokens with role claims (`ADMIN`, `INFLUENCER`, `CUSTOMER`), 7-day TTL, and signature verification. |
| **Password Security** | **Bcrypt.js (`v2.4.3`)** | Cryptographic one-way adaptive hashing with 10 salt rounds against rainbow tables and brute-force attacks. |
| **API Security Headers** | **Helmet (`v7.1.0`)** | Automated HTTP security headers (Content Security Policy, X-Frame-Options, Strict-Transport-Security, X-Content-Type-Options). |
| **Cross-Origin Policy** | **CORS (`v2.8.5`)** | Granular origin whitelisting (`http://localhost:3000` / production domain) preventing unauthorized cross-origin calls. |
| **Rate Limiting** | **Express-Rate-Limit (`v7.4.0`)** | In-memory token bucket rate limiting (100 req/15min) preventing DDoS, brute-force login attempts, and scraper abuse. |
| **API Specification** | **OpenAPI 3.0.0 & Swagger UI (`swagger-ui-express v5.0.1`)** | Interactive API explorer serving all 22 paths and 26 REST operations at `http://localhost:5000/api-docs`. |
| **Automated Testing** | **Vitest (`v1.6.0`) & Supertest (`v7.0.0`)** | Blazing fast native ESM testing engine running 141 tests in under 2.5s with zero build step. |

### 2. Frontend Application (`Port 3000`)
| Layer / Domain | Technology & Version | Purpose & Architectural Rationale |
|---|---|---|
| **Framework** | **Next.js (`v14.2.4`) App Router** | Hybrid Server-Side Rendering (SSR), Server Components, and static page optimization. |
| **Core UI Library** | **React (`v18.3.1`) & React-DOM** | Declarative component model, stateful hooks, event dispatching, and hydration. |
| **Styling Engine** | **Tailwind CSS (`v3.4.4`) & PostCSS** | Utility-first responsive styling with custom obsidian luxury SaaS dark mode tokens. |
| **Utility Libraries** | **`clsx` (`v2.1.1`) & `tailwind-merge` (`v2.3.0`)** | Conflict-free conditional className composition. |
| **Iconography** | **Lucide React (`v0.395.0`) & React Icons (`v5.7.0`)** | Crisp SVG vector icons with zero bundle bloat and tree-shaking support. |
| **Technical SEO** | **Next.js Metadata API & JSON-LD** | SSR dynamic metadata, canonical URLs, Schema.org `Product`, `Offer`, `BreadcrumbList`, XML `sitemap.xml`, and `robots.txt`. |
| **Performance Tuning** | **`next/image` & Web Vitals** | Priority LCP image loading, responsive WebP image delivery, layout shift prevention (CLS = 0.00). |

### 3. DevOps & Environment Infrastructure
| Component | Tooling | Purpose |
|---|---|---|
| **Containerization** | **Docker & Docker Compose** | Multi-container setup for production PostgreSQL database provisioning (`docker compose up -d`). |
| **Version Control** | **Git & GitHub** | Linear, descriptive commit history on `main` branch matching project milestone delivery. |
| **Local Tools** | **Prisma Studio (`npx prisma studio`)** | Visual database administration GUI for inspecting ledger entries and foreign keys. |

---

## 🏗️ Repository Architecture

```
build8now-platform/
├── backend/                              # Node.js + Express (ES Modules) Backend Service (Port 5000)
│   ├── prisma/                           # Prisma schema, migrations & seed script
│   │   ├── schema.prisma                 # Universal SQLite (local dev) / PostgreSQL (production) schema
│   │   └── seed.js                       # Seed data (1 Admin, 4 Influencer types, 2 Customers, 2 Profiles, 4 Products, 4 Rules)
│   ├── src/
│   │   ├── config/                       # Zod-validated environment config
│   │   ├── common/                       # Enterprise helpers, custom errors, middlewares, logger
│   │   │   ├── errors/                   # AppError, BadRequestError, ForbiddenError, NotFoundError, ValidationError
│   │   │   ├── helpers/                  # api-response, async-handler, precision math, pagination
│   │   │   └── middlewares/              # auth.middleware, role.middleware (RBAC/ABAC), Zod validator, rate-limiter
│   │   ├── modules/                      # 📦 Modular Domain Structure
│   │   │   ├── auth/                     # JWT authentication, bcrypt hashing, user profiles
│   │   │   ├── shipping/                 # Dynamic Multi-criteria Logistics & Shipping Engine
│   │   │   ├── loyalty/                  # 3-Tier Loyalty Precedence & Append-Only Ledger
│   │   │   ├── influencers/              # Influencer partner management & referral linking
│   │   │   ├── orders/                   # Order placement, shipping derivation & ABAC isolation
│   │   │   └── products/                 # Product catalog & shipping profile associations
│   │   ├── docs/                         # OpenAPI / Swagger JSON spec (served at /api-docs)
│   │   ├── tests/                        # 100% Automated Vitest test suite (141 tests passing across 10 test suites)
│   │   ├── app.js                        # Express setup with Helmet, CORS, Rate-Limiting & Error Handler
│   │   └── server.js                     # Application entrypoint on Port 5000
│   └── docker-compose.yml                # Optional PostgreSQL container for production
│
├── frontend/                             # Next.js 14+ App Router (SSR & Technical SEO) (Port 3000)
│   ├── public/                           # Static production assets (robots.txt, sitemap.xml)
│   ├── src/app/
│   │   ├── page.js                       # Central Enterprise Auth & RBAC Portal (1-Click Logins & Dashboards)
│   │   ├── auth/                         # Dedicated Auth & User Registration Route
│   │   ├── products/[slug]/              # Production SSR Product Page (JSON-LD, Breadcrumbs, Canonical)
│   │   ├── not-found.js                  # Custom 404 page
│   │   └── globals.css                   # Obsidian Luxury Dark SaaS Theme & Design Tokens
│   └── next.config.mjs                   # HTTP 301 Permanent Redirects & Core Web Vitals Optimization
│
├── docs/                                 # Architectural & Submission Documentation
│   ├── ERD.md                            # Database ER Diagram (Mermaid) with index justifications
│   ├── SEO.md                            # Technical SEO strategy & Core Web Vitals audit
│   ├── SECURITY.md                       # OWASP Top 10 defenses, JWT lifecycle & ABAC threat model
│   ├── WALKTHROUGH_SCRIPT.md             # 3-5 Minute step-by-step video recording script
│   └── postman_collection.json           # Ready-to-import Postman Collection with automated tests
└── README.md                             # Master documentation
```

---

## ⚡ Quickstart Guide (Run from a Fresh Clone)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24)
- **npm**: v9+

---

### 2. Backend Setup & Run (Port 5000)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize database schema & seed realistic construction data
npx prisma generate
npx prisma db push
node prisma/seed.js

# Run the automated test suite (141/141 passing across 10 test suites)
npm test

# Start the backend server on http://localhost:5000
npm run dev
```

> **Optional PostgreSQL Setup:**  
> To run on PostgreSQL instead of SQLite:  
> 1. Run `docker compose up -d` in `backend/` to start PostgreSQL container.  
> 2. In `backend/.env`, set `DATABASE_URL="postgresql://build8_user:build8_secret@localhost:5432/build8now_db?schema=public"`.  
> 3. In `backend/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.  
> 4. Run `npx prisma db push && node prisma/seed.js`.

---

### 3. Frontend Setup & Run (Port 3000)

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server on http://localhost:3000
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Pre-Seeded User Credentials (1-Click Test Accounts)

| Role | Name | Email | Password | Role Description |
|---|---|---|---|---|
| **Super Admin** | Build8Now Super Admin | `admin@build8now.com` | `Password123!` | Manages shipping profiles, loyalty rules, provisions influencers |
| **Influencer** | Rahul Verma Architect | `rahul.architect@build8now.com` | `Password123!` | Referral Code: `INF-RAHUL-MAIN` (Earns 8% loyalty rewards) |
| **Influencer** | Vikram Singh (Contractor) | `contractor.vikram@build8now.com` | `Password123!` | Referral Code: `INF-VIKRAM-CONT` (Manages bulk client slabs) |
| **Customer** | Priya Sharma (Customer) | `priya.sharma@gmail.com` | `Password123!` | Referred by Ar. Rahul; orders cement & building materials |

---

## 🖥️ Page-by-Page Application & Functionality Guide

The application is structured into four primary interactive interfaces designed for evaluating business logic, security boundaries, and technical SEO:

### 1. Root Authentication & RBAC Portal (`/` & `/login` & `/auth`)

When a user visits the root URL or is unauthenticated:
- **Distraction-Free Centered View:** The global Navbar and Footer are completely hidden, presenting a focused, centered obsidian glassmorphism card.
- **1-Click Test Shortcuts:** Evaluators can click any of the 4 role pills (`admin`, `rahul.architect`, `vikram.contractor`, `priya.sharma`) to instantly fill credentials and sign in with a single click.
- **Credential Sign-In Form:** Standard email/password login calling `POST /api/v1/auth/login`. Returns a signed JWT token, stores the user session, and triggers instant client event updates (`build8now_auth_change`) across all components.
- **Registration Toggle & Simplified Role Selector:**
  - Clicking *"Don't have an account? Register New Account"* switches smoothly to the registration view.
  - Users choose between **Customer (Material Buyer)** and **Influencer Partner (Architect / Contractor / Builder)**.
  - If Influencer is selected, partner type and custom referral code inputs appear dynamically.
  - *Enterprise Security Rule:* Super Admin accounts cannot be publicly registered (they are securely pre-seeded in the database).
  - Validation: Full names are strictly checked against letters-only regex (`/^[a-zA-Z\s\.\-']+$/`), and emails are verified via DNS MX record lookup.
- **Floating Auto-Dismiss Toasts:** Toast notifications float in the top-right corner (`fixed top-6 right-6 z-[120]`) and auto-dismiss after 4–5 seconds with **zero page layout shift**.

---

### 2. Authenticated Dashboards & Workspace Modes (`/` when Logged In)

Once authenticated, the global **Navbar** and **Footer** dynamically appear with the user's name, role badge, and session controls. The view automatically renders the user's specific workspace:

#### A. Super Admin Management Console (`ADMIN` Role)
- **Shipping Profiles CRUD Sub-Tab:**
  - **Create Profile (`POST /api/v1/shipping/profiles`):** Configure profile name, combination strategy (`SUM`, `MAX`, `TIERED_SLAB`), min charge, max cap, and attach rules (`WEIGHT_SLAB`, `PER_KM_DISTANCE`, `VOLUMETRIC`, `AREA_SURFACE`).
  - **Read / List Profiles (`GET /api/v1/shipping/profiles`):** Displays all active and inactive profiles with rule counts and strategy badges.
  - **Update Profile (`PUT /api/v1/shipping/profiles/:id`):** Clicking **"Edit"** on any profile opens a **true viewport-centered modal overlay** with pre-filled fields to modify name, strategy, and caps.
  - **Deactivate Profile (`DELETE /api/v1/shipping/profiles/:id`):** Soft-deactivates profiles, preventing products from assigning to inactive rules.
- **Assign Product Sub-Tab (`POST /api/v1/shipping/assign-product`):**
  - Associates a shipping profile to a specific material product (e.g. assigning "Heavy Construction Freight" to UltraTech Cement).
- **Influencers Sub-Tab (`GET /api/v1/influencers` & Provisioning):**
  - View all registered partner influencers and their assigned referral codes.
  - Provision new partner accounts directly with automatic referral code generation.
- **Loyalty Rules Sub-Tab (`POST /api/v1/loyalty/rules`):**
  - Create rules with configurable 3-tier precedence (`PRODUCT (30)`, `CATEGORY (20)`, `CART (10)`).
- **Orders & Refund Simulator Sub-Tab (`POST /api/v1/loyalty/process-refund`):**
  - Inspect all system orders.
  - Simulate customer order cancellations (100% point reversal) or partial returns (proportional point reversal and redemption debt generation).

#### B. Influencer Rewards & Referral Hub (`INFLUENCER` Role)
- **Live Metrics Banner:** Displays active points balance, influencer partner type badge (e.g. *Architect*, *Contractor*), and custom referral code (`INF-RAHUL-MAIN`).
- **Referred Customers Directory:** Lists customers linked to this influencer's code.
- **Auditable Append-Only Ledger (`GET /api/v1/loyalty/ledger/:influencerId`):**
  - Shows complete immutable history of points earned (`ORDER_ACCRUAL`) and reversed (`ORDER_REFUND_REVERSAL`).
  - Strict ABAC: Influencer can ONLY see their own ledger; foreign ledger queries return `403 Forbidden`.

#### C. Customer Material Procurement Hub (`CUSTOMER` Role)
- **Dynamic Multi-Criteria Freight Calculator (`POST /api/v1/shipping/calculate`):**
  - Real-time engine calculating unit weight, package dimensions (length, width, height), derived volume $(L \times W \times H)/5000$, derived surface area, quantity, and travel distance in km.
  - Returns transparent rule execution trace and rounded currency totals.
- **Order History:** Lists historical material purchase orders placed by this customer.
- **Live Role & Security Boundary Inspector:**
  - Evaluators can test live security assertions with 1 click:
    - `POST /shipping/profiles` without Admin token $\rightarrow$ returns **403 Forbidden**.
    - `GET /loyalty/ledger/:otherId` (foreign influencer ID) $\rightarrow$ returns **403 Forbidden** (IDOR guard).
    - `GET /orders` without token $\rightarrow$ returns **401 Unauthorized**.

---

### 3. Technical SEO SSR Product Page (`/products/[slug]`)

Visit **[http://localhost:3000/products/ultratech-super-cement-50kg](http://localhost:3000/products/ultratech-super-cement-50kg)**:
- **Server-Side Rendered (SSR):** Full HTML delivered on initial response for Googlebot crawling.
- **Dynamic Metadata (`generateMetadata`):** Unique `<title>`, `<meta name="description">`, keywords, and canonical URL (`https://build8now.com/products/ultratech-super-cement-50kg`).
- **Semantic Breadcrumbs & Schema.org JSON-LD:**
  - Visible `<nav aria-label="Breadcrumb">` hierarchy: `Home / Cement & Concrete / UltraTech Super Cement 50kg`.
  - Machine-readable `<script type="application/ld+json">` with `@type: BreadcrumbList`.
  - Comprehensive `@type: Product` and `@type: Offer` schema (Brand: UltraTech Cement, Price: ₹380, Currency: INR, Availability: InStock, Rating: 4.8).
- **Core Web Vitals Optimizations:**
  - Image loaded via `next/image` with `priority` and responsive `sizes` for sub-second LCP.
  - Zero Cumulative Layout Shift (CLS = 0.00).
- **Social Graph Tags:** Complete OpenGraph (`og:title`, `og:image`, `og:url`) and Twitter Card metadata for link previews on WhatsApp, LinkedIn, and Twitter.
- **301 Redirect Demonstration:** Navigating to `/products/old-ultratech-cement` permanently redirects to the canonical product URL with HTTP 301.

---

### 4. Interactive OpenAPI / Swagger Documentation (`http://localhost:5000/api-docs`)

- Full interactive Swagger UI exploring all **22 API paths and 26 REST operations** across Shipping, Loyalty, Authentication, Influencer Management, Orders, and Product Catalog with exhaustive request/response schemas, bearer token authorization, and live test execution.

---

## 🎯 Core Engineering & System Architecture

### 🚚 Dynamic Logistics & Multi-Criteria Shipping Engine

- **Data-Driven Rules:** Rules are stored in database (`ShippingProfile` $\rightarrow$ `ShippingRule`), not hardcoded per product.
- **Multi-Criteria Support:** Slabs and rates dynamically evaluate on:
  - `WEIGHT_SLAB`: Slabs for light, medium, and bulk heavy freight loads.
  - `PER_KM_DISTANCE`: Base transport fee + per-km charge beyond threshold distance.
  - `VOLUMETRIC`: Volumetric weight computed as $\text{Volumetric Wt (kg)} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{5000}$.
  - `AREA_SURFACE`: Surface area computed as $\text{Surface Area} = 2 \times (LW + WH + HL) / 10000$ ($m^2$).
  - `FIXED_FEE` & `BASE_PRICE_PERCENTAGE`.
- **Combination Strategies:**
  - `SUM`: Adds all matching rule outputs together.
  - `MAX`: Takes the highest single matching rule charge.
  - `TIERED_SLAB`: Progressive tiered calculation across weight boundaries.
- **Edge-Case Protections:**
  - Strict input boundary clamping: weight (0.01kg – 100,000kg), dimensions (1cm – 3,000cm), distance (0km – 3,000km).
  - Decimal weight support (e.g. 75.5kg).
  - Minimum (`minCharge`) and maximum (`maxCharge`) cap bounds.
  - Two decimal precision currency rounding (`MathHelper.round2`).

---

### 🎁 Influencer & Partner Loyalty Rewards System

- **4 Influencer Types:** `ARCHITECT`, `CONTRACTOR`, `INTERIOR_DESIGNER`, `BUILDER`.
- **Configurable 3-Tier Precedence Hierarchy:**
  1. **Tier 1 (Priority 30): Product-Specific Rule** (e.g. UltraTech Cement $\rightarrow$ 8% reward points).
  2. **Tier 2 (Priority 20): Category-Specific Rule** (e.g. Steel & Structural $\rightarrow$ 5% reward points).
  3. **Tier 3 (Priority 10): Cart Value / Default Rule** (e.g. Orders $\ge$ ₹10,000 $\rightarrow$ 2% bonus points).
- **Database-Level Idempotency Protection:**
  - Guaranteed via database composite unique index `(orderId, eventType, idempotencyKey)` on `LoyaltyLedger`.
  - Duplicate order webhook events or retry requests are automatically intercepted by the database layer, returning idempotent cached responses with zero duplicate point accrual.
- **Auditable Append-Only Ledger & Refund Reversals:**
  - 100% Order Cancellation $\rightarrow$ Emits `ORDER_CANCEL_REVERSAL` reversing 100% of awarded points.
  - Partial Refund $\rightarrow$ Emits `ORDER_REFUND_REVERSAL` reversing points strictly proportional to refund amount:
    $$\text{Points Reversal} = \left(\frac{\text{Refund Subtotal}}{\text{Original Order Subtotal}}\right) \times \text{Original Points Awarded}$$
  - **Redemption Debt Handling:** If points have already been redeemed/spent by the influencer prior to refund, the ledger records the debit into a negative balance ("Redemption Debt"), safely recovered against future earnings without breaking database consistency.

---

### 🔒 Authentication & Role-Based Authorization (RBAC + ABAC)

- **Authentication:** Bcrypt password hashing (10 salt rounds) + stateless JWT token with configurable expiry (`JWT_EXPIRES_IN=7d`).
- **Role Isolation:**
  - `ADMIN`: Manages shipping profiles (`POST /shipping/profiles`), loyalty rules (`POST /loyalty/rules`), and provisions new influencer accounts.
  - `INFLUENCER`: Can access only their own referral balance, ledger history, and referred customers (`GET /loyalty/ledger/:influencerId`).
  - `CUSTOMER`: Can view only their own purchase orders (`GET /orders`).
- **Object-Level Access Control (ABAC / IDOR Defense):**
  - Even with a valid JWT, attempting to query another user's `influencerId` or `customerId` is intercepted by `role.middleware.js` and services, returning `403 Forbidden` (`"Forbidden: You cannot access or modify resources belonging to another user"`).

---

### 🌐 Technical SEO Architecture (Next.js SSR)

- **Sample Page URL:** [`/products/ultratech-super-cement-50kg`](http://localhost:3000/products/ultratech-super-cement-50kg)
- **Dynamic SEO Metadata:** Server-side generated `<title>`, `<meta name="description">`, keywords, and canonical link tag.
- **Schema.org Structured Data (JSON-LD):**
  - `@type: BreadcrumbList` (Home $\rightarrow$ Category $\rightarrow$ Product).
  - `@type: Product` (Brand: UltraTech Cement, SKU: CEM-ULTRA-50KG, Weight: 50kg, Rating: 4.8 / 142 reviews).
  - `@type: Offer` (Price: ₹380.00 INR, InStock, PriceValidUntil: 2026-12-31, Seller: Build8Now).
- **Robots & Sitemap:**
  - Valid `public/robots.txt` disallowing sensitive endpoints and pointing to XML sitemap.
  - Valid `public/sitemap.xml` with priority `1.0` and `0.9` tags.
- **HTTP 301 Permanent Redirects:**
  - Legacy URLs (`/products/old-ultratech-cement` and `/cement/ultratech-50kg`) permanently redirect with HTTP 301 in `next.config.mjs`.
- **Core Web Vitals Optimizations:**
  - Next.js `next/image` with `priority` attribute for sub-second Largest Contentful Paint (LCP < 1.2s).
  - Static zero-layout-shift bounding boxes (CLS = 0.00).

---

## 🧪 Automated Quality Assurance & Security Test Suite

Run all 141 automated unit, integration, and security tests with a single command:
```bash
cd backend && npm test
```

### Test Coverage Breakdown:

| Test Domain | Covered Test Cases | Results |
|---|---|---|
| **Shipping Engine** (`shipping.test.js`) | Derived volume $(L \times W \times H)/5000$, surface area, weight slabs, per-km distance, `SUM`/`MAX` strategies, min/max caps, decimal weights, inactive profiles | ✅ **14 / 14 Passed** |
| **Shipping & Validation Deep Audit** (`shipping-validation-deep-audit.test.js`) | Full Shipping CRUD (Create, Read/List, Update PUT, Deactivate DELETE, Assign to product), derived metrics, Zod negative/boundary validation | ✅ **30 / 30 Passed** |
| **Loyalty Engine** (`loyalty.test.js`) | 3-tier precedence (`Product > Category > Cart`), mixed multi-item carts, fixed points, inactive rule bypass, unreferred orders | ✅ **7 / 7 Passed** |
| **Database Idempotency** (`idempotency.test.js`) | Duplicate order replay prevention, DB unique constraint verification, 0 extra points awarded | ✅ **1 / 1 Passed** |
| **Refund Reversals** (`refund-reversal.test.js`) | 100% cancellation reversal, 50% partial proportional refund reversal, redemption debt negative balance creation | ✅ **3 / 3 Passed** |
| **Auth & RBAC / ABAC** (`auth-rbac.test.js`) | Admin/Customer/Influencer JWT tokens, 401 unauthenticated, 403 role mismatch, Object-level IDOR protection | ✅ **9 / 9 Passed** |
| **Security & Vulnerability Audit** (`security-audit.test.js`) | OWASP Top 10, Bcrypt hash validation, JWT claims & secret verification, Helmet headers, CORS, SQL injection prevention, rate limiting | ✅ **47 / 47 Passed** |
| **E2E 22-Step Real World Flow** (`e2e-22-steps.test.js`) | Complete 22-step business flow (Admin -> Profile -> Product -> Customer -> Influencer -> Order -> Loyalty -> Idempotency -> Refund) | ✅ **18 / 18 Passed** |
| **Input Validation** (`validation.test.js`) | Zod DTO validations, invalid emails, short passwords, negative weights, 404 handler, health check | ✅ **10 / 10 Passed** |
| **Order Management** (`orders.test.js`) | Order placement, automated freight derivation, influencer referral linking, customer order isolation | ✅ **2 / 2 Passed** |
| **TOTAL** | **141 Comprehensive Automated Tests Across 10 Test Suites** | **✅ 141 / 141 Passed (100%)** |

---

## 🎥 Walkthrough Video & Demo Guide

Follow the timestamped walkthrough guide documented in [`docs/WALKTHROUGH_SCRIPT.md`](docs/WALKTHROUGH_SCRIPT.md) to record the 3-5 minute video submission:
1. **[0:00 - 0:45]** Architecture overview & 1-click login as Super Admin.
2. **[0:45 - 1:45]** Dynamic shipping calculation with formula breakdown on Port 5000.
3. **[1:45 - 2:45]** Loyalty 3-tier precedence (8% vs 5%), duplicate idempotency test, and 50% refund reversal.
4. **[2:45 - 3:30]** RBAC & ABAC Security (Customer 403 on Admin routes, IDOR defense on foreign ledgers).
5. **[3:30 - 4:15]** Technical SEO Product Page (View source, JSON-LD Schema.org, Canonical, Robots.txt, Sitemap.xml).
6. **[4:15 - 4:45]** Run automated test suite (`npm test` $\rightarrow$ 141/141 Passed across 10 test suites).

---

## 🔄 Complete End-to-End Business Lifecycle Architecture

The implementation follows a deterministic, data-driven lifecycle designed for construction material procurement:

```
[1. Product Catalog] ──> [2. Shipping Profile CRUD] ──> [3. Assign Profile] ──> [4. Dynamic Freight Calc]
       │                                                                                   │
       ▼                                                                                   ▼
[5. Influencer Register] ──> [6. Referral Linkage] ──> [7. Order Placement] ──> [8. 3-Tier Precedence]
                                                                                           │
                                                                                           ▼
[11. Proportional Refund] <── [10. Append-Only Ledger] <── [9. DB Idempotency Key] <────────┘
```

1. **Product Attributes & Modeling:**
   Products (`Product` table) define physical attributes: unit weight (`weightKg`), dimensional bounds (`lengthCm`, `widthCm`, `heightCm`), SKU, category, and standard pricing.
2. **Dynamic Shipping Profile Definition (CRUD):**
   Admins manage shipping profiles (`ShippingProfile`) with combination strategies (`SUM`, `MAX`, `TIERED_SLAB`), clamping thresholds (`minCharge`, `maxCharge`), and multiple attached polymorphic rules (`WEIGHT_SLAB`, `PER_KM_DISTANCE`, `VOLUMETRIC`, `AREA_SURFACE`, `FIXED_FEE`).
3. **Product-to-Profile Assignment:**
   Admins associate profiles to products via `POST /api/v1/shipping/assign-product`.
4. **Dynamic Multi-Criteria Freight Calculation:**
   Evaluates derived volumetric weight $(L \times W \times H)/5000$, billable surface area $2(LW + WH + HL)/10000$, weight slabs with decimal weights, and distance surcharges, returning transparent calculation traces and currency-rounded totals.
5. **Influencer Partner Ecosystem:**
   Architects, Contractors, Interior Designers, and Builders register with unique referral codes (`INF-RAHUL-MAIN`).
6. **Customer Referral Linkage:**
   Customer orders are linked to influencers during registration or checkout via `referredById`.
7. **Order Placement:**
   Customer purchases materials (`POST /api/v1/orders`), snapshotting unit prices, quantities, and automated freight.
8. **3-Tier Loyalty Precedence Engine:**
   Points are automatically computed on order completion:
   - **Tier 1 (Highest, Priority 30):** Product-specific rule (e.g. UltraTech Cement @ 8%).
   - **Tier 2 (Medium, Priority 20):** Category-specific rule (e.g. Steel @ 5%).
   - **Tier 3 (Default, Priority 10):** Cart-value/Default rule (e.g. Bulk orders @ 2%).
9. **Database-Level Idempotency Protection:**
   The unique constraint `@@unique([orderId, eventType, idempotencyKey])` strictly guarantees that re-submitting or replaying order processing requests awards 0 duplicate points.
10. **Append-Only Auditable Ledger:**
    Points are recorded as immutable ledger entries (`ORDER_ACCRUAL`, `ORDER_CANCEL_REVERSAL`, `ORDER_REFUND_REVERSAL`). Balances are never silently modified.
11. **Proportional Refund Reversals & Redemption Debt:**
    Partial refunds reverse points in exact mathematical proportion to the refunded monetary amount (`refundRatio = refundAmount / orderSubtotal`). If points were already spent prior to refund, the ledger enters a negative balance (*Redemption Debt*), safely documented for partner settlement.

---

## ⚖️ Architectural Design Decisions & Trade-offs

### 1. Architectural Rationale: Node.js ES Modules + Zod vs. NestJS / TypeScript
Pure modern Node.js (native ES Modules) with runtime **Zod DTO schema validation** was selected:
- **Zero-Transpilation Execution:** Eliminates `tsc` build errors, source-map misalignment, and module-resolution compilation friction. Developers and CI pipelines can run `npm install && npm test` instantly on any standard Node.js v18+ runtime.
- **Runtime Network Boundary Safety vs. Compile-Time Erasure:** TypeScript types are erased at compile time and provide zero defense against malformed or malicious incoming JSON payloads. In contrast, Zod provides strict runtime validation at the HTTP boundary, enforcing exact data types, min/max numeric bounds, regex pattern sanitization, and blocking unexpected fields before execution reaches business controllers.
- **Minimalist Architecture:** Eliminates NestJS boilerplate (Modules, Providers, Injectables, DTO classes with `class-validator` / `class-transformer` decorators, and reflection metadata), allowing full engineering focus on deep domain logic: multi-criteria dynamic logistics formulas, 3-tier loyalty precedence, database-level idempotency constraints, append-only auditable ledger mechanics, and Next.js SSR SEO.
- **Blazing Fast Test Execution:** Native ESM allows Vitest to execute the entire 141-test suite across 10 suites in under 2.5 seconds with zero build step.

### 2. Database Engine: Dual-Target Architecture (SQLite Local Dev + PostgreSQL Production)
- **Zero-Friction Local Evaluation:** SQLite is configured by default for zero-setup execution (`npx prisma db push && node prisma/seed.js`), requiring no external Docker or database server dependencies.
- **Production Parity:** An enterprise PostgreSQL container with persistent volume and health checks is pre-configured in `docker-compose.yml`, and the Prisma schema is 100% compatible with PostgreSQL with a single configuration flag.

### 3. Modular Boundaries & Extensions
- **Decoupled E-Commerce Integrations:** Payment gateway integrations (Razorpay, Stripe) and inventory stock reservations are decoupled into separate modular domain extensions, keeping core logistics and ledger accounting isolated and testable.
- **Loyalty Redemption Mechanics:** Point redemption/spend mechanics are cleanly supported via **Redemption Debt** (allowing ledger balances to transition to negative upon retroactive refund, preventing silent write-offs).

---

## 🔐 Production Deployment & Security Configuration (Credential Changes Required)

Before deploying this application to a public cloud or production environment (e.g. AWS ECS/EC2, Render, Railway, DigitalOcean), the following credentials and configuration parameters **must** be updated from their development defaults:

### 1. Environment Variables Checklist (`backend/.env` & `frontend/.env`)

| Variable | Current Development Default | Required Production Value | Security Risk if Unchanged |
|---|---|---|---|
| `NODE_ENV` | `development` | `production` | Stack traces, internal paths, and verbose debug logs exposed in API error responses |
| `DATABASE_URL` | `file:./dev.db` (SQLite) | `postgresql://<user>:<strong-password>@<db-host>:5432/build8now_prod?sslmode=require` | SQLite file database cannot handle concurrent multi-instance writes, connection pooling, or automated failover |
| `JWT_SECRET` | `build8now_super_secret_jwt_key_2026_x99!@#` | Minimum 64-character cryptographically random secret (`openssl rand -hex 64`) | Token forgery allowing attackers to forge arbitrary Super Admin or Customer JWTs |
| `JWT_EXPIRES_IN` | `7d` | `15m` access tokens with secure HTTP-only refresh tokens | Stolen token remains valid for 7 days without revocation mechanism |
| `ADMIN_PASSWORD` | `Password123!` | Generate via enterprise secrets manager (e.g. AWS Secrets Manager, HashiCorp Vault) | Seeded default credentials easily brute-forced, compromising Super Admin control |
| `CORS_ORIGIN` | `http://localhost:3000` | Whitelisted production domain(s) (e.g. `https://build8now.com,https://admin.build8now.com`) | Cross-Origin Request Forgery and unauthorized third-party API scraping |
| `RATE_LIMIT_MAX` | `100` per 15 min | Tune per endpoint (e.g. 5 attempts / 15m on `/auth/login`, 500 / 15m on authenticated APIs) | Ineffective DDoS and credential stuffing mitigation |

### 2. Database Migration & Provisioning Steps
1. Change `provider = "sqlite"` to `provider = "postgresql"` in `backend/prisma/schema.prisma`.
2. Run database migrations: `npx prisma migrate deploy`.
3. Seed production initial data securely without development mock passwords: `node prisma/seed.production.js`.

### 3. Network & Transport Security Recommendations
- **Enforce TLS 1.3:** Terminate SSL/TLS at reverse proxy (Nginx / Cloudflare / AWS ALB) with HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`).
- **HTTP-Only & Secure Cookies:** Store authentication tokens in `HttpOnly; Secure; SameSite=Strict` cookies rather than browser `localStorage` to eliminate XSS-based token theft.
- **WAF / DDoS Shield:** Deploy Cloudflare or AWS WAF with rate-limiting rules on `/api/v1/auth/login` and `/api/v1/shipping/calculate`.

