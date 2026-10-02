import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  metadataBase: new URL('https://build8now.com'),
  title: {
    default: 'Build8Now | Construction Material Procurement & Supply',
    template: '%s | Build8Now',
  },
  description:
    'Build8Now is India’s premier construction material procurement platform for Builders, Contractors, and Architects. Order Cement, Steel, Tiles & Electricals directly.',
  keywords: [
    'Construction materials',
    'UltraTech Cement 50kg',
    'TMT Rebar',
    'Tiles',
    'Architect loyalty rewards',
    'Building supplies India',
  ],
  authors: [{ name: 'Build8Now Engineering' }],
  creator: 'Build8Now',
  publisher: 'Build8Now Inc.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://build8now.com',
    siteName: 'Build8Now',
    title: 'Build8Now | Construction Material Procurement & Supply',
    description:
      'Order bulk construction materials with dynamic freight calculations and architect loyalty rewards.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Build8Now Construction Procurement Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build8Now | Construction Material Procurement & Supply',
    description: 'Procure cement, steel, and building supplies with automated freight calculations.',
    creator: '@build8now',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="canonical" href="https://build8now.com" />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-[#0a0e17] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Dynamic Global Navbar with active User Badge */}
        <Navbar />

        <main className="flex-1 bg-[#0a0e17]">{children}</main>

        {/* Dynamic Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
