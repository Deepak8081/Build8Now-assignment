import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting Build8Now database seeding...');

  // 1. Clear existing data in correct relational order
  await prisma.loyaltyLedger.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.loyaltyRule.deleteMany({});
  await prisma.shippingRule.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.shippingProfile.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.influencer.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

  // 2. Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@build8now.com',
      passwordHash: defaultPasswordHash,
      name: 'Build8Now Super Admin',
      role: 'ADMIN',
    },
  });
  console.log('[Seed] Admin user created: admin@build8now.com');

  // 3. Create Influencers of 4 types
  const architectUser = await prisma.user.create({
    data: {
      email: 'ar.rahul@build8now.com',
      passwordHash: defaultPasswordHash,
      name: 'Ar. Rahul Verma',
      role: 'INFLUENCER',
    },
  });
  const architect = await prisma.influencer.create({
    data: {
      userId: architectUser.id,
      type: 'ARCHITECT',
      referralCode: 'INF-RAHUL-ARCH',
      pointsBalance: 500.0,
      lifetimePoints: 1200.0,
    },
  });

  const architectUser2 = await prisma.user.create({
    data: {
      email: 'rahul.architect@build8now.com',
      passwordHash: defaultPasswordHash,
      name: 'Rahul Verma Architect',
      role: 'INFLUENCER',
    },
  });
  await prisma.influencer.create({
    data: {
      userId: architectUser2.id,
      type: 'ARCHITECT',
      referralCode: 'INF-RAHUL-MAIN',
      pointsBalance: 750.0,
      lifetimePoints: 1500.0,
    },
  });

  const contractorUser = await prisma.user.create({
    data: {
      email: 'contractor.vikram@build8now.com',
      passwordHash: defaultPasswordHash,
      name: 'Vikram Singh (Contractor)',
      role: 'INFLUENCER',
    },
  });
  const contractor = await prisma.influencer.create({
    data: {
      userId: contractorUser.id,
      type: 'CONTRACTOR',
      referralCode: 'INF-VIKRAM-CONT',
      pointsBalance: 250.0,
      lifetimePoints: 600.0,
    },
  });

  const designerUser = await prisma.user.create({
    data: {
      email: 'designer.priya@build8now.com',
      passwordHash: defaultPasswordHash,
      name: 'Priya Mehta (Interior Designer)',
      role: 'INFLUENCER',
    },
  });
  const designer = await prisma.influencer.create({
    data: {
      userId: designerUser.id,
      type: 'INTERIOR_DESIGNER',
      referralCode: 'INF-PRIYA-INT',
      pointsBalance: 150.0,
      lifetimePoints: 300.0,
    },
  });

  const builderUser = await prisma.user.create({
    data: {
      email: 'builder.sharma@build8now.com',
      passwordHash: defaultPasswordHash,
      name: 'Sharma Infra Builders',
      role: 'INFLUENCER',
    },
  });
  const builder = await prisma.influencer.create({
    data: {
      userId: builderUser.id,
      type: 'BUILDER',
      referralCode: 'INF-SHARMA-BLD',
      pointsBalance: 1000.0,
      lifetimePoints: 3500.0,
    },
  });
  console.log('[Seed] Influencers created (Architect, Contractor, Interior Designer, Builder)');

  // 4. Create Customers
  const customerUser1 = await prisma.user.create({
    data: {
      email: 'amit.kumar@gmail.com',
      passwordHash: defaultPasswordHash,
      name: 'Amit Kumar',
      role: 'CUSTOMER',
    },
  });
  const customer1 = await prisma.customer.create({
    data: {
      userId: customerUser1.id,
      phone: '+91 9876543210',
      address: 'Plot 42, Sector 18, Noida, UP - 201301',
      referredById: architect.id,
    },
  });
  await prisma.referral.create({
    data: {
      influencerId: architect.id,
      customerId: customer1.id,
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'neha.singh@gmail.com',
      passwordHash: defaultPasswordHash,
      name: 'Neha Singh',
      role: 'CUSTOMER',
    },
  });
  const customer2 = await prisma.customer.create({
    data: {
      userId: customerUser2.id,
      phone: '+91 9811223344',
      address: 'Flat 304, Green Heights, Whitefield, Bangalore - 560066',
    },
  });

  const customerUser3 = await prisma.user.create({
    data: {
      email: 'priya.sharma@gmail.com',
      passwordHash: defaultPasswordHash,
      name: 'Priya Sharma',
      role: 'CUSTOMER',
    },
  });
  await prisma.customer.create({
    data: {
      userId: customerUser3.id,
      phone: '+91 9822334455',
      address: '12 Banjara Hills, Hyderabad - 500034',
    },
  });
  console.log('[Seed] Customers created (Amit Kumar, Neha Singh, Priya Sharma)');

  // 5. Create Multi-Criteria Shipping Profiles
  const heavyFreightProfile = await prisma.shippingProfile.create({
    data: {
      name: 'Heavy Freight & Bulk Materials',
      description: 'Profile for heavy construction items like Cement, Sand, Aggregates with weight slab and distance charges',
      combinationStrategy: 'SUM',
      minCharge: 200.0,
      maxCharge: 15000.0,
      rules: {
        create: [
          {
            ruleType: 'WEIGHT_SLAB',
            minUnit: 0,
            maxUnit: 49.99,
            baseRate: 150.0,
            perUnitRate: 0.0,
            priority: 10,
          },
          {
            ruleType: 'WEIGHT_SLAB',
            minUnit: 50.0,
            maxUnit: null, // Open upper bound for heavy freight
            baseRate: 150.0,
            perUnitRate: 3.5, // ₹3.5 per kg above 50kg
            priority: 10,
          },
          {
            ruleType: 'PER_KM_DISTANCE',
            minUnit: 5.0,
            maxUnit: null, // Open upper bound
            baseRate: 50.0,
            perUnitRate: 8.0, // ₹8 per km beyond 5km
            priority: 20,
          },
          {
            ruleType: 'FIXED_FEE',
            baseRate: 50.0, // Handling & unloading surcharge
            priority: 5,
          },
        ],
      },
    },
  });

  const parcelProfile = await prisma.shippingProfile.create({
    data: {
      name: 'Standard Volumetric & Parcel Profile',
      description: 'Profile for electrical, plumbing and hardware items based on dimensional volume',
      combinationStrategy: 'SUM',
      minCharge: 100.0,
      maxCharge: 3000.0,
      rules: {
        create: [
          {
            ruleType: 'VOLUMETRIC',
            minUnit: 0,
            maxUnit: null,
            baseRate: 80.0,
            perUnitRate: 15.0,
            priority: 10,
          },
          {
            ruleType: 'PER_KM_DISTANCE',
            minUnit: 0,
            maxUnit: null,
            baseRate: 20.0,
            perUnitRate: 4.0,
            priority: 15,
          },
        ],
      },
    },
  });

  console.log('[Seed] 2 Multi-criteria Shipping Profiles created with rules');

  // 6. Create Construction Products
  const cementProduct = await prisma.product.create({
    data: {
      name: 'UltraTech Super Cement 50kg',
      slug: 'ultratech-super-cement-50kg',
      sku: 'CEM-ULTRA-50KG',
      category: 'Cement',
      price: 380.0,
      weightKg: 50.0,
      lengthCm: 60.0,
      widthCm: 40.0,
      heightCm: 15.0,
      shippingProfileId: heavyFreightProfile.id,
    },
  });

  const rebarProduct = await prisma.product.create({
    data: {
      name: 'Tata Tiscon 500D TMT Rebar 12mm',
      slug: 'tata-tiscon-500d-tmt-rebar-12mm',
      sku: 'STL-TISCON-12MM',
      category: 'Steel',
      price: 650.0,
      weightKg: 10.6,
      lengthCm: 1200.0,
      widthCm: 5.0,
      heightCm: 5.0,
      shippingProfileId: heavyFreightProfile.id,
    },
  });

  const tilesProduct = await prisma.product.create({
    data: {
      name: 'Kajaria Vitrified Floor Tiles 60x60cm (Box of 4)',
      slug: 'kajaria-vitrified-floor-tiles-60x60cm',
      sku: 'TIL-KAJARIA-60X60',
      category: 'Tiles',
      price: 920.0,
      weightKg: 28.0,
      lengthCm: 60.0,
      widthCm: 60.0,
      heightCm: 10.0,
      shippingProfileId: heavyFreightProfile.id,
    },
  });

  const wireProduct = await prisma.product.create({
    data: {
      name: 'Havells LifeLine Plus Copper Wire 2.5 sq mm (90m)',
      slug: 'havells-lifeline-plus-copper-wire-2-5sqmm',
      sku: 'ELE-HAVELLS-2.5MM',
      category: 'Electrical',
      price: 1850.0,
      weightKg: 3.2,
      lengthCm: 25.0,
      widthCm: 25.0,
      heightCm: 10.0,
      shippingProfileId: parcelProfile.id,
    },
  });
  console.log('[Seed] 4 Construction Products created');

  // 7. Create Loyalty Rules with Defined Precedence
  // Tier 1: Product-specific rule (Priority 30)
  await prisma.loyaltyRule.create({
    data: {
      name: 'UltraTech Cement Special Loyalty Promotion',
      ruleTarget: 'PRODUCT',
      targetValue: cementProduct.id,
      pointType: 'PERCENTAGE',
      pointValue: 8.0,
      priority: 30,
      isActive: true,
    },
  });

  // Tier 2: Category-specific rules (Priority 20)
  await prisma.loyaltyRule.create({
    data: {
      name: 'Steel Category Architect Standard Rebate',
      ruleTarget: 'CATEGORY',
      targetValue: 'Steel',
      pointType: 'PERCENTAGE',
      pointValue: 5.0,
      priority: 20,
      isActive: true,
    },
  });

  await prisma.loyaltyRule.create({
    data: {
      name: 'Tiles Category Influencer Reward',
      ruleTarget: 'CATEGORY',
      targetValue: 'Tiles',
      pointType: 'PERCENTAGE',
      pointValue: 4.0,
      priority: 20,
      isActive: true,
    },
  });

  // Tier 3: Cart-level / Bulk Order Reward (Priority 10)
  await prisma.loyaltyRule.create({
    data: {
      name: 'High Value Order Bonus Tier',
      ruleTarget: 'CART_VALUE',
      targetValue: '10000',
      pointType: 'PERCENTAGE',
      pointValue: 2.0,
      minOrderValue: 10000.0,
      maxPointsCap: 2000.0,
      priority: 10,
      isActive: true,
    },
  });

  console.log('[Seed] 4 Loyalty Rules created with precedence (Product > Category > Cart)');
  console.log('[Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed Error] Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
