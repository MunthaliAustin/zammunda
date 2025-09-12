"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Assuming your InputField component structure
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

export default function BuyerSignIn() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
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
          username: usernameOrEmail,
          password: password,
        }),
      });

      if (response.ok) {
        // Login successful, redirect to buyer dashboard or home
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
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Customer's Login</h2>
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        {/* Zakumunda Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Zakumunda Market"
            className="h-16 w-auto mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-green-600">Zakumunda Market</h1>
          <p className="text-sm text-gray-500">Customer Portal</p>
        </div>

        <div className="flex flex-col">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <InputField
            label="Username or Email"
            type="text"
            placeholder="Enter your username or email"
            value={usernameOrEmail}
            onChange={setUsernameOrEmail}
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <PrimaryButton 
            label={isLoading ? "Signing In..." : "Sign In as Customer"} 
            type="submit" 
            disabled={isLoading}
            onClick={handleSubmit}
          />
        </div>

        {/* Forgot password inside the box */}
        <div className="mt-4 text-sm text-blue-600 text-center">
          <a href="/reset-password/buyer" className="hover:underline">
            Forgot your password?
          </a>
        </div>
      </div>

      {/* Divider + New to Zakumunda + Create account outside the box */}
      <div className="w-full max-w-md flex flex-col items-center mt-6">
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-black text-sm">New to Zakumunda?</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <a
          href="/signup/buyer"
          className="mt-4 w-full text-center border border-gray-400 py-2 rounded-full hover:bg-gray-50 block text-blue-600 hover:underline"
        >
          Create your Zakumunda account
        </a>
      </div>
    </main>
  );
}
