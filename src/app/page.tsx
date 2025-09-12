"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FarmersMarketSlideshow from "@/components/FarmersMarketSlideshow";
import FarmCategoriesSection from "@/components/FarmCategoriesSection";
import { useRouter } from "next/navigation";

const InputField = ({ label, type, placeholder, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
    />
  </div>
);

const PrimaryButton = ({ label, type, disabled, onClick }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
      disabled 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700'
    }`}
  >
    {label}
  </button>
);

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

const HoverDropdownTrigger = ({ children, className, isOpen }) => (
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
        } ${className} border border-gray-200 rounded-md shadow-lg z-50`}
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
  const initials = user.first_name?.charAt(0).toUpperCase() || 'U';
  const roleColor = user.role === 'BUYER' ? 'bg-blue-500' : 'bg-green-500';
  
  return (
    <div className={`w-8 h-8 ${roleColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
      {initials}
    </div>
  );
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(3);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  // Function to check authentication status
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Important for HttpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Fetch user-specific notifications if logged in
        fetchNotifications();
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/notifications`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const notificationData = await response.json();
        setNotifications(notificationData);
      }
    } catch (error) {
      console.error('Notifications fetch error:', error);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUser(null);
        setNotifications([]);
        router.refresh(); // Refresh the page to clear any cached data
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        {/* Welcome Banner for Logged-in Users */}
        {user && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4" />
                <span>
                  Welcome back, <span className="font-semibold">{user.first_name}</span>! 
                  {user.role === 'BUYER' ? ' Happy shopping!' : ' Ready to sell?'}
                </span>
                {user.role === 'SELLER' && <Crown className="w-4 h-4 text-yellow-300" />}
              </div>
              <div className="text-xs opacity-90">
                {user.role} Account
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="bg-gray-100 px-4 py-2 text-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Country Dropdown with Hover */}
              <HoverDropdownMenu>
                <HoverDropdownTrigger className="flex items-center space-x-2 hover:text-blue-600 focus:outline-none cursor-pointer">
                  <img
                    src={`https://flagcdn.com/w20/mw.png`}
                    alt="Malawi flag"
                    className="w-5 h-3 object-cover rounded-sm"
                  />
                  <span className="text-gray-600">Malawi</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </HoverDropdownTrigger>
                <HoverDropdownContent
                  align="start"
                  className="w-48 bg-white border-gray-200 shadow-lg"
                >
                  {[
                    { name: "Malawi", code: "mw" },
                    { name: "Zambia", code: "zm" },
                    { name: "Zimbabwe", code: "zw" },
                    { name: "Tanzania", code: "tz" },
                    { name: "Kenya", code: "ke" },
                    { name: "Uganda", code: "ug" },
                    { name: "Rwanda", code: "rw" },
                    { name: "Burundi", code: "bi" },
                    { name: "Mozambique", code: "mz" },
                    { name: "Botswana", code: "bw" },
                  ].map((country) => (
                    <HoverDropdownMenuItem
                      key={country.code}
                      className="flex items-center space-x-3 hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={`https://flagcdn.com/w20/${country.code}.png`}
                        alt={`${country.name} flag`}
                        className="w-5 h-3 object-cover rounded-sm"
                      />
                      <span>{country.name}</span>
                    </HoverDropdownMenuItem>
                  ))}
                </HoverDropdownContent>
              </HoverDropdownMenu>

              {/* Language Dropdown with Hover */}
              <HoverDropdownMenu>
                <HoverDropdownTrigger className="flex items-center space-x-2 hover:text-blue-600 focus:outline-none cursor-pointer">
                  <span className="text-gray-600">English</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </HoverDropdownTrigger>
                <HoverDropdownContent
                  align="start"
                  className="w-32 bg-white border-gray-200 shadow-lg"
                >
                  {["English", "Swahili", "Chichewa", "French"].map((lang) => (
                    <HoverDropdownMenuItem
                      key={lang}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      {lang}
                    </HoverDropdownMenuItem>
                  ))}
                </HoverDropdownContent>
              </HoverDropdownMenu>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell with Hover */}
              <HoverDropdownMenu>
                <HoverDropdownTrigger className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer relative">
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notifications.length}
                    </span>
                  )}
                </HoverDropdownTrigger>
                <HoverDropdownContent
                  align="end"
                  className="w-80 bg-white border-gray-200 shadow-lg max-h-96 overflow-y-auto"
                >
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      <div className="px-4 py-3 bg-gray-50 font-semibold text-sm">
                        Notifications ({notifications.length})
                      </div>
                      {notifications.map((notification, index) => (
                        <HoverDropdownMenuItem key={index} className="hover:bg-gray-50 transition-colors p-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{notification.title}</div>
                            <div className="text-gray-600 mt-1">{notification.message}</div>
                            <div className="text-xs text-gray-400 mt-2">{notification.time}</div>
                          </div>
                        </HoverDropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <HoverDropdownMenuItem className="text-gray-600 text-center py-6 text-sm">
                      {user ? "You don't have any notifications" : "Sign in to see notifications"}
                    </HoverDropdownMenuItem>
                  )}
                </HoverDropdownContent>
              </HoverDropdownMenu>

              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Help & Contact
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sell
              </a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="w-full border-b bg-white shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            {/* Logo Section */}
            <div className="flex items-center space-x-6">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            </div>

            {/* Search Bar */}
            <div className="flex flex-1 max-w-3xl mx-6">
              <div className="flex w-full border-2 border-gray-300 rounded-full overflow-hidden focus-within:border-blue-500 transition-colors">
                <input
                  type="text"
                  placeholder={user ? `Hi, search for anything` : "Search for anything"}
                  className="flex-1 px-6 py-3 focus:outline-none text-gray-700"
                />
                <select className="border-l-2 border-gray-300 px-4 py-3 text-gray-600 focus:outline-none bg-gray-50">
                  <option>Baby</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home</option>
                  <option>Sports</option>
                  <option>Books</option>
                </select>
              </div>
              <button className="ml-3 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                Search
              </button>
            </div>

            {/* Right Section: Advanced Settings, Cart, Sign In */}
            <div className="flex items-center space-x-4">
              {/* Advanced Settings Button */}
              <HoverDropdownMenu>
                <HoverDropdownTrigger className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300 hover:border-gray-400">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700 font-medium text-sm">
                    Advanced
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </HoverDropdownTrigger>
                <HoverDropdownContent
                  align="end"
                  className="w-56 bg-white border-gray-200 shadow-lg"
                >
                  <HoverDropdownMenuItem className="flex items-center space-x-3 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span>Search Filters</span>
                  </HoverDropdownMenuItem>
                  <HoverDropdownMenuItem className="flex items-center space-x-3 hover:bg-gray-50 transition-colors">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span>Location Settings</span>
                  </HoverDropdownMenuItem>
                  <HoverDropdownMenuItem className="flex items-center space-x-3 hover:bg-gray-50 transition-colors">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span>Saved Searches</span>
                  </HoverDropdownMenuItem>
                  <hr className="my-1 border-gray-200" />
                  <HoverDropdownMenuItem className="flex items-center space-x-3 hover:bg-gray-50 transition-colors text-gray-600">
                    <span>Preferences</span>
                  </HoverDropdownMenuItem>
                </HoverDropdownContent>
              </HoverDropdownMenu>

              {/* Shopping Cart */}
              <div className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200 hover:border-orange-300">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-700 font-medium text-sm">
                    Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Sign In / User Menu */}
              <div className="relative">
                {!user ? (
                  <HoverDropdownMenu>
                    <HoverDropdownTrigger className="flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 hover:border-blue-300">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-700 font-medium">Sign In</span>
                      <ChevronDown className="w-4 h-4 text-blue-500" />
                    </HoverDropdownTrigger>
                    <HoverDropdownContent
                      align="end"
                      className="w-48 bg-white border-gray-200 shadow-lg"
                    >
                      <HoverDropdownMenuItem className="hover:bg-gray-50 transition-colors">
                        <a href="/login/seller" className="block w-full">
                          Sign in as Seller
                        </a>
                      </HoverDropdownMenuItem>
                      <HoverDropdownMenuItem className="hover:bg-gray-50 transition-colors">
                        <a href="/login/buyer" className="block w-full">
                          Sign in as Buyer
                        </a>
                      </HoverDropdownMenuItem>
                    </HoverDropdownContent>
                  </HoverDropdownMenu>
                ) : (
                  <HoverDropdownMenu>
                    <HoverDropdownTrigger className="flex items-center space-x-2 px-3 py-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors cursor-pointer border border-green-200 hover:border-green-300">
                      <UserAvatar user={user} />
                      <div className="flex flex-col items-start">
                        <span className="text-green-700 font-semibold text-sm leading-tight">
                          {user.first_name}
                        </span>
                        <span className="text-green-600 text-xs leading-tight">
                          {user.role}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-green-500" />
                    </HoverDropdownTrigger>
                    <HoverDropdownContent
                      align="end"
                      className="w-64 bg-white border-gray-200 shadow-lg"
                    >
                      {/* User Info Section */}
                      <div className="px-4 py-3 bg-green-50 border-b">
                        <div className="flex items-center space-x-3">
                          <UserAvatar user={user} />
                          <div>
                            <div className="font-semibold text-gray-900">{user.first_name}</div>
                            <div className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone_number && (
                              <div className="text-sm text-gray-600 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone_number}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium inline-flex items-center">
                          {user.role === 'BUYER' ? '🛒' : '🏪'} {user.role}
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <HoverDropdownMenuItem className="hover:bg-gray-50 transition-colors">
                        <a href={user.role === 'BUYER' ? '/buyer/profile' : '/seller/dashboard'} className="block w-full">
                          {user.role === 'BUYER' ? 'My Profile' : 'Dashboard'}
                        </a>
                      </HoverDropdownMenuItem>
                      <HoverDropdownMenuItem className="hover:bg-gray-50 transition-colors">
                        <a href="/orders" className="block w-full">
                          My Orders
                        </a>
                      </HoverDropdownMenuItem>
                      <HoverDropdownMenuItem className="hover:bg-gray-50 transition-colors">
                        <a href="/settings" className="block w-full">
                          Account Settings
                        </a>
                      </HoverDropdownMenuItem>
                      <hr className="my-1 border-gray-200" />
                      <HoverDropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center hover:bg-red-50 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Log Out
                      </HoverDropdownMenuItem>
                    </HoverDropdownContent>
                  </HoverDropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <FarmersMarketSlideshow />
      <FarmCategoriesSection />
    </div>
  );
}