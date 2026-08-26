import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoriteStore } from "../store/favoriteStore";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function Favorites() {
  const { items, toggleFavorite, removeAll } = useFavoriteStore();
  const incrementItemCount = useCartStore((s) => s.incrementItemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const handleAddToCart = async (id: string) => {
    try {
      await api.post("/cart/api/cart/items", { productId: id, quantity: 1 });
      incrementItemCount(1);
      openDrawer();
      toast.success("Sepete eklendi!");
    } catch {
      toast.error("Sepete eklenemedi. Giriş yapmış olmanız gerekebilir.");
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Favorilerim</h1>
            <p className="mt-1 text-sm text-gray-400">
              {items.length > 0 ? `${items.length} ürün kaydedildi` : "Henüz favori eklenmedi"}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                removeAll();
                toast("Tüm favoriler temizlendi", { icon: "🗑️" });
              }}
              className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              Tümünü Temizle
            </button>
          )}
        </div>

        {/* Boş durum */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-5xl">♡</div>
            <h2 className="mt-6 text-2xl font-bold text-white">Favorin yok</h2>
            <p className="mt-2 max-w-xs text-sm text-gray-400">
              Ürün kartındaki kalp ikonuna tıklayarak ürünleri favorilere ekleyebilirsin.
            </p>
            <Link
              to="/"
              className="mt-8 rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-gray-800/60 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40"
                >
                  {/* Görsel */}
                  <Link to={`/product/${item.id}`} className="relative block aspect-square overflow-hidden bg-gray-900">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-6xl text-gray-700">♟</div>
                    )}
                    {item.categoryName && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-yellow-400 backdrop-blur">
                        {item.categoryName}
                      </span>
                    )}
                    {/* Favoriden kaldır */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(item);
                        toast("Favorilerden kaldırıldı", { icon: "💔" });
                      }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-red-400 backdrop-blur transition-transform hover:scale-110 active:scale-90"
                      aria-label="Favorilerden kaldır"
                    >
                      ♥
                    </button>
                  </Link>

                  {/* Bilgi */}
                  <div className="flex flex-1 flex-col p-4">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-yellow-400">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mt-auto pt-4">
                      <span className="text-xl font-bold text-white">₺{formatPrice(item.price)}</span>
                      <p className="text-[11px] text-gray-500">KDV Dahil</p>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        disabled={item.stockQuantity <= 0}
                        className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-all ${
                          item.stockQuantity <= 0
                            ? "cursor-not-allowed bg-gray-700 text-gray-500"
                            : "bg-yellow-500 text-gray-900 hover:bg-yellow-400 active:scale-95"
                        }`}
                      >
                        {item.stockQuantity <= 0 ? "Tükendi" : "Sepete Ekle"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
