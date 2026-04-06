'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  User,
  LogOut,
  ShoppingCart,
  Globe,
  Settings,
  Shield,
  FileBadge2,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth, useCart } from "@/app/providers";

const HoverDropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {React.Children.map(children, (child) => React.cloneElement(child, { isOpen }))}
    </div>
  );
};

const HoverDropdownTrigger = ({ children, className }) => <div className={className}>{children}</div>;

const HoverDropdownContent = ({ children, align, className, isOpen }) => (
  <>
    {isOpen && (
      <div
        className={`absolute top-full mt-3 ${
          align === "start"
            ? "left-0"
            : align === "end"
            ? "right-0"
            : "left-1/2 transform -translate-x-1/2"
        } ${className} glass-panel rounded-2xl z-50`}
      >
        {children}
      </div>
    )}
  </>
);

const HoverDropdownMenuItem = ({ children, className, onClick }) => (
  <div className={`px-4 py-2.5 cursor-pointer ${className}`} onClick={onClick}>
    {children}
  </div>
);

const UserAvatar = ({ user }) => {
  const initials = user?.first_name?.charAt(0).toUpperCase() || "U";
  const roleColor = user?.role === "ADMIN" ? "from-slate-800 to-slate-600" : user?.role === "SELLER" ? "from-emerald-700 to-teal-500" : "from-blue-700 to-cyan-500";

  return (
    <div className={`w-9 h-9 bg-gradient-to-br ${roleColor} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
      {initials}
    </div>
  );
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, handleLogout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
  const signInHref = `/signin?redirect=${encodeURIComponent(currentPath)}`;
  const dashboardHref = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(user ? [{ label: 'Orders', href: '/my-orders' }] : []),
    ...(user?.role === 'SELLER' ? [{ label: 'Inventory', href: '/seller/inventory' }] : []),
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin', href: '/admin/dashboard' }] : []),
    ...(user?.role === 'BUYER' ? [{ label: 'Become a Seller', href: '/seller/apply' }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="glass-panel rounded-2xl px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="Zammunda" className="h-9 w-auto drop-shadow-sm" />
                <div className="hidden sm:block">
                  <span className="block text-lg font-semibold text-slate-900 tracking-tight">Zammunda</span>
                  <span className="block text-[11px] uppercase tracking-[0.22em] text-slate-500">Marketplace</span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-2">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm text-slate-600 border border-white/70">
                <img src="https://flagcdn.com/w20/mw.png" alt="Malawi" className="w-4 h-3 rounded-sm" />
                <span>Malawi</span>
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <button
                onClick={() => router.push("/cart")}
                className="relative p-2.5 text-slate-600 hover:text-[var(--brand)] transition-colors rounded-full hover:bg-white/70"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--danger)] text-white text-[11px] rounded-full h-5 min-w-5 px-1 flex items-center justify-center font-semibold shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen((value) => !value)}
                className="lg:hidden p-2.5 rounded-full text-slate-600 hover:bg-white/70"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {user ? (
                <HoverDropdownMenu>
                  <HoverDropdownTrigger className="hidden lg:flex items-center gap-2 cursor-pointer p-1.5 rounded-full hover:bg-white/60 transition-colors">
                    <UserAvatar user={user} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900 leading-none">{user.first_name}</p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mt-1">{user.role}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </HoverDropdownTrigger>
                  <HoverDropdownContent align="end" className="w-60 overflow-hidden">
                    <div className="px-4 py-4 border-b border-slate-200/70 bg-white/40">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.first_name}</p>
                      <p className="text-xs text-slate-500 truncate mt-1">{user.email}</p>
                    </div>
                    <div className="py-2">
                      {user.role !== "BUYER" && (
                        <HoverDropdownMenuItem
                          className="flex items-center gap-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[var(--brand)] transition-colors"
                          onClick={() => router.push(dashboardHref)}
                        >
                          {user.role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                          <span>{user.role === 'ADMIN' ? 'Admin Dashboard' : 'Dashboard'}</span>
                        </HoverDropdownMenuItem>
                      )}
                      {user.role === "BUYER" && (
                        <HoverDropdownMenuItem
                          className="flex items-center gap-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[var(--brand)] transition-colors"
                          onClick={() => router.push("/seller/apply")}
                        >
                          <FileBadge2 className="w-4 h-4" />
                          <span>Become a Seller</span>
                        </HoverDropdownMenuItem>
                      )}
                      <HoverDropdownMenuItem
                        className="flex items-center gap-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[var(--brand)] transition-colors"
                        onClick={() => router.push("/profile")}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </HoverDropdownMenuItem>
                      <div className="border-t border-slate-200/70 my-2"></div>
                      <HoverDropdownMenuItem
                        className="flex items-center gap-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </HoverDropdownMenuItem>
                    </div>
                  </HoverDropdownContent>
                </HoverDropdownMenu>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link href={signInHref} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="px-4 py-2.5 bg-[var(--brand)] text-white text-sm font-semibold rounded-full hover:bg-[var(--brand-strong)] transition-all shadow-sm hover:shadow-md">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200/70 py-4 space-y-3">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-white/70">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-200/70 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <button onClick={() => { setMobileMenuOpen(false); router.push('/profile'); }} className="px-3 py-2 rounded-xl text-left text-sm font-medium text-slate-700 hover:bg-white/70">Profile</button>
                    <button onClick={handleLogout} className="px-3 py-2 rounded-xl text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href={signInHref} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-white/70">Sign In</Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl text-sm font-semibold text-white bg-[var(--brand)] hover:bg-[var(--brand-strong)]">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
