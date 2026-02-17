"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingLabelInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export default function FloatingLabelInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword = () => {},
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative w-full">
      <input
        type={showPasswordToggle && showPassword ? "text" : type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isFocused ? placeholder || label : ""}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white peer"
      />
      <label
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isActive
            ? "top-1 text-xs font-semibold text-blue-600 bg-white px-1 -translate-y-1/2"
            : "top-1/2 text-sm text-gray-600 -translate-y-1/2"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      )}
    </div>
  );
}
