'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function Footer() {
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem('build8now_user');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    checkUser();

    window.addEventListener('storage', checkUser);
    window.addEventListener('build8now_auth_change', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('build8now_auth_change', checkUser);
    };
  }, []);

  const isAuthRoute = pathname === '/' || pathname === '/login' || pathname === '/auth';

  // Hide footer on unauthenticated login/register screens
  if (isAuthRoute && !currentUser) {
    return null;
  }

  return (
    <footer className="bg-[#070a10] text-slate-400 text-xs py-10 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <p className="font-bold text-slate-200 flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="w-4 h-4 text-orange-500" />
            Build8Now Material Procurement & Logistics Ltd.
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            B2B Procurement for Architects, Contractors & Builders · Enterprise Dynamic Logistics
          </p>
        </div>
        <div className="flex items-center space-x-6 font-mono text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            API Connected
          </span>
          <span>ISO 9001 / IS 1489 Certified</span>
          <span>Secure JWT / RBAC</span>
        </div>
      </div>
    </footer>
  );
}
