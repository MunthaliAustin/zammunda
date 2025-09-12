"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Users, Truck } from "lucide-react";

export default function SellerSignupStep1() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");
    router.push(`/signup/seller/step2?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white flex flex-col md:flex-row rounded border border-gray-300 shadow">
        {/* Left */}
        <div className="w-full md:w-1/2 border-r p-10">
          <h2 className="text-2xl font-bold text-[#232f3e] mb-6">
            Let’s create your free Zakumunda Business account
          </h2>
          <form onSubmit={handleNext} className="flex flex-col gap-4">
            <label className="block mb-1 text-sm text-gray-800 font-bold text-black">
              Enter email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-black p-1.5 rounded text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-white focus:border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-[#f0c14b] border border-yellow-600 text-black font-medium py-3 rounded hover:bg-yellow-400"
            >
              Get started
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-800">
            Already have a Zakumunda Business account?{" "}
            <a href="/signin" className="text-[#007185] hover:underline">
              Sign in
            </a>
          </p>
        </div>

        {/* Right */}
        <div className="w-full md:w-1/2 p-10 bg-gray-50">
          <h3 className="text-xl font-semibold text-[#232f3e] mb-6">
            Added value for every type of organization
          </h3>
          <ul className="space-y-6 text-gray-800 text-sm">
            <li className="flex gap-4">
              <ShoppingCart className="w-6 h-6 text-[#f0c14b]" />
              <div>
                <strong>Buy more, save more</strong>
                <br />
                From commerce to education, save on products when you buy two or more.
              </div>
            </li>
            <li className="flex gap-4">
              <Users className="w-6 h-6 text-[#f0c14b]" />
              <div>
                <strong>Connect your people</strong>
                <br />
                Create groups, share payment methods, and manage supplies across locations.
              </div>
            </li>
            <li className="flex gap-4">
              <Truck className="w-6 h-6 text-[#f0c14b]" />
              <div>
                <strong>Get fast, FREE shipping with Zakumunda Prime</strong>
                <br />
                One Prime membership covers unlimited free shipping for your organization.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
