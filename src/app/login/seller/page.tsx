"use client";

import { useState } from "react";
import InputField from "@/components/InputField";
import PrimaryButton from "@/components/PrimaryButton";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SellerSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for HttpOnly cookies
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        // Login successful, redirect to seller dashboard
        router.push('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Seller's Login</h2>
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        {/* Zakumunda Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Zakumunda Market"
            className="h-16 w-auto mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-green-600">Zakumunda Market</h1>
          <p className="text-sm text-gray-500">Seller Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <InputField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <PrimaryButton 
            label={isLoading ? "Signing In..." : "Sign In as Seller"} 
            type="submit" 
            disabled={isLoading}
          />
        </form>

        {/* Forgot password inside the box */}
        <div className="mt-4 text-sm text-blue-600 text-center">
          <Link href="/reset-password/seller" className="hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>

      {/* Divider + New to Zakumunda + Create account outside the box */}
      <div className="w-full max-w-md flex flex-col items-center mt-6">
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-black text-sm">New to Zakumunda?</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <Link
          href="/signup/seller"
          className="mt-4 w-full text-center border border-gray-400 py-2 rounded-full hover:bg-gray-50 block text-blue-600 hover:underline"
        >
          Create your Seller account
        </Link>
      </div>
    </main>
  );
}