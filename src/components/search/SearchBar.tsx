"use client";
import React from "react";
import { useSearch } from "./SearchContext";
import SearchFilters from "./SearchFilters";
import SearchSort from "./SearchSort";
import { fetchProducts } from "./searchUtils";

const categories = ["All", "Fruits", "Vegetables", "Processed foods", "Spices", "Flour", "Fertilizer"];

const SearchBar: React.FC = () => {
  const { query, setQuery, category, setCategory, setResults, filters, sort, setRecommended } = useSearch();

  const handleSearch = async () => {
    const results = await fetchProducts(query, category, filters, sort);
    setResults(results);

    // Basic recommendation (popular products from same category)
    const recommended = await fetchProducts("", category, {}, "popularity");
    setRecommended(recommended.slice(0, 4));
  };

  return (
    <div className="flex flex-col gap-3 items-center w-full max-w-5xl mx-auto p-3 sm:p-5">
      <div className="flex flex-col sm:flex-row w-full bg-white rounded-full border p-2 shadow-md">
        <input
          type="text"
          placeholder="Search for anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 outline-none rounded-full text-sm sm:text-base"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border-l px-3 py-2 text-gray-600 rounded-full text-sm sm:text-base mt-2 sm:mt-0 sm:ml-2"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-5 py-2 rounded-full mt-2 sm:mt-0 sm:ml-2 hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center">
        <SearchFilters />
        <SearchSort />
      </div>
    </div>
  );
};

export default SearchBar;
