import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h5 className="font-bold text-white mb-4">Zammunda</h5>
          <p className="text-sm">
            Connecting the local farmers and the buyers
          </p>
        </div>
        <div>
          <h5 className="font-bold text-white mb-4">Quick Links</h5>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#features" className="hover:text-white">
                Features
              </Link>
            </li>
            <li>
              <Link href="#how-it-works" className="hover:text-white">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="#faq" className="hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-4">Contact Us</h5>
          <p className="text-sm">Email: support@zammundamarket.com</p>
          <p className="text-sm">Phone: +265 123 456</p>
          <p className="text-sm">Address: Lilongwe, Malawi</p>
        </div>
        <div>
          <h5 className="font-bold text-white mb-4">Follow Us</h5>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <i className="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-8 text-sm">
        <p>© 2025 ZammundaMarket. All rights reserved.</p>
      </div>
    </footer>
  );
}