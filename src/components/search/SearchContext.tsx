"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  category: string;
  setCategory: (category: string) => void;
  filters: any;
  setFilters: (filters: any) => void;
  results: any[];
  setResults: (results: any[]) => void;
  sort: string;
  setSort: (sort: string) => void;
  recommended: any[];
  setRecommended: (recommended: any[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState<any[]>([]);
  const [sort, setSort] = useState("Newest");
  const [recommended, setRecommended] = useState<any[]>([]);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        category,
        setCategory,
        filters,
        setFilters,
        results,
        setResults,
        sort,
        setSort,
        recommended,
        setRecommended,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used inside SearchProvider");
  return context;
};
