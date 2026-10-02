# Build8Now Screening - Follow-Up Interview Cheat Sheet
*(Hinglish + English Quick Answers for Live Interview)*

Use this guide to confidently explain any technical decision or code module during your interview with Build8Now!

---

### ❓ Question 1: "Explain your project architecture and folder structure."
**Your Answer:**
> "Maine **Modular Monolith architecture** use kiya hai. Har domain ka apna isolated module hai (`auth`, `shipping`, `loyalty`, `influencers`, `orders`, `products`). Har module me:
> - `schema.js` (Zod runtime request validation DTOs)
> - `service.js` (Core business logic & DB transactions)
> - `controller.js` (HTTP request/response handling)
> - `routes.js` (Express endpoints with RBAC & Auth middlewares)
> Saath me `common/` folder me centralized error classes, pure functional helpers, aur middlewares hain. Yeh structure future me microservices me convert karna bohot aasan banata hai."

---

### ❓ Question 2: "How does your Dynamic Shipping Engine handle multi-criteria rules and derived dimensions?"
**Your Answer:**
> "Shipping calculation hard-coded nahi hai, balki 100% **data-driven** hai.
> 1. Pehle hum physical inputs se derived metrics calculate karte hain:
>    - **Volumetric Weight:** $(Length \times Width \times Height) / 5000$ (freight divisor).
>    - **Billable Weight:** $\max(ActualWeight, VolumetricWeight)$.
>    - **Surface Area:** $(Length \times Width) / 10,000$ ($m^2$).
> 2. Fir profile ke active rules (`WEIGHT_SLAB`, `PER_KM_DISTANCE`, `VOLUMETRIC`, `AREA_SURFACE`, `BASE_PRICE_PERCENTAGE`, `FIXED_FEE`) evaluate hote hain.
> 3. Profile ki **Combination Strategy** (`SUM`, `MAX`, ya `TIERED_SLAB`) ke according cost calculate hoti hai.
> 4. Last me `minCharge` aur `maxCharge` bounds se clamp karke exact 2-decimal currency value return hoti hai."

---

### ❓ Question 3: "How do you guarantee Idempotency on orders so loyalty points are never awarded twice?"
**Your Answer:**
> "Humne **Database-Level Guarantee** di hai, sirf code level check nahi:
> 1. `LoyaltyLedger` table me `idempotencyKey` pe `UNIQUE` constraint hai aur composite unique key `(orderId, eventType, idempotencyKey)` hai.
> 2. Jab koi webhook replay hota hai ya double click hota hai, database check karta hai. Agar key pehle se exist karti hai, to transaction execute hone se pehle hi idempotent cached response return kar deta hai.
> 3. Isse race conditions aur concurrent network retries me bhi double points credit hona 100% mathematically impossible hai."

---

### ❓ Question 4: "How do partial refunds and cancellations reverse points without corrupting the balance?"
**Your Answer:**
> "Hum **Append-Only Ledger (Double-Entry Accounting)** follow karte hain:
> 1. Purani transaction ko kabhi delete ya update (overwrite) nahi karte.
> 2. Full cancellation par 100% points reverse hote hain (`ORDER_CANCEL_REVERSAL`).
> 3. Partial refund par proportional reversal calculate hota hai:  
>    $$\text{Points To Deduct} = \left(\frac{\text{Refund Amount}}{\text{Order Subtotal}}\right) \times \text{Original Points}$$
> 4. Ledger me negative debit entry banti hai (`pointsChange < 0`) aur ek naya `runningBalance` snapshot record hota hai.
> 5. **Already Redeemed Scenario:** Agar influencer ne pehle hi points spend kar liye the, to balance legitimately negative ho jata hai (Redemption Debt), jise future orders automatically offset kar dete hain."

---

### ❓ Question 5: "How did you prevent IDOR and unauthorized access between roles?"
**Your Answer:**
> "Humne **RBAC (Role-Based)** aur **ABAC (Object-Level Ownership)** dono lagaye hain:
> - **RBAC:** `authorizeRoles('ADMIN')` sirf Admin ko shipping profiles aur loyalty rules create/update karne deta hai.
> - **ABAC:** `enforceObjectOwnership(req, req.params.id)` check karta hai ki Customer sirf apni verified `customerId` ka order dekh sake, aur Influencer sirf apni `influencerId` ka ledger dekh sake. Agar koi URL me doosre user ki ID pass karega, to seedhe `403 Forbidden` return hota hai."

---

### ❓ Question 6: "What Technical SEO optimizations did you implement in Next.js?"
**Your Answer:**
> "Task 5 ke sample product page par:
> 1. **SSR / Dynamic Metadata:** `generateMetadata` dynamically unique title, meta description, aur canonical URL inject karta hai.
> 2. **Schema.org Structured Data (JSON-LD):** `Product`, `Offer` (with price ₹380, INR, InStock), `BreadcrumbList`, aur `AggregateRating` schemas `<script type='application/ld+json'>` me inject kiye hain.
> 3. **Open Graph & Twitter Cards:** WhatsApp/LinkedIn/Twitter sharing ke liye image preview tags.
> 4. **Robots & Sitemap:** Dynamic `robots.ts` aur `sitemap.ts`.
> 5. **301 Permanent Redirects:** `next.config.mjs` me legacy URLs ko new slug pe redirect kiya hai to preserve PageRank.
> 6. **Core Web Vitals:** Next.js `<Image priority sizes='...' />` use kiya hai for instant LCP under 1.2s and 0 CLS."
