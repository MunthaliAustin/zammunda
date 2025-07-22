'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Home() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-700">ZammundaMarket</h1>
          <div className="space-x-6">
            <a href="#features" className="text-gray-600 hover:text-green-700">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-700">How It Works</a>
            <a href="#faq" className="text-gray-600 hover:text-green-700">FAQ</a>
            <button className="bg-green-700 text-white px-4 py-2 rounded-xl">Login</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative mt-16 h-screen">
        <Image
          src="/images/market-illustration.png"
          alt="Agri Market Hero"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-start justify-center container mx-auto px-6">
          <motion.h2
            className="text-4xl lg:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Empowering Agri‑Food Innovation
          </motion.h2>
          <motion.p
            className="text-lg lg:text-2xl text-white mb-6 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Seamlessly connect farmers and buyers with our tech‑enabled marketplace, logistics, and traceability tailored for Malawi.
          </motion.p>
          <div className="flex items-center w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search produce, sellers..."
              className="flex-1 px-4 py-3 rounded-l-xl outline-none"
            />
            <button className="bg-yellow-400 text-slate-800 font-semibold px-6 py-3 rounded-r-xl shadow-lg hover:bg-yellow-500 transition">
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-green-700 mb-12">Platform Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📦', title: 'Fulfillment', desc: 'End-to-end warehousing & delivery with freshness guarantees.' },
              { icon: '📱', title: 'Multi-Channel Access', desc: 'Smartphone app & USSD for feature phones.' },
              { icon: '💰', title: 'Mobile Money', desc: 'Instant payments & microloan support.' },
              { icon: '🛡️', title: 'Traceability', desc: 'QR-coded lots for transparent supply chain.' },
              { icon: '🤝', title: 'Cooperatives', desc: 'Local partner networks for trust & reach.' },
              { icon: '📊', title: 'Data Insights', desc: 'Pricing trends & analytics dashboard.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-8 shadow hover:shadow-xl transition"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h4 className="text-2xl font-semibold mb-2 text-gray-800">{f.title}</h4>
                <p className="text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="how-it-works" className="py-20 bg-green-700 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Agri‑Business?</h3>
        <p className="mb-8">Join our FBZ Program today and get started in minutes.</p>
        <button className="bg-yellow-400 text-slate-800 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:bg-yellow-500 transition">
          Get Started
        </button>
      </section>

      {/* Footer Section */}
      <footer id="faq" className="bg-gray-800 text-gray-400 py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-bold text-white mb-4">ZammundaMarket</h5>
            <p>© 2025 ZammundaMarket. All rights reserved.</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Links</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Contact</h5>
            <p>Email: support@zammundamarket.com</p>
            <p>Phone: +265 123 456</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
