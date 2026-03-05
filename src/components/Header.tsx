"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ChevronDown,
  User,
  LogOut,
  Bell,
  Settings,
  ShoppingCart,
  UserCheck,
  Crown,
  Mail,
  Phone,
  Package,
  Globe,
  Languages,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { useCart } from "@/app/providers";

// Custom hover dropdown component
const HoverDropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen })
      )}
    </div>
  );
};

const HoverDropdownTrigger = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const HoverDropdownContent = ({ children, align, className, isOpen }) => (
  <>
    {isOpen && (
      <div
        className={`absolute top-full mt-1 ${
          align === "start"
            ? "left-0"
            : align === "end"
            ? "right-0"
            : "left-1/2 transform -translate-x-1/2"
        } ${className} border border-gray-200 rounded-md shadow-lg z-50 bg-white`}
      >
        {children}
      </div>
    )}
  </>
);

const HoverDropdownMenuItem = ({ children, className, onClick }) => (
  <div className={`px-3 py-2 cursor-pointer ${className}`} onClick={onClick}>
    {children}
  </div>
);

// User Avatar Component
const UserAvatar = ({ user }) => {
  const initials = user?.first_name?.charAt(0).toUpperCase() || "U";
  const roleColor = user?.role === "BUYER" ? "bg-blue-500" : "bg-green-500";

  return (
    <div
      className={`w-8 h-8 ${roleColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
    >
      {initials}
    </div>
  );
};

export default function Header() {
  const router = useRouter();
  const { user, handleLogout } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      {/* Professional Clean Header - Single Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo + Nav */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5">
              <img src="/logo.png" alt="Zammunda" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Zammunda</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                Products
              </Link>
              {user && (
                <>
                  <Link 
                    href="/my-orders" 
                    className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                  >
                    Orders
                  </Link>
                  {user.role === "SELLER" && (
                    <Link 
                      href="/seller/inventory" 
                      className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                    >
                      Inventory
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            {/* Country - Minimal */}
            <HoverDropdownMenu>
              <HoverDropdownTrigger className="flex items-center space-x-1.5 cursor-pointer text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Globe className="w-4 h-4" />
                <ChevronDown className="w-3.5 h-3.5" />
              </HoverDropdownTrigger>
              <HoverDropdownContent align="end" className="w-40">
                <div onClick={() => {}}>
                  <HoverDropdownMenuItem className="flex items-center space-x-2 hover:bg-gray-50">
                    <img src="https://flagcdn.com/w20/mw.png" alt="Malawi" className="w-4 h-3 rounded" />
                    <span className="text-sm">Malawi</span>
                  </HoverDropdownMenuItem>
                </div>
              </HoverDropdownContent>
            </HoverDropdownMenu>

            {/* Cart */}
            <button
              onClick={() => router.push("/cart")}
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors rounded-lg hover:bg-gray-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <HoverDropdownMenu>
                <HoverDropdownTrigger className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <UserAvatar user={user} />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                </HoverDropdownTrigger>
                <HoverDropdownContent align="end" className="w-52">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.first_name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded">
                      {user.role}
                    </span>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <HoverDropdownMenuItem 
                      className="flex items-center space-x-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => router.push("/dashboard")}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Dashboard</span>
                    </HoverDropdownMenuItem>
                    <HoverDropdownMenuItem 
                      className="flex items-center space-x-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      onClick={() => router.push("/profile")}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </HoverDropdownMenuItem>
                    <div className="border-t border-gray-100 my-1"></div>
                    <HoverDropdownMenuItem 
                      className="flex items-center space-x-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </HoverDropdownMenuItem>
                  </div>
                </HoverDropdownContent>
              </HoverDropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/signin" 
                  className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
