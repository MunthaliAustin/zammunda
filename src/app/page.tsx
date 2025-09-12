"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  ChevronDown,
  User,
  LogOut,
  Bell,
  Settings,
  ShoppingCart,
  UserCheck,
  Crown,
  Mail,
  Phone,
} from "lucide-react";
import FarmersMarketSlideshow from "@/components/FarmersMarketSlideshow";
import FarmCategoriesSection from "@/components/FarmCategoriesSection";

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
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
  >
    {label}
  </button>
);

export default function Home() {
  return (
    <div className="flex flex-col">
      <FarmersMarketSlideshow />
      <FarmCategoriesSection />
    </div>
  );
}