"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Info } from "lucide-react"; // ✅ or any info icon you like

export default function SellerSignupStep2() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    router.push(`/signup/seller/step3?email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-10 rounded border border-gray-300 shadow">
        <h2 className="text-2xl font-bold text-[#232f3e] mb-6">
          Enter your name and choose your password
        </h2>

        <form onSubmit={handleNext} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm font-bold text-black">Your name</label>
            <input
              type="text"
              placeholder="Full name"
              className="w-full border border-black p-1.5 rounded text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-white focus:border-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-800 font-bold text-black">Email</label>
            <input
              type="email"
              className="w-full border border-black p-1.5 rounded text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-white focus:border-black"
              value={email}
              disabled
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-800 font-bold text-black">Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              className="w-full border border-black p-1.5 rounded text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-white focus:border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Info text with icon */}
          <div className="flex items-center gap-2 text-sm text-gray-700 w-[100%] font-bold">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600">
            <Info className="w-4 h-4 text-white" />
            </div>
            <span>Passwords must be at least 6 characters.</span>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-800 font-bold text-black">
              Re-enter password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              className="w-full border border-black p-1.5 rounded text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-white focus:border-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-6 bg-[#f0c14b] border border-yellow-600 text-black font-medium py-3 rounded-full hover:bg-yellow-400"
          >
            Create your Zammunda account
          </button>

          {/* <p className="text-xs text-black mt-4 w-[100%]">
            By creating an account, you agree to Zammunda’s Conditions of Use and Privacy Notice.
            </p> */}
             <p className="text-xs text-black mt-4 w-[100%]">
               By creating an account, you agree to{" "}
             <a
               href="/terms"
               className="text-[#007185] underline hover:text-blue-800"
              >
                 Conditions of Use
             </a>{" "}
              and{" "}
             <a
               href="/privacy"
               className="text-[#007185] underline hover:text-blue-800"
               >
                Privacy Notice
             </a>.
            </p>

        </form>
      </div>
    </main>
  );
}
