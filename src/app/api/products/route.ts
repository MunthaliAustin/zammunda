// ✅ This file creates a test API endpoint that returns product data dynamically
// ✅ You can access it in your browser at: http://localhost:3000/api/products

import { NextResponse } from "next/server";

// This function handles GET requests to /api/products
export async function GET(request: Request) {
  // Extract the query parameters from the URL (e.g., ?query=apple&category=Fruits)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";
  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "Newest";

  // ✅ Temporary product data (mock data)
  // You can replace this with data fetched from Firestore later
  const products = [
    {
      id: 1,
      name: "Mango",
      category: "Fruits",
      price: 5,
      rating: 4,
      brand: "LocalFarm",
      popularity: 90,
      createdAt: "2025-11-01",
      image: "https://via.placeholder.com/150/FFD700/000000?text=Mango",
    },
    {
      id: 2,
      name: "Banana",
      category: "Fruits",
      price: 3,
      rating: 5,
      brand: "GreenFarm",
      popularity: 95,
      createdAt: "2025-11-02",
      image: "https://via.placeholder.com/150/FFFF00/000000?text=Banana",
    },
    {
      id: 3,
      name: "Tomato",
      category: "Vegetables",
      price: 4,
      rating: 4,
      brand: "AgroPlus",
      popularity: 80,
      createdAt: "2025-11-03",
      image: "https://via.placeholder.com/150/FF6347/000000?text=Tomato",
    },
    {
      id: 4,
      name: "Flour Bag",
      category: "Flour",
      price: 15,
      rating: 3,
      brand: "FarmBest",
      popularity: 75,
      createdAt: "2025-10-28",
      image: "https://via.placeholder.com/150/FFF8DC/000000?text=Flour",
    },

     {
      id: 5,
      name: "cucumber",
      category: "Fruits",
      price: 19,
      rating: 4,
      brand: "LocalFarm",
      popularity: 40,
      createdAt: "2025-11-01",
      image: "https://via.placeholder.com/150/FFD700/000000?text=cucumber",
    },
  ];

  // ✅ Filter products based on search query and category
  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query);
    const matchesCategory = category === "All" || p.category === category;
    return matchesQuery && matchesCategory;
  });

  // ✅ Sort the results based on user choice
  const sorted = filtered.sort((a, b) => {
    if (sort === "Price: Low to High") return a.price - b.price;
    if (sort === "Price: High to Low") return b.price - a.price;
    if (sort === "Popularity") return b.popularity - a.popularity;
    return b.createdAt.localeCompare(a.createdAt); // Newest first
  });

  // ✅ Return results as JSON
  return NextResponse.json(sorted);
}
