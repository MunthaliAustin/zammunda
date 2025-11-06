"use client";
import React from "react";
import { useSearch } from "./SearchContext";
import Recommendations from "./Recommendations";

const SearchResults: React.FC = () => {
  const { results } = useSearch();

  if (results.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500">
        No products found.
        <Recommendations />
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">Search Results</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((product: any) => (
          <div key={product.id} className="border p-3 rounded-xl shadow-sm bg-white hover:shadow-md transition">
            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-full object-cover rounded-md"
            />
            <h3 className="font-semibold mt-2 text-sm sm:text-base">{product.name}</h3>
            <p className="text-gray-500 text-xs sm:text-sm">{product.category}</p>
            <p className="text-blue-600 font-bold text-sm sm:text-base">${product.price}</p>
          </div>
        ))}
      </div>
      <Recommendations />
    </div>
  );
};

export default SearchResults;
