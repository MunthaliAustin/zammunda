"use client";
import React, { useState } from "react";
import { useSearch } from "./SearchContext";

const SearchFilters: React.FC = () => {
  const { setFilters } = useSearch();
  const [price, setPrice] = useState<[number, number]>([0, 1000]);
  const [rating, setRating] = useState(0);
  const [brand, setBrand] = useState("");

  const applyFilters = () => {
    setFilters({ price, rating, brand });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <input
        type="number"
        placeholder="Min price"
        className="border p-1 rounded text-sm w-20 sm:w-24"
        value={price[0]}
        onChange={(e) => setPrice([+e.target.value, price[1]])}
      />
      <input
        type="number"
        placeholder="Max price"
        className="border p-1 rounded text-sm w-20 sm:w-24"
        value={price[1]}
        onChange={(e) => setPrice([price[0], +e.target.value])}
      />
      <input
        type="text"
        placeholder="Brand"
        className="border p-1 rounded text-sm w-24 sm:w-32"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
      />
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="border p-1 rounded text-sm w-24 sm:w-32"
      >
        <option value={0}>All Ratings</option>
        <option value={4}>4★ & up</option>
        <option value={3}>3★ & up</option>
      </select>
      <button
        onClick={applyFilters}
        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
      >
        Apply
      </button>
    </div>
  );
};

export default SearchFilters;
