import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axiosInstance";
import ProductCard from "../components/ProductCard";
import CategoryNav from "../components/CategoryNav";
import HeroSlider from "../components/HeroSlider";
import FeaturedSlider from "../components/FeaturedSlider";
import type { ProductListResponse, ProductQueryParams } from "../types/product";
import type { AddCartItemDto } from "../types/cart";
import { useCartStore } from "../store/cartStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProductList() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const incrementItemCount = useCartStore((s) => s.incrementItemCount);

  useEffect(() => {
    setLoading(true);
    const params: ProductQueryParams = {
      pageNumber: page,
      pageSize: 10,
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { search } : {}),
      ...(sortBy ? { sortBy, sortDirection } : {}),
    };

    api
      .get<ProductListResponse>("/catalog/api/products", { params })
      .then((res) => setData(res.data))
      .catch(() => setError("Ürünler yüklenemedi."))
      .finally(() => setLoading(false));
  }, [page, categoryId, search, sortBy, sortDirection]);

  const handleAddToCart = async (productId: string) => {
    // Errors propagate so ProductCard can show a toast
    const dto: AddCartItemDto = { productId, quantity: 1 };
    await api.post("/cart/api/cart/items", dto);
    incrementItemCount(1);
  };

  return (
    <div className="bg-gray-900">
      <CategoryNav selectedCategoryId={categoryId} onSelect={(id) => { setCategoryId(id); setPage(1); }} />

      {/* Hero carousel */}
      <HeroSlider />

      {/* Featured products */}
      {!loading && !error && data && data.items.length > 0 && (
        <section id="onerilen" className="mx-auto max-w-7xl px-4 py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-2xl font-bold text-white"
          >
            Öne Çıkan Ürünler
          </motion.h2>
          <FeaturedSlider products={data.items.slice(0, 8)} />
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
          <h2 className="text-2xl font-bold text-white">Tüm Ürünler</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-gray-700 bg-gray-800 py-2.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-yellow-500"
              >
                <option value="">Sırala</option>
                <option value="price">Fiyat</option>
                <option value="name">İsim</option>
              </select>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
                className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-yellow-500"
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
            <p className="mt-4 text-sm text-gray-400">Ürünler yükleniyor...</p>
          </div>
        )}
        {error && <p className="py-16 text-center text-red-400">{error}</p>}
        {!loading && !error && data && data.items.length === 0 && (
          <p className="py-16 text-center text-gray-400">Ürün bulunamadı.</p>
        )}

        {!loading && !error && data && data.items.length > 0 && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {data.items.map((p) => (
                <motion.div key={p.id} variants={itemVariants}>
                  <ProductCard product={p} onAddToCart={handleAddToCart} />
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Önceki
              </button>
              <span className="text-sm text-gray-400">
                {data.pageNumber} <span className="text-gray-600">/</span> {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Sonraki
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
