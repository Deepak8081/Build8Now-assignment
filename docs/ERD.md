# Build8Now Database Architecture & ER Diagram

This document details the PostgreSQL / SQLite database design, schema relationships, foreign key constraints, justified indexes, and idempotency guarantees for Build8Now.

---

## 1. Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o| CUSTOMER : "has profile"
    USER ||--o| INFLUENCER : "has profile"
    
    INFLUENCER ||--o{ CUSTOMER : "referred (attribution)"
    INFLUENCER ||--o{ REFERRAL : "recorded referrals"
    CUSTOMER ||--o{ REFERRAL : "linked"
    
    SHIPPING_PROFILE ||--|{ SHIPPING_RULE : "contains rules"
    SHIPPING_PROFILE ||--o{ PRODUCT : "assigned to"
    
    CUSTOMER ||--o{ ORDER : "places"
    INFLUENCER ||--o{ ORDER : "attributed to"
    ORDER ||--|{ ORDER_ITEM : "contains items"
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"
    
    INFLUENCER ||--o{ LOYALTY_LEDGER : "earns/debits"
    ORDER ||--o{ LOYALTY_LEDGER : "triggers"

    USER {
        string id PK
        string email UK "Indexed"
        string passwordHash
        string name
        string role "ADMIN | CUSTOMER | INFLUENCER"
        datetime createdAt
        datetime updatedAt
    }

    CUSTOMER {
        string id PK
        string userId FK "Unique"
        string phone
        string address
        string referredById FK "Influencer attribution"
        datetime createdAt
    }

    INFLUENCER {
        string id PK
        string userId FK "Unique"
        string type "ARCHITECT | CONTRACTOR | INTERIOR_DESIGNER | BUILDER"
        string referralCode UK "Indexed"
        float pointsBalance "Running points"
        float lifetimePoints "Cumulative points"
        boolean isActive
        datetime createdAt
    }

    REFERRAL {
        string id PK
        string influencerId FK
        string customerId FK
        datetime createdAt
    }

    SHIPPING_PROFILE {
        string id PK
        string name UK "Indexed"
        string combinationStrategy "SUM | MAX | TIERED_SLAB"
        float minCharge
        float maxCharge
        boolean isActive
        datetime createdAt
    }

    SHIPPING_RULE {
        string id PK
        string shippingProfileId FK "Indexed"
        string ruleType "WEIGHT_SLAB | PER_KM_DISTANCE | VOLUMETRIC | AREA_SURFACE | BASE_PRICE_PERCENTAGE | FIXED_FEE"
        float minUnit
        float maxUnit
        float baseRate
        float perUnitRate
        int priority
        boolean isActive
    }

    PRODUCT {
        string id PK
        string name
        string slug UK "Indexed"
        string sku UK "Indexed"
        string category "Indexed"
        float price
        float weightKg
        float lengthCm
        float widthCm
        float heightCm
        string shippingProfileId FK "Indexed"
        boolean isActive
    }

    LOYALTY_RULE {
        string id PK
        string name
        string ruleTarget "PRODUCT | CATEGORY | CART_VALUE"
        string targetValue "Product ID, Category name, or Cart min"
        string pointType "PERCENTAGE | FIXED_POINTS"
        float pointValue
        float minOrderValue
        float maxPointsCap
        int priority "Higher wins (30 > 20 > 10)"
        boolean isActive
    }

    ORDER {
        string id PK
        string orderNumber UK "Indexed"
        string customerId FK "Indexed"
        string influencerId FK "Indexed"
        string status "PENDING | COMPLETED | CANCELLED | REFUNDED | PARTIALLY_REFUNDED"
        float subtotal
        float shippingCost
        float totalAmount
        string currency
        float refundedAmount
        datetime createdAt
    }

    ORDER_ITEM {
        string id PK
        string orderId FK "Indexed"
        string productId FK "Indexed"
        int quantity
        float unitPrice
        float subtotal
        float weightKg
        float lengthCm
        float widthCm
        float heightCm
    }

    LOYALTY_LEDGER {
        string id PK
        string influencerId FK "Indexed"
        string orderId FK "Indexed"
        string eventType "ORDER_ACCRUAL | ORDER_CANCEL_REVERSAL | ORDER_REFUND_REVERSAL | REDEMPTION"
        float pointsChange "Positive (+) credit, Negative (-) debit"
        float runningBalance "Audit snapshot"
        string idempotencyKey UK "Unique DB Constraint"
        string reason
        string metadataJson
        datetime createdAt
    }
```

---

## 2. Key Constraints & Idempotency Design

1. **Unique Idempotency Constraint:**
   - Table `LoyaltyLedger` enforces a `UNIQUE` constraint on `idempotencyKey` and composite key `(orderId, eventType, idempotencyKey)`.
   - Any duplicate webhook or network replay immediately triggers an idempotent return or database unique-key rejection, guaranteeing that double points are mathematically impossible to award.

2. **Append-Only Immutable Ledger:**
   - Records in `LoyaltyLedger` are never updated or deleted.
   - Refunds and cancellations insert a negative debit entry (`pointsChange < 0`), preserving an unbroken financial audit trail.

3. **Justified Indexes:**
   - `User.email`: Fast O(1) login lookup.
   - `Product.slug`: Instant SEO URL matching on SSR product routes.
   - `Product.category`: Fast category filtering.
   - `Order.customerId` & `Order.influencerId`: Instant order history lookups.
   - `LoyaltyLedger(influencerId, createdAt)`: High-performance cursor pagination for transaction histories.
