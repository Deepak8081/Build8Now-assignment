# 3-5 Minute Screen Recording Walkthrough Script

Use this exact step-by-step guide to record your 3-5 minute screening walkthrough video for Build8Now.

---

### 🎬 Video Outline & Timestamps

| Timestamp | Screen Action | What to Speak (Voiceover Script) |
|---|---|---|
| **0:00 - 0:30** | Open Terminal & VS Code showing project folder structure (`backend/` & `frontend/`) | *"Hello Build8Now team! Today I am presenting my technical screening assignment for Full Stack and Technical SEO. The project is built using a clean Modular Monolith architecture in Node.js (Express), PostgreSQL with Prisma ORM, and Next.js 14 App Router for Technical SEO."* |
| **0:30 - 1:15** | Open Browser at `http://localhost:3000/demo` $\rightarrow$ **Tab 1: Shipping Calculator** | *"First, let's look at Task 1: The Dynamic Shipping Engine. In this tab, our shipping rules are completely data-driven. When I input 75kg weight, 60x40x20cm dimensions, and 25km distance, the engine computes the derived volumetric weight $(L \times W \times H)/5000$, evaluates the weight slabs and per-km distance rules, applies our combination strategy, and clamps within min/max bounds. Here is the exact calculation breakdown and final charge."* |
| **1:15 - 2:00** | Click **Tab 2: Loyalty Precedence & Idempotency** | *"Now for Task 2: Influencer Loyalty. We support 3-tier rule precedence: Product rules override Category rules, which override Cart defaults. When I select UltraTech Cement, it applies the 8% product rule. Now watch what happens when I click 'Process Order Webhook' twice with the same idempotency key — the second call detects duplicate replay and prevents duplicate points at the database level."* |
| **2:00 - 2:40** | Click **Simulate 50% Refund** on Tab 2 | *"Next, when an order is partially refunded by 50%, our system appends a proportionate debit entry in the immutable ledger, reducing points accordingly while keeping an unbroken financial audit trail."* |
| **2:40 - 3:20** | Navigate to `http://localhost:3000/products/ultratech-super-cement-50kg` | *"Moving to Task 5: Technical SEO. On this sample product page, we have a clean slug URL, dynamic metadata, canonical tags, and OpenGraph cards. If we inspect the page source, we see 100% valid Schema.org JSON-LD for Product, Offer with ₹380 price, and BreadcrumbList. Images use priority loading for optimal Core Web Vitals."* |
| **3:20 - 4:00** | Switch to Terminal and run `npm test` in `backend/` | *"Finally, in the backend terminal, I'll run `npm test`. All 20 automated tests across shipping calculations, loyalty precedence, idempotency, refund reversals, auth RBAC, and Zod validation pass cleanly. Thank you for reviewing my submission!"* |

---

### 💡 Quick Tips for Recording
1. Start both servers before recording:
   - Backend: `npm run dev` in `backend/` (Port 5000)
   - Frontend: `npm run dev` in `frontend/` (Port 3000)
2. Use OBS Studio, Loom, or Windows Game Bar (`Win + G`) to record your screen and microphone.
3. Upload the recording to Loom, Google Drive, or YouTube (unlisted) and paste the link in your README.md.
