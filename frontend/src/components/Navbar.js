'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiTruck, FiShield, FiBox, FiUser, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { FaUserShield, FaCompassDrafting, FaHelmetSafety, FaCartShopping } from 'react-icons/fa6';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  // Sync user state on mount and on storage/auth changes
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

    // Listen for custom auth events across pages
    window.addEventListener('storage', checkUser);
    window.addEventListener('build8now_auth_change', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('build8now_auth_change', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('build8now_token');
    localStorage.removeItem('build8now_user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('build8now_auth_change'));
    window.location.href = '/';
  };

  const getRoleIcon = (role, type) => {
    if (role === 'ADMIN') return <FaUserShield className="w-3.5 h-3.5 text-purple-400" />;
    if (role === 'INFLUENCER') {
      if (type === 'CONTRACTOR') return <FaHelmetSafety className="w-3.5 h-3.5 text-amber-400" />;
      return <FaCompassDrafting className="w-3.5 h-3.5 text-blue-400" />;
    }
    return <FaCartShopping className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const getRoleBadgeStyle = (role) => {
    if (role === 'ADMIN') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (role === 'INFLUENCER') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  };

  const isAuthRoute = pathname === '/' || pathname === '/login' || pathname === '/auth';

  // Hide navbar on unauthenticated login and registration routes
  if (isAuthRoute && !currentUser) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0e17]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
            <FiTruck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-0.5">
              BUILD<span className="text-orange-500">8</span>NOW
            </span>
            <span className="hidden sm:inline-block text-[10px] font-medium tracking-wide text-slate-400">
              Materials & Logistics Platform
            </span>
          </div>
        </Link>

        {/* Navigation & Active User Section */}
        <nav className="flex items-center space-x-3 sm:space-x-5 text-xs sm:text-sm font-semibold">
          <Link
            href={currentUser ? '/' : '/?notice=protected_route'}
            className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <FiShield className="w-4 h-4 text-purple-400" />
            Portal & RBAC
          </Link>

          <Link
            href="/products/ultratech-super-cement-50kg"
            className="text-slate-300 hover:text-orange-400 transition-colors flex items-center gap-1.5 hidden md:flex"
          >
            <FiBox className="w-4 h-4 text-orange-400" />
            Product Catalog
          </Link>

          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-slate-200 transition-colors hidden lg:inline-block font-mono text-xs"
          >
            API Docs (:5000)
          </a>

          {/* User Logged In State */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-800">
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl shadow">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border flex items-center gap-1 ${getRoleBadgeStyle(
                        currentUser.role
                      )}`}
                    >
                      {getRoleIcon(currentUser.role, currentUser.influencer?.type)}
                      {currentUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 p-2 rounded-xl transition"
              >
                <FiLogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition shadow-md shadow-orange-600/20 flex items-center gap-1.5 text-xs"
            >
              <FiUser className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
