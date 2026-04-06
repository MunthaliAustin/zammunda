"use client";

import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const footerGroups = {
    Marketplace: [
      { label: "Browse Products", href: "/products" },
      { label: "Orders", href: "/my-orders" },
      { label: "Become a Seller", href: "/seller/apply" },
    ],
    Company: [
      { label: "About Zammunda", href: "/about" },
      { label: "Support", href: "/contact" },
      { label: "FAQs", href: "/faq" },
    ],
    Policies: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  };

  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-[#16322d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_repeat(3,0.8fr)]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <img src="/logo.png" alt="Zammunda" className="h-10 w-auto" />
              <div>
                <p className="text-xl font-semibold tracking-tight">Zammunda</p>
                <p className="text-xs uppercase tracking-[0.26em] text-emerald-200/70">
                  Farm Marketplace
                </p>
              </div>
            </div>
            <p className="mb-6 max-w-md text-sm leading-7 text-slate-300">
              A cleaner digital marketplace for fresh farm produce, trusted sellers,
              and straightforward buying across Malawi.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <span>Lilongwe, Malawi</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-300" />
                <span>+265 000 000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-300" />
                <span>support@zammunda.com</span>
              </div>
            </div>
          </div>

          {Object.entries(footerGroups).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
                {title}
              </h4>
              <div className="space-y-3">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/8 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-semibold">
              Stay close to fresh inventory and approved sellers
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Track new produce, application approvals, and marketplace updates
              from one place.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
          >
            Explore Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">
            Copyright 2026 Zammunda. Built for a more trusted farm supply chain.
          </p>
          <div className="flex items-center gap-3 text-slate-300">
            {[Linkedin, Twitter, Facebook, Instagram].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
