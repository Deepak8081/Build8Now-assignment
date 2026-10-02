# Build8Now Platform — Client Video Walkthrough Scripts & Submission Guide

This document provides exact, timestamped voiceover scripts tailored to your screen recordings, along with a professional client submission email template.

---

## 🎬 SCRIPT A: Full 5-Minute Video Walkthrough
**Target Video:** `Screen Recording 2026-10-02 171045.mp4`  
**Duration:** ~04:57  
**Pacing:** Confident, professional, senior engineering presentation

| Timestamp | On-Screen Action | Professional Voiceover Script (What to Speak) |
|---|---|---|
| **0:00 - 0:45** | **Home / Login Screen (`http://localhost:3000`)**<br>• Show centered Obsidian Glassmorphism login portal.<br>• Highlight 1-Click Role Shortcuts (`Super Admin`, `Ar. Rahul`, `Vikram Contractor`, `Priya Sharma`). | *"Hello Build8Now team! Today I am presenting our production-grade construction material procurement, dynamic logistics, and partner loyalty platform. The system is built with a high-throughput Node.js backend using Prisma ORM, coupled with a Next.js 14 Server-Side Rendered frontend engineered for sub-second performance and technical SEO. To begin our walkthrough, let's log in as the Super Admin using our 1-click test credential shortcut."* |
| **0:45 - 1:45** | **Super Admin: Dynamic Logistics Engine**<br>• Click **Super Admin** $\rightarrow$ **Sign In**.<br>• View **Shipping Profiles (10)** tab.<br>• Show multi-criteria rules (Weight Slabs, Distance rates, Volumetric dimensions $(L \times W \times H)/5000$).<br>• Demonstrate **Activate / Deactivate Toggle** on profiles.<br>• Click **Edit** to display the centered modal overlay. | *"First, let's look at the Dynamic Logistics Engine. Shipping profiles in Build8Now are 100% data-driven and support multi-criteria evaluation—including actual weight slabs, per-km distance rates, volumetric weight $(L \times W \times H)/5000$, and surface area. Administrators have full bi-directional control to create, edit, activate, or deactivate profiles in real time. Rules are combined dynamically using configurable strategies like SUM, MAX, or Tiered slabs, clamped safely within min-charge and max-cap boundaries."* |
| **1:45 - 2:45** | **Loyalty Rules & Precedence Engine**<br>• Switch to **Loyalty Rules (6)** tab.<br>• Point out 3-Tier Precedence rules (`Priority 30: PRODUCT 8%`, `Priority 20: CATEGORY 5%`, `Priority 10: CART_VALUE 2%`).<br>• Demonstrate the **Activate / Deactivate Toggle** on loyalty rules. | *"Next is our Influencer & Partner Loyalty System. We support 4 partner tiers—Architects, Contractors, Designers, and Builders. Points calculation follows a strict 3-tier precedence hierarchy where product-specific rules override category rules, which in turn override general cart-value promotions. Every accrual is protected by database-level idempotency locks, guaranteeing zero duplicate points from repeated webhook triggers or network retries."* |
| **2:45 - 3:35** | **Orders Lifecycle & Proportional Refund Reversals**<br>• Switch to **Orders & Refunds (9)** tab.<br>• Show active customer orders with dynamic totals.<br>• Select an order and trigger a proportional refund of ₹1,900.<br>• Show the success notification with proportional points deducted. | *"Now let's examine Order Lifecycle and Refund Reversals. When an order is placed, points accrue immediately to the attributed partner. If an order is later partially or fully refunded, our engine mathematically calculates the exact refund proportion and writes an immutable reversal entry into our append-only ledger. If points were already spent, the engine safely tracks Redemption Debt with negative balances."* |
| **3:35 - 4:15** | **Customer Hub & Live Multi-Criteria Freight Calculator**<br>• Sign out $\rightarrow$ Log in as **Priya Sharma (Customer)**.<br>• Scroll to **Dynamic Multi-Criteria Freight Calculator**.<br>• Enter Dimensions: Unit Wt: 0kg, 600x40x15cm, Distance: 50km, Qty: 100.<br>• Click **Calc** $\rightarrow$ Show the **Formula Breakdown** and **Max Cap Indicator** (Capped at ₹5,000 from ₹14,800 subtotal). | *"Logging in as a Customer, we see the Customer Material Procurement Hub and Live Freight Calculator. When customers input custom dimensions and delivery distances, the backend evaluates all composite rules in real time. As seen here, for 100 units of bulky material, the volumetric weight is derived as 7,200 kg. The calculated subtotal of ₹14,800 is safely clamped by the profile's ₹5,000 maximum cap, giving customers complete transparency with a live formula breakdown."* |
| **4:15 - 4:40** | **Technical SEO & Next.js Server-Side Rendering (SSR)**<br>• Click **Product Catalog** in Navbar $\rightarrow$ Navigate to `/products/ultratech-super-cement-50kg`.<br>• Right-click $\rightarrow$ **View Page Source**.<br>• Highlight `<script type="application/ld+json">` with Schema.org `Product`, `Offer` (INR), and `BreadcrumbList`. | *"For technical SEO, all product pages are rendered server-side with Next.js SSR. In the page source, we serve complete Schema.org structured data for Product, Offer with INR pricing, and BreadcrumbList for rich Google snippets. We also provide dynamic OpenGraph meta tags, canonical URLs, robots.txt, dynamic sitemap.xml, and automated 301 redirects for legacy URLs."* |
| **4:40 - 4:57** | **Automated Test Suite & Wrap Up**<br>• Switch to Terminal $\rightarrow$ Show `npm test` passing 141 tests.<br>• Show Swagger OpenAPI docs at `http://localhost:5000/api-docs`. | *"Finally, our comprehensive backend test suite covers 141 automated Vitest tests across all 6 core domains—passing 100% in under 12 seconds. Live interactive Swagger API documentation is available with all 22 paths and 31 operations. Thank you for your time, and I look forward to your feedback!"* |

