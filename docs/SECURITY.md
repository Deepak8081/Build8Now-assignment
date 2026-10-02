# Security & Threat Defense Model (Task 6)

This document outlines the security architecture, authentication protocols, role-based and object-level authorization policies, and OWASP Top 10 mitigation strategies implemented across the Build8Now service.

---

## 1. Authentication & Session Security

- **Password Hashing:** All user passwords are salted and hashed using `bcrypt` with 10 salt rounds (adaptive cost factor). Plaintext passwords are never logged or stored.
- **JWT Lifecycles & Secrets:**
  - Standard JSON Web Tokens (JWT) signed using HMAC-SHA256 with an environment-configured secret (`JWT_SECRET`).
  - Tokens carry an explicit expiration (`7d` standard, configurable).
  - Sensitive user data (password hashes, credit card details) are strictly excluded from JWT claims and API response payloads.

---

## 2. Authorization Model (RBAC + ABAC)

### 2.1 Role-Based Access Control (RBAC)
Three distinct system roles are strictly enforced via `authorizeRoles(...)` middleware:
1. **`ADMIN`:** Full read/write access to manage shipping profiles, create loyalty rules, view all users, and override system states.
2. **`CUSTOMER`:** Standard procurement account. Can create orders, link referral codes, and view their own order history.
3. **`INFLUENCER`:** Architect, Contractor, Interior Designer, or Builder account. Can access their referral code, points balance, and append-only loyalty ledger.

### 2.2 Object-Level Access Control (ABAC / IDOR Defense)
- Parameter tampering (e.g. User A requesting `GET /api/v1/orders/ORD-USER-B` or `GET /api/v1/loyalty/ledger/INF-OTHER`) is prevented by explicit ownership guards (`enforceObjectOwnership`).
- Customers can **only** query orders belonging to their verified `customerId`.
- Influencers can **only** query ledger transactions belonging to their verified `influencerId`.
- Accessing another user's record immediately returns `403 Forbidden`.

---

## 3. OWASP Top 10 Defenses & Network Protection

| Vulnerability | Mitigation Strategy |
|---|---|
| **SQL Injection (SQLi)** | 100% Parameterized queries via Prisma ORM. No raw concatenated SQL queries. |
| **Cross-Site Scripting (XSS)** | Helmet HTTP security headers enabled (`X-XSS-Protection`, `Content-Security-Policy`, `X-Content-Type-Options: nosniff`). |
| **Denial of Service (DoS / Brute Force)** | IP-based rate limiting via `express-rate-limit` (100 requests per 15-minute window). |
| **Cross-Origin Resource Sharing (CORS)** | Strict whitelist origin validation for allowed frontends (`http://localhost:3000`). |
| **Input Validation / Payload Tampering** | Strict schema validation on all endpoints using **Zod**. Extra or malformed payload fields are rejected with `422 Unprocessable Entity`. |
| **Sensitive Data Leakage** | Global exception handler sanitizes error responses in production, stripping stack traces and database internal metadata. |
