"use client";
import React from "react";
import { useSearch } from "./SearchContext";

const Recommendations: React.FC = () => {
  const { recommended } = useSearch();

  if (!recommended || recommended.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Recommended for you</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommended.map((item: any) => (
          <div key={item.id} className="border p-3 rounded-xl shadow-sm bg-white hover:shadow-md transition">
            <img src={item.image} alt={item.name} className="h-36 w-full object-cover rounded-md" />
            <h3 className="font-semibold mt-2 text-sm sm:text-base">{item.name}</h3>
            <p className="text-gray-500 text-xs sm:text-sm">{item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
