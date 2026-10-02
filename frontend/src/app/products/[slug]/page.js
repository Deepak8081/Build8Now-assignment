import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FiTruck,
  FiShield,
  FiStar,
  FiCheckCircle,
  FiBox,
  FiLayers,
  FiExternalLink,
  FiArrowRight,
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import { FaAward } from 'react-icons/fa6';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

// Static / Mock product database representing SSR/SSG catalog
const PRODUCTS = {
  'ultratech-super-cement-50kg': {
    id: 'prod-cement-1',
    name: 'UltraTech Super Cement 50kg',
    slug: 'ultratech-super-cement-50kg',
    sku: 'CEM-ULTRA-50KG',
    brand: 'UltraTech Cement',
    category: 'Cement & Concrete',
    price: 380.0,
    mrp: 440.0,
    currency: 'INR',
    availability: 'InStock',
    inStockCount: 450,
    weightKg: 50.0,
    dimensions: { length: 60, width: 40, height: 15, unit: 'cm' },
    description:
      'UltraTech Super is an engineered Pozzolana Portland Cement (PPC) offering high early strength, optimal workability, and superior corrosion resistance. Ideal for load-bearing RCC structures, columns, beams, and slabs.',
    ratingValue: 4.8,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      'High-performance Pozzolana Portland Cement (PPC)',
      'Superior 28-day compressive strength (>53 MPa)',
      'Low heat of hydration preventing thermal cracks',
      'Micro-silica infused for enhanced impermeability',
    ],
    specs: [
      { label: 'Grade / Type', value: 'PPC (IS 1489 Part 1)' },
      { label: 'Standard Bag Weight', value: '50.0 kg ± 0.5 kg' },
      { label: 'Initial Setting Time', value: 'Min 30 minutes' },
      { label: 'Final Setting Time', value: 'Max 600 minutes' },
      { label: '28-Day Compressive Strength', value: '≥ 53.0 MPa (N/mm²)' },
      { label: 'Packaging Material', value: 'Tamper-proof HDPE Woven Sacks' },
    ],
    influencerRewardNote: 'Eligible for 8% Architect / Contractor Loyalty Points on qualifying bulk orders.',
  },
};

/**
 * Dynamic Metadata Generation for Technical SEO (Task 5)
 */
export async function generateMetadata({ params }) {
  const product = PRODUCTS[params.slug];

  if (!product) {
    return {
      title: 'Product Not Found | Build8Now',
      description: 'The requested construction material could not be found.',
    };
  }

  const title = `${product.name} - Buy Online at Best Price | Build8Now`;
  const description = `Buy ${product.name} at ₹${product.price}. High early strength PPC cement for RCC structures. Fast site delivery & Architect loyalty points on Build8Now.`;
  const canonicalUrl = `https://build8now.com/products/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [
      product.name,
      'UltraTech Cement 50kg',
      'PPC Cement price India',
      'Buy cement online',
      'Construction material supplier',
      product.category,
    ],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Build8Now',
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: `${product.name} Bag - Authentic UltraTech PPC Construction Material`,
        },
      ],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.images[0]],
      creator: '@build8now',
    },
  };
}

export default function ProductDetailPage({ params }) {
  const product = PRODUCTS[params.slug];

  if (!product) {
    notFound();
  }

  // 1. Schema.org BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://build8now.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category,
        item: `https://build8now.com/category/${encodeURIComponent(product.category.toLowerCase())}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://build8now.com/products/${product.slug}`,
      },
    ],
  };

  // 2. Schema.org Product & Offer JSON-LD
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    weight: {
      '@type': 'QuantitativeValue',
      value: product.weightKg,
      unitCode: 'KGM',
    },
    offers: {
      '@type': 'Offer',
      url: `https://build8now.com/products/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Build8Now Material Procurement Ltd',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Inject Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Visible Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
          <ol className="flex items-center space-x-2 font-medium">
            <li>
              <Link href="/" className="hover:text-orange-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-slate-600">/</li>
            <li>
              <span className="hover:text-orange-400 transition-colors cursor-pointer">{product.category}</span>
            </li>
            <li className="text-slate-600">/</li>
            <li className="text-white font-semibold truncate" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Hero Grid */}
        <div className="bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-10 grid lg:grid-cols-2 gap-10 backdrop-blur-xl">
          {/* Product Image with Priority LCP */}
          <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
            <Image
              src={product.images[0]}
              alt={`${product.name} - High Strength PPC Cement for Construction`}
              fill
              priority // High priority image loading for Core Web Vitals LCP
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 bg-orange-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
              <FiCheckCircle className="w-3.5 h-3.5" />
              Verified Authentic Material
            </span>
            <span className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-slate-800">
              50kg Bag · PPC Standard
            </span>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                  {product.brand}
                </span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Stock Status */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full text-xs">
                  <FiStar className="w-3.5 h-3.5 fill-amber-400 mr-1 text-amber-400" />
                  <span className="font-bold">{product.ratingValue}</span>
                  <span className="text-slate-400 ml-1">({product.reviewCount} reviews)</span>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <FiCheck className="w-3.5 h-3.5" />
                  In Stock ({product.inStockCount} bags available)
                </span>
              </div>

              {/* Price & Savings */}
              <div className="mt-6 pb-6 border-b border-slate-800 flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="text-base text-slate-500 line-through">
                  ₹{product.mrp.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Save 14%
                </span>
                <span className="text-xs text-slate-400 font-mono">/ bag (incl. GST)</span>
              </div>

              {/* Influencer Loyalty Note */}
              <div className="mt-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                <FaAward className="w-6 h-6 text-orange-400 shrink-0" />
                <p className="text-xs text-orange-200">
                  <strong className="text-white">Partner Reward:</strong> {product.influencerRewardNote}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="mt-6 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Material Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/?notice=protected_route"
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-6 rounded-xl text-center text-xs sm:text-sm transition shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
              >
                <FiTruck className="w-4 h-4" />
                Calculate Dynamic Freight Charges
              </Link>
            </div>
          </div>
        </div>

        {/* Technical Specifications Grid */}
        <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiBox className="w-5 h-5 text-orange-400" />
              Technical & Engineering Specifications
            </h2>
            <span className="text-xs font-mono text-slate-400">IS 1489 PPC Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.specs.map((item, index) => (
              <div key={index} className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] text-slate-400 block">{item.label}</span>
                <span className="text-sm font-bold text-white mt-0.5 block font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
