import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";
import CategoryNav from "../components/CategoryNav";
import HeroSlider from "../components/HeroSlider";
import FeaturedSlider from "../components/FeaturedSlider";
import FilterSidebar from "../components/FilterSidebar";
import Pagination from "../components/Pagination";
import CategoryShowcase from "../components/CategoryShowcase";
import TabProductSlider from "../components/TabProductSlider";
import type { ProductListResponse, ProductQueryParams } from "../types/product";
import type { AddCartItemDto } from "../types/cart";
import { useCartStore } from "../store/cartStore";

interface Category {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryName: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/** Kelime tabanlı fuzzy arama: sorgunun her kelimesi ürün alanlarından herhangi birinde geçmeli */
function fuzzyMatch(product: ProductItem, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = `${product.name} ${product.description ?? ""} ${product.categoryName ?? ""}`.toLowerCase();
  const words = query.toLowerCase().trim().split(/\s+/);
  // Her kelime haystackde geçsin (AND) — daha az esnek ama doğru
  return words.every((w) => haystack.includes(w));
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ────────────────────────────────────────────────────────────────
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Arama — controlled input ayrı tutulur (debounce için)
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");

  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const incrementItemCount = useCartStore((s) => s.incrementItemCount);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── URL ?search param senkronizasyonu ────────────────────────────────────
  // searchParams değiştiğinde (logo tıklanınca, header aramasından yönlendirme vs.)
  const prevSearchParamsRef = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current === prevSearchParamsRef.current) return;
    prevSearchParamsRef.current = current;

