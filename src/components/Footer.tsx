"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  Sun,
  Moon,
  Send,
} from "lucide-react";

interface FooterProps {
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
}

export default function Footer({ darkMode = true, onDarkModeToggle }: FooterProps) {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [subscribed, setSubscribed] = useState(false);
  const [theme, setTheme] = useState(darkMode);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const handleThemeToggle = () => {
    setTheme(!theme);
    onDarkModeToggle?.();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] 
    },
  },
};

  const linkVariants = {
    hover: { x: 4, transition: { duration: 0.2 } },
  };

  const socialVariants = {
    hover: { scale: 1.15, transition: { duration: 0.2 } },
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
  ];

  const footerLinks = {
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Data Protection", href: "/data-protection" },
    ],
    support: [
      { label: "Login", href: "/login" },
      { label: "Sign Up", href: "/signup" },
      { label: "Forgot Password", href: "/forgot-password" },
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Payment Information", href: "/payment" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Our Mission", href: "/mission" },
      { label: "Careers", href: "/careers" },
      { label: "Blog & News", href: "/blog" },
      { label: "Press", href: "/press" },
    ],
    navigation: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Documentation", href: "/docs" },
    ],
  };

  const socialLinks = [
    {
      icon: Linkedin,
      href: "https://linkedin.com",
      label: "LinkedIn",
      color: "hover:text-blue-500",
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: "Twitter",
      color: "hover:text-blue-400",
    },
    {
      icon: Facebook,
      href: "https://facebook.com",
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      icon: Instagram,
      href: "https://instagram.com",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: Youtube,
      href: "https://youtube.com",
      label: "YouTube",
      color: "hover:text-red-500",
    },
  ];

  const bgClass = theme
    ? "bg-gray-900 text-gray-300 border-gray-800"
    : "bg-gray-100 text-gray-700 border-gray-300";

  const headerClass = theme ? "text-white" : "text-gray-900";
  const hoverClass = theme
    ? "hover:text-white hover:border-white"
    : "hover:text-gray-900 hover:border-gray-900";
  const buttonClass = theme
    ? "bg-blue-600 hover:bg-blue-700 text-white"
    : "bg-blue-500 hover:bg-blue-600 text-white";

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`${bgClass} border-t transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12"
        >
          {/* Logo & Brand Section */}
          <motion.div variants={columnVariants} className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className={`text-2xl font-bold ${headerClass}`}>
                Zammunda
              </div>
            </Link>
            <p className="text-sm mb-6 leading-relaxed">
              Connecting local farmers with buyers. Building trust through
              transparency and quality.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label="Toggle theme"
              >
                {theme ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-blue-600" />
                )}
              </button>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`appearance-none px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    theme
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-gray-300 border border-gray-400"
                  }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                    theme ? "text-gray-500" : "text-gray-600"
                  }`}
                />
              </div>
            </div>
          </motion.div>

          {/* Legal & Trust */}
          <motion.div variants={columnVariants}>
            <h4 className={`text-sm font-bold mb-4 ${headerClass}`}>
              Legal & Trust
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <motion.li
                  key={link.label}
                  whileHover="hover"
                  variants={linkVariants}
                >
                  <Link
                    href={link.href}
                    className={`text-sm transition-all duration-200 border-b border-transparent ${hoverClass}`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Account & Support */}
          <motion.div variants={columnVariants}>
            <h4 className={`text-sm font-bold mb-4 ${headerClass}`}>
              Account & Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.slice(0, 4).map((link) => (
                <motion.li
                  key={link.label}
                  whileHover="hover"
                  variants={linkVariants}
                >
                  <Link
                    href={link.href}
                    className={`text-sm transition-all duration-200 border-b border-transparent ${hoverClass}`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={columnVariants}>
            <h4 className={`text-sm font-bold mb-4 ${headerClass}`}>
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <motion.li
                  key={link.label}
                  whileHover="hover"
                  variants={linkVariants}
                >
                  <Link
                    href={link.href}
                    className={`text-sm transition-all duration-200 border-b border-transparent ${hoverClass}`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter & Social */}
          <motion.div variants={columnVariants} className="lg:col-span-1">
            <h4 className={`text-sm font-bold mb-4 ${headerClass}`}>
              Stay Updated
            </h4>
            <form onSubmit={handleSubscribe} className="mb-6">
              <div className="relative mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    theme
                      ? "bg-gray-800 border border-gray-700 focus:border-blue-500"
                      : "bg-gray-200 border border-gray-400 focus:border-blue-400"
                  } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${buttonClass}`}
              >
                <span>Subscribe</span>
                <Send size={16} />
              </motion.button>
            </form>

            {subscribed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-400 text-center mb-3"
              >
                Thanks for subscribing!
              </motion.p>
            )}

            <div>
              <p className={`text-xs font-semibold mb-3 ${headerClass}`}>
                Follow Us
              </p>
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      variants={socialVariants}
                      whileHover="hover"
                      className={`text-gray-400 transition-all duration-200 ${social.color}`}
                      aria-label={social.label}
                    >
                      <Icon size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* App Download & Bottom Links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={`${theme ? "border-gray-800" : "border-gray-300"} border-t pt-10`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* App Store Buttons */}
            <motion.div variants={columnVariants}>
              <p className={`text-xs font-bold mb-3 ${headerClass}`}>
                Download App
              </p>
              <div className="space-y-3">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    theme
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <div className="text-2xl">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-current"
                      fill="currentColor"
                    >
                      <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm16 15.5V5.5H5v13h14z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs leading-tight">Get it on</p>
                    <p className="font-bold">Google Play</p>
                  </div>
                </motion.a>

                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    theme
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <div className="text-2xl">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-current"
                      fill="currentColor"
                    >
                      <path d="M18.71 19.71a12.04 12.04 0 0 0 2.37-3.78 12 12 0 0 0 .53-3.93 12 12 0 0 0-2.37-3.78l-3.78 2.37A6 6 0 0 1 18 12a6 6 0 0 1-1.07 3.41l3.78 2.37z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs leading-tight">Download on the</p>
                    <p className="font-bold">App Store</p>
                  </div>
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Support Links */}
            <motion.div variants={columnVariants}>
              <p className={`text-xs font-bold mb-3 ${headerClass}`}>
                Quick Links
              </p>
              <ul className="space-y-2">
                {footerLinks.support.slice(4, 8).map((link) => (
                  <motion.li
                    key={link.label}
                    whileHover="hover"
                    variants={linkVariants}
                  >
                    <Link
                      href={link.href}
                      className={`text-xs transition-all duration-200 border-b border-transparent ${hoverClass}`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Feature Links */}
            <motion.div variants={columnVariants}>
              <p className={`text-xs font-bold mb-3 ${headerClass}`}>Features</p>
              <ul className="space-y-2">
                {footerLinks.navigation.map((link) => (
                  <motion.li
                    key={link.label}
                    whileHover="hover"
                    variants={linkVariants}
                  >
                    <Link
                      href={link.href}
                      className={`text-xs transition-all duration-200 border-b border-transparent ${hoverClass}`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          variants={columnVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={`${theme ? "border-gray-800" : "border-gray-300"} border-t mt-10 pt-8 text-center`}
        >
          <p className="text-xs text-gray-500">
            © 2026 Zammunda. All rights reserved.
          </p>
          
        </motion.div>
      </div>
    </motion.footer>
  );
}