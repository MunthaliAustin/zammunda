"use client";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

export default function PrimaryButton({ label, onClick, type = "button" }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded"
    >
      {label}
    </button>
  );
}
