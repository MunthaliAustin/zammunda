"use client";
import React from "react";
import { useSearch } from "./SearchContext";

const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low", "Popularity"];

const SearchSort: React.FC = () => {
  const { sort, setSort } = useSearch();

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="sort" className="text-gray-600">Sort by:</label>
      <select
        id="sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="border p-1 rounded text-sm"
      >
        {sortOptions.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default SearchSort;
