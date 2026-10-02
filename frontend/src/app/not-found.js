import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | Build8Now',
  description: 'The requested construction material or page could not be located.',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">404 - Not Found</h1>
        <p className="text-sm text-slate-600 mb-6">
          The requested page or product does not exist or has been relocated with an SEO 301 redirect.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