---

## ⚡ SCRIPT B: Fast 2-Minute Video Walkthrough
**Target Video:** `Screen Recording 2026-10-02 172122.mp4`  
**Duration:** ~01:55  
**Pacing:** Crisp, fast-paced, high-impact demo

| Timestamp | On-Screen Action | Professional Voiceover Script (What to Speak) |
|---|---|---|
| **0:00 - 0:25** | **Login & Super Admin Dashboard**<br>• Open `http://localhost:3000` $\rightarrow$ Click **Super Admin** $\rightarrow$ **Sign In**.<br>• Show Admin Console tabs. | *"Hello Build8Now team! Here is a quick demonstration of our full-stack construction procurement, logistics, and loyalty platform built with Node.js, Prisma ORM, and Next.js 14 SSR. Let's log in to the Super Admin Console to review the core subsystems."* |
| **0:25 - 0:55** | **Dynamic Logistics & Bi-Directional Controls**<br>• View **Shipping Profiles** and **Freight Calculator**.<br>• Show formula breakdown, weight slabs, volumetric metrics, and the **Activate/Deactivate** toggle. | *"Our Dynamic Freight Engine evaluates multi-criteria logistics in real time—factoring in actual weight, distance, and volumetric dimensions $(L \times W \times H)/5000$. Administrators can toggle profile states between Active and Deactivated instantly, configure combination strategies like SUM and MAX, and enforce min/max bounds with live rule breakdown transparency."* |
| **0:55 - 1:25** | **Loyalty Rules Precedence & Proportional Refunds**<br>• Switch to **Loyalty Rules** $\rightarrow$ Show Product 8% > Category 5% > Cart 2% priority.<br>• Switch to **Orders & Refunds** $\rightarrow$ Show partial refund points reversal. | *"The Partner Loyalty System features a 3-tier precedence engine where product rules take precedence over category and cart promotions. All accruals are protected by DB-level idempotency, and partial refunds automatically trigger mathematically proportional point reversals recorded in an append-only audit ledger."* |
| **1:25 - 1:55** | **Technical SEO, Swagger Docs & Test Suite**<br>• Show `/products/ultratech-super-cement-50kg` with Schema.org JSON-LD structured data.<br>• Show Terminal with 141 passing Vitest tests and Swagger UI. | *"For SEO, our Next.js SSR product pages deliver complete Schema.org JSON-LD structured data, dynamic OpenGraph tags, and canonical URLs for rich Google search snippets. In the backend, all 141 automated tests pass 100%, and our full OpenAPI documentation is live. Thank you!"* |

---

## 📨 Client Submission Email / Message Template

Aap client ko project handover karte waqt yeh professional client message use kar sakte hain:

```markdown
Hi Team,

I have completed the core platform architecture and features for Build8Now. The deliverables include the complete modular backend, interactive logistics & loyalty engines, technical SEO SSR storefront, comprehensive OpenAPI documentation, automated test suites, and an end-to-end video walkthrough.

📦 Repository & Architecture:
• GitHub: https://github.com/Deepak8081/build8now-platform (or your updated repo URL)
• Architecture & Schemas: Fully documented in README.md with system ERD, security disclosures, and deployment checklist.
• OpenAPI Specification: Complete 22 paths / 31 endpoints specification available at /api-docs and /api-docs.json.

🎯 Key Subsystems & Deliverables:
1. Dynamic Freight Logistics Engine: Real-time multi-criteria calculations (Unit/Total Weight, Distance Slabs, Volumetric L*W*H/5000, Surface Area) with SUM/MAX/Tiered combination strategies, admin toggle controls, and boundary limits.
2. 3-Tier Influencer Loyalty & Ledger: Precedence rule engine (Product > Category > Cart), DB-level idempotency locks against duplicate webhooks, and proportional points reversal for partial refunds with append-only immutable auditing.
3. Technical SEO & SSR Storefront: Next.js 14 Server-Side Rendering, Schema.org JSON-LD structured data (Product, Offer with INR pricing, BreadcrumbList), dynamic OpenGraph meta tags, canonical tags, automated 301 redirects, robots.txt, and sitemap.xml.
4. Robust Quality Assurance: 141 automated Vitest unit/integration/E2E tests passing 100% across all 6 core business domains.

🎥 Video Walkthrough:
A comprehensive walkthrough video demonstrating all features, live calculations, admin controls, and test execution is attached for your review.

Please review the repository and video at your convenience, and let me know if you'd like to schedule a quick walkthrough call or discuss the next rollout steps!

Best regards,
Deepak
Senior Full Stack Engineer
```
