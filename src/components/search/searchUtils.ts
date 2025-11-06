export async function fetchProducts(
  query: string,
  category: string,
  filters: any,
  sort: string
) {
  const apiUrl = `/api/products?query=${query}&category=${category}&sort=${sort}`;

  // Fetch data dynamically
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Failed to fetch products");

  let products = await res.json();

  // Apply filters on frontend
  return products
    .filter((p: any) => {
      const matchPrice =
        p.price >= (filters.price?.[0] ?? 0) &&
        p.price <= (filters.price?.[1] ?? Infinity);
      const matchRating = filters.rating ? p.rating >= filters.rating : true;
      const matchBrand = filters.brand
        ? p.brand?.toLowerCase().includes(filters.brand.toLowerCase())
        : true;
      return matchPrice && matchRating && matchBrand;
    })
    .sort((a: any, b: any) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Popularity") return b.popularity - a.popularity;
      return b.createdAt.localeCompare(a.createdAt); // Newest first
    });
}
