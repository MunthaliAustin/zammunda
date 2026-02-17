"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import GoogleOAuthButton from "@/components/GoogleOAuthButton";

export default function Signup() {
  const [activeTab, setActiveTab] = useState("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone_number: "",
    city: "",
    area: "",
    password: "",
    confirm_password: "",
    business_name: "",
    business_type: "",
    business_description: "",
    business_registration_number: "",
    tax_identification_number: "",
    business_city: "",
    business_address: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setPasswordError("");

    console.log("Form Data Submitted:", formData);

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setPasswordError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const role = "BOTH";

    // Prepare payload for both personal and business accounts
    const payload = {
      first_name: formData.first_name,
      surname: formData.surname,
      email: formData.email,
      phone_number: formData.phone_number,
      city: formData.city,
      area: formData.area,
      password: formData.password,
      role,
      is_active: true,
      ...(activeTab === "business" && {
        business_name: formData.business_name,
        business_type: formData.business_type,
        business_description: formData.business_description,
        business_registration_number: formData.business_registration_number,
        tax_identification_number: formData.tax_identification_number,
        business_city: formData.business_city,
        business_address: formData.business_address,
      }),
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users`,
        payload,
        {
          withCredentials: true, // Equivalent to credentials: "include"
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 201) {
        setSuccess(
          `${
            activeTab === "personal" ? "Personal" : "Business"
          } account created successfully! Redirecting...`
        );
        setTimeout(() => {
          window.location.href = "http://localhost:3000";
        }, 1500);
      } else {
        const errorData = response.data;
        setError(errorData.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Network error. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const response = (error as Record<string, unknown>).response;
        if (
          response &&
          typeof response === "object" &&
          "data" in response
        ) {
          const data = (response as Record<string, unknown>).data;
          if (data && typeof data === "object" && "message" in data) {
            errorMessage = (data as Record<string, unknown>).message as string;
          }
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  type Field = {
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
  };

  const personalFields: Field[] = [
    { name: "first_name", label: "First Name", type: "text", required: true },
    { name: "surname", label: "Surname", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    {
      name: "phone_number",
      label: "Phone Number",
      type: "tel",
      placeholder: "+265 ... (9 digits)",
      required: true,
    },
    { name: "city", label: "City", type: "text", required: true },
    { name: "area", label: "Area", type: "text", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirm_password",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ];

  const businessFields: Field[] = [
    {
      name: "business_name",
      label: "Business Name",
      type: "text",
      required: true,
    },
    {
      name: "business_type",
      label: "Business Type",
      type: "select",
      required: true,
      options: ["Partnership", "Solo"],
    },
    {
      name: "business_description",
      label: "Business Description",
      type: "text",
      required: true,
    },
    {
      name: "business_registration_number",
      label: "Registration Number",
      type: "text",
      required: true,
    },
    {
      name: "tax_identification_number",
      label: "Tax ID Number",
      type: "text",
      required: true,
    },
    {
      name: "business_city",
      label: "Business City",
      type: "text",
      required: true,
    },
    {
      name: "business_address",
      label: "Business Address",
      type: "text",
      required: true,
    },
    { name: "email", label: "Business Email", type: "email", required: true },
    {
      name: "phone_number",
      label: "Business Phone",
      type: "tel",
      placeholder: "+265 ... (9 digits)",
      required: true,
    },
    { name: "password", label: "Password", type: "password", required: true },
    {
      name: "confirm_password",
      label: "Confirm Password",
      type: "password",
      required: true,
    },
  ];

  const fields: Field[] =
    activeTab === "personal" ? personalFields : businessFields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {/* Error Notification */}
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

        {/* Success Notification */}
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

        {/* Password Error Notification */}
        {passwordError && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-500 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-900 font-semibold text-sm">Warning</p>
              <p className="text-yellow-800 text-sm mt-1">{passwordError}</p>
            </div>
            <button
              onClick={() => setPasswordError("")}
              className="text-yellow-600 hover:text-yellow-800 flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="flex items-center space-x-2 cursor-pointer"
            >
              <img src="/logo.png" alt="MarketHub" className="w-25 h-10" />
              <span className="font-bold text-xl text-gray-900">Zammunda</span>
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Image with smooth transition (Hidden on mobile) */}
          <div className="order-2 lg:order-1 hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square lg:aspect-auto lg:h-[600px] bg-gray-200">
              <div
                className="w-full h-full transition-all duration-700 ease-out bg-cover bg-center"
                style={{
                  backgroundImage:
                    activeTab === "personal"
                      ? "url(/signup/background.jpg)"
                      : "url(/signup/business.jpg)",
                  opacity: 1,
                }}
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <p className="text-center text-gray-600 mt-4 text-sm">
              {activeTab === "personal"
                ? "Join as a buyer and discover amazing products"
                : "Grow your business with our seller platform"}
            </p>
          </div>

          {/* Right Side - Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
              {/* Form Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Account
                </h1>
                <p className="text-gray-600 text-sm">Join our marketplace today</p>
              </div>

              {/* Tab Selector */}
              <div className="flex space-x-1 bg-gray-100 rounded-full p-1 mb-8">
                {["personal", "business"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all duration-300 text-sm ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:text-gray-900 bg-transparent"
                    }`}
                  >
                    {tab === "personal"
                      ? "Personal Account"
                      : "Business Account"}
                  </button>
                ))}
              </div>

              {/* Google OAuth Button */}
              <div className="mb-6">
                <GoogleOAuthButton isLoading={isLoading} />
              </div>

              {/* Divider */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Dynamic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className={
                        field.name === "business_description" ||
                        field.name === "business_address"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      {field.type === "password" ? (
                        <FloatingLabelInput
                          label={field.label}
                          type="password"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={field.label}
                          required={field.required}
                          showPasswordToggle={true}
                          showPassword={showPassword}
                          onTogglePassword={() => setShowPassword(!showPassword)}
                        />
                      ) : field.type === "select" ? (
                        <div className="relative w-full">
                          <select
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required={field.required}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white appearance-none"
                          >
                            <option value="" disabled>
                              Select {field.label}
                            </option>
                            {field.options &&
                              field.options.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <FloatingLabelInput
                          label={field.label}
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder || field.label}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <div className="flex items-start space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-5 h-5 mt-0.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-full font-bold text-white transition-all duration-300 ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Creating Account...</span>
                    </span>
                  ) : (
                    `Create ${
                      activeTab === "personal" ? "Personal" : "Business"
                    } Account`
                  )}
                </button>

                {/* Sign In Link */}
                <p className="text-center text-gray-600 text-sm">
                  Already have an account?{" "}
                  <a
                    href="/signin"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Sign in here
                  </a>
                </p>
              </form>
            </div>

            {/* Trust Badges */}
            {/* <div className="mt-8 flex items-center justify-center space-x-6 text-gray-600 text-xs md:text-sm">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Privacy Protected</span>
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}