    // null (param yok) → "" (arama temizle)
    const urlSearch = searchParams.get("search") ?? "";
    if (urlSearch !== search) {
      setSearch(urlSearch);
      setSearchInput(urlSearch);
      setPage(1);
      if (urlSearch) {
        setTimeout(() => {
          document.getElementById("urunler")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Kategorileri çek ─────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get<Category[]>("/catalog/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // ── Tüm ürünleri arka planda yükle (client-side fuzzy arama için) ────────
  useEffect(() => {
    api
      .get<ProductListResponse>("/catalog/api/products", {
        params: { pageNumber: 1, pageSize: 500 },
      })
      .then((res) => {
        setAllProducts(res.data.items);
        setAllProductsLoaded(true);
      })
      .catch(() => setAllProductsLoaded(true)); // hata olsa bile flag'i set et
  }, []);

  // ── Arama input debounce ─────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
      if (value.trim()) {
        setSearchParams({ search: value.trim() });
      } else {
        setSearchParams({});
      }
    }, 300);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setSearchParams({});
    setPage(1);
  };

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  // ── Kategori değişimi — aramayı temizle ──────────────────────────────────
  const handleCategoryChange = (id: string | null) => {
    setCategoryId(id);
    setPage(1);
    // Kategori seçilince URL'deki search param da temizlenir
    if (search || searchInput) {
      setSearch("");
      setSearchInput("");
      setSearchParams({});
    }
  };

  // CategoryNav aynı handler'ı kullanır
  const handleCategoryNavSelect = (id: string | null) => {
    handleCategoryChange(id);
  };

  // ── Fiyat filtresi ────────────────────────────────────────────────────────
  const handleApplyPrice = () => {
    setMinPrice(minPriceInput ? parseFloat(minPriceInput) : undefined);
    setMaxPrice(maxPriceInput ? parseFloat(maxPriceInput) : undefined);
    setPage(1);
  };

  const handleResetAll = () => {
    setCategoryId(null);
    setMinPriceInput("");
    setMaxPriceInput("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPage(1);
  };

  // ── API'den ürün çek (arama YOKSA veya allProducts henüz yüklenmediyse) ──
  useEffect(() => {
    // Eğer arama varsa ve tüm ürünler yüklendiyse API'ye gerek yok
    if (search.trim() && allProductsLoaded) return;

    setLoading(true);
    setError(null);
    const params: ProductQueryParams & { minPrice?: number; maxPrice?: number } = {
      pageNumber: page,
      pageSize: 12,
      ...(categoryId ? { categoryId } : {}),
      ...(sortBy ? { sortBy, sortDirection } : {}),
      ...(minPrice !== undefined ? { minPrice } : {}),
      ...(maxPrice !== undefined ? { maxPrice } : {}),
    };

    api
      .get<ProductListResponse>("/catalog/api/products", { params })
      .then((res) => setData(res.data))
      .catch(() => setError("Ürünler yüklenemedi."))
      .finally(() => setLoading(false));
  }, [page, categoryId, sortBy, sortDirection, minPrice, maxPrice, search, allProductsLoaded]);

  // ── Client-side fuzzy arama sonuçları ─────────────────────────────────────
  const searchResults = useMemo<ProductItem[] | null>(() => {
    if (!search.trim()) return null;
    let pool = allProducts;
    // Kategori filtresi de uygula
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId);
      if (cat) {
        pool = pool.filter((p) =>
          p.categoryName?.toLowerCase().includes(cat.name.toLowerCase())
        );
      }
    }
    // Fiyat filtresi
    if (minPrice !== undefined) pool = pool.filter((p) => p.price >= minPrice);
    if (maxPrice !== undefined) pool = pool.filter((p) => p.price <= maxPrice);
    return pool.filter((p) => fuzzyMatch(p, search));
  }, [search, allProducts, categoryId, categories, minPrice, maxPrice]);

  // Sayfalanmış arama sonuçları
  const PAGE_SIZE = 12;
  const searchPage = page;
  const pagedSearchResults = useMemo(() => {
    if (!searchResults) return null;
    const start = (searchPage - 1) * PAGE_SIZE;
    return searchResults.slice(start, start + PAGE_SIZE);
  }, [searchResults, searchPage]);
  const searchTotalPages = searchResults ? Math.max(1, Math.ceil(searchResults.length / PAGE_SIZE)) : 1;

  const handleAddToCart = async (productId: string) => {
    const dto: AddCartItemDto = { productId, quantity: 1 };
    await api.post("/cart/api/cart/items", dto);
    incrementItemCount(1);
  };

  // Gösterilecek ürün listesi: arama modunda client-side, normal modda API
  const isSearchMode = search.trim().length > 0;
  const displayItems = isSearchMode ? (pagedSearchResults ?? []) : (data?.items ?? []);
  const displayLoading = isSearchMode ? !allProductsLoaded : loading;
  const displayEmpty = !displayLoading && displayItems.length === 0;
  const displayTotalPages = isSearchMode ? searchTotalPages : (data?.totalPages ?? 1);
  const displayCurrentPage = page;

  return (
    <div className="bg-gray-900">
      <CategoryNav
        selectedCategoryId={categoryId}
        onSelect={handleCategoryNavSelect}
      />

      {/* Hero carousel */}
      <HeroSlider />

      {/* Featured products (sadece arama yokken) */}
      {!isSearchMode && !loading && !error && data && data.items.length > 0 && (
        <section id="onerilen" className="mx-auto max-w-7xl px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white">Öne Çıkan Ürünler</h2>
          </motion.div>
          <FeaturedSlider products={data.items.slice(0, 8)} showAllLink />
        </section>
      )}

      {/* Category showcase */}
      {!isSearchMode && !loading && !error && data && (
        <CategoryShowcase />
      )}

      {/* Tabbed product slider */}
      {!isSearchMode && !loading && !error && data && data.items.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4">
          <TabProductSlider products={data.items} />
        </section>
      )}

      {/* All products */}
      <main id="urunler" className="mx-auto max-w-7xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center"
        >
          <h2 className="text-2xl font-bold text-white">
            {isSearchMode ? (
              <>
                <span className="text-yellow-400">"{search}"</span>
                {" "}
                <span className="text-lg font-normal text-gray-400">
                  için sonuçlar
                  {searchResults && ` — ${searchResults.length} ürün`}
                </span>
              </>
            ) : (
              "Tüm Ürünler"
            )}
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search input */}
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input
                type="text"
                placeholder="Ürün, kategori veya kelime ara..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-2.5 pl-11 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-200"
                  aria-label="Aramayı temizle"
                >
                  ✕
                </button>
              )}
            </div>
            {/* Sort (sadece arama yokken anlamlı) */}
            {!isSearchMode && (
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); setSortDirection("asc"); }}
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-yellow-500"
                >
                  <option value="">Sırala</option>
                  <option value="price">Fiyat</option>
                  <option value="name">İsim</option>
                </select>
                <select
                  value={sortDirection}
                  onChange={(e) => { setSortDirection(e.target.value as "asc" | "desc"); setPage(1); }}
                  className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-yellow-500"
                >
                  <option value="asc">Artan</option>
                  <option value="desc">Azalan</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar + Grid layout */}
        <div className="flex gap-6">
          {/* Filter Sidebar — sadece geniş ekranda */}
          <aside className="hidden lg:block w-56 shrink-0">
            <FilterSidebar
              categories={categories}
              selectedCategoryId={categoryId}
              onCategoryChange={handleCategoryChange}
              minPrice={minPriceInput}
              maxPrice={maxPriceInput}
              onMinPriceChange={setMinPriceInput}
              onMaxPriceChange={setMaxPriceInput}
              onApplyPrice={handleApplyPrice}
              onResetAll={handleResetAll}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {displayLoading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
                <p className="mt-4 text-sm text-gray-400">
                  {isSearchMode ? "Aranıyor..." : "Ürünler yükleniyor..."}
                </p>
              </div>
            )}

            {!displayLoading && error && !isSearchMode && (
              <p className="py-16 text-center text-red-400">{error}</p>
            )}

            {!displayLoading && displayEmpty && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-4xl">🔍</div>
                <p className="mt-4 text-lg font-semibold text-white">Ürün bulunamadı</p>
                {isSearchMode && (
                  <p className="mt-2 text-sm text-gray-400">
                    <span className="font-medium text-yellow-400">"{search}"</span> için sonuç yok.
                    Farklı bir kelime deneyin.
                  </p>
                )}
                {isSearchMode && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-6 rounded-xl bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
                  >
                    Aramayı Temizle
                  </button>
                )}
              </div>
            )}

            {!displayLoading && displayItems.length > 0 && (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {displayItems.map((p) => (
                    <motion.div key={p.id} variants={itemVariants}>
                      <ProductCard product={p} onAddToCart={handleAddToCart} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {displayTotalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={displayCurrentPage}
                      totalPages={displayTotalPages}
                      onPageChange={(p) => {
                        setPage(p);
                        document.getElementById("urunler")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
