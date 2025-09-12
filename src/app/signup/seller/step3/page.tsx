"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SellerSignupStep3() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the OTP code");
      return;
    }
    alert(`Account created for ${email} with OTP: ${otp}`);
  };

  const handleResend = () => {
    alert(`Resending OTP to ${email}...`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-10 rounded border border-gray-300 shadow">
        <h2 className="text-2xl font-bold text-[#232f3e] mb-6">
          Enter the one-time password (OTP) sent to your email
        </h2>

        <form onSubmit={handleCreateAccount} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-800 font-bold text-black">Email</label>
            <input
              type="email"
              className="w-[100%] border border-gray-600 p-1.5 rounded bg-gray-100 text-gray-900"
              value={email}
              disabled
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-800 font-bold text-black">One-time password</label>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border border-black p-1.5 rounded text-base placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-3 focus:ring-blue-900 focus:ring-offset-2 focus:ring-offset-white focus:border-black"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 px-6 bg-[#f0c14b] border border-yellow-600 text-black font-medium py-3 rounded-full hover:bg-yellow-400"
          >
            Create Zammunda Account
          </button>
        </form>

        <p className="text-black text-xs mt-4 w-[90%]">
          By creating an account, you agree to Zammunda’s {" "}
          <a
            href="/terms"
               className="text-[#007185] underline hover:text-blue-800"
              >
          Conditions of Use 
          
          </a>{" "}
          , {" "}
          <a
               href="/privacy"
               className="text-[#007185] underline hover:text-blue-800"
               >
          Privacy Notice
          </a>{" "}
          and{" "} 
          <a
               href="/privacy"
               className="text-[#007185] underline hover:text-blue-800"
               >
                Zammunda's Business Terms and Conditions
                </a>.
          You agree that you are creating this business account on behalf of your organization
          and have authority to bind your organization.
        </p>

        <button
          onClick={handleResend}
          className="mt-4 text-[#007185] text-sm hover:underline"
          type="button"
        >
          Resend code
        </button>
      </div>
    </main>
  );
}
