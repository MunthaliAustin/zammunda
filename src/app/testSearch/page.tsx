import { SearchProvider } from "@/components/search/SearchContext";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";

export default function SearchTestPage() {
  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-green-700">🌽 Zammunda Marketplace Search Test</h1>
        <SearchBar />
        <SearchResults />
      </div>
    </SearchProvider>
  );
}
