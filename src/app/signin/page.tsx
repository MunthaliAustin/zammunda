"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle, AlertCircle, X, Home } from "lucide-react";

const InputField = ({ label, type, placeholder, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      required
    />
  </div>
);

const PasswordField = ({
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  onTogglePassword,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        required
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
);

const PrimaryButton = ({
  label,
  type,
  disabled,
  onClick,
}: {
  label: any;
  type: any;
  disabled: any;
  onClick?: any;
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 ${
      disabled
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"
    }`}
  >
    {label}
  </button>
);

export default function BuyerSignIn() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: usernameOrEmail,
            password: password,
          }),
        }
      );

      if (response.ok) {
        setSuccess("Sign in successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {error && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-500 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900 font-semibold text-sm">Error</p>
              <p className="text-red-800 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-500 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-900 font-semibold text-sm">Success</p>
              <p className="text-green-800 text-sm mt-1">{success}</p>
            </div>
            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800 flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Header with Home Link */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition font-semibold group"
          >
            <Home size={20} className="group-hover:scale-110 transition" />
            <span>Home</span>
          </a>
          <div className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="w-39 h-16  rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="/logo.png"
                  alt="Zakumunda Market"
                  className="h-16 w-auto mx-auto mb-2"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Zakumunda Market
              </h1>
              <p className="text-sm text-gray-600">Customer Portal</p>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Username or Email"
                type="text"
                placeholder="Enter your username or email"
                value={usernameOrEmail}
                onChange={setUsernameOrEmail}
              />

              <PasswordField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <a
                  href="/reset-password/buyer"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <PrimaryButton
                label={isLoading ? "Signing In..." : "Sign In as Customer"}
                type="submit"
                disabled={isLoading}
              />
            </form>

            {/* Trust Badges */}
            {/* <div className="mt-6 flex items-center justify-center space-x-4 text-gray-600 text-xs">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Data Protected</span>
              </div>
            </div> */}
          </div>

          {/* Divider - New to Zakumunda */}
          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-3 text-sm text-gray-600 font-medium">
              New to Zakumunda?
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Create Account Link */}
          <a
            href="/signup"
            className="block w-full text-center border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 text-blue-600 font-semibold hover:border-blue-300 transition"
          >
            Create your Zakumunda account
          </a>

          {/* Seller Portal Link */}
          {/* <p className="text-center text-sm text-gray-600 mt-4">
            Are you a seller?{" "}
            <a
              href="/seller/signin"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign in here
            </a>
          </p> */}
        </div>
      </main>
    </div>
  );
}
