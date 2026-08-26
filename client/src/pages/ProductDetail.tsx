import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";
import { useFavoriteStore } from "../store/favoriteStore";
import Breadcrumb from "../components/Breadcrumb";
import type { Product } from "../types/product";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const incrementItemCount = useCartStore((s) => s.incrementItemCount);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { toggleFavorite, isFavorite } = useFavoriteStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    api
      .get<Product>(`/catalog/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stockQuantity <= 0) return;
    setAdding(true);
    try {
      await api.post("/cart/api/cart/items", { productId: product.id, quantity: qty });
      incrementItemCount(qty);
      toast.success("Sepete eklendi!");
      openDrawer();
    } catch {
      toast.error("Sepete eklenemedi. Giriş yapmış olmanız gerekebilir.");
    } finally {
      setAdding(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryName: product.categoryName,
      stockQuantity: product.stockQuantity,
    });
    toast.success(isFavorite(product.id) ? "Favorilerden çıkarıldı" : "Favorilere eklendi!");
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
          <p className="mt-4 text-sm text-gray-400">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !product) {
    return (
      <div className="min-h-[70vh] bg-gray-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-28 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-5xl">🔍</div>
          <h2 className="mt-6 text-2xl font-bold text-white">Ürün bulunamadı</h2>
          <p className="mt-2 text-sm text-gray-400">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
          >
            Ürünlere Dön
          </button>
        </div>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;
  const favorited = isFavorite(product.id);

  return (
    <div className="min-h-[70vh] bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: product.categoryName || "Ürünler", href: "/" },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-800">
              {!imgError && product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10rem] text-gray-700">♟</span>
              )}
              {outOfStock ? (
                <span className="absolute right-4 top-4 rounded-full bg-red-500/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                  Tükendi
                </span>
              ) : lowStock ? (
                <span className="absolute right-4 top-4 rounded-full bg-amber-500/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-900">
                  Az Kaldı
                </span>
              ) : (
                <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                  Stokta
                </span>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {product.categoryName && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-500">
                {product.categoryName}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-bold text-white">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-2xl font-bold text-yellow-500">₺{formatPrice(product.price)}</p>
              <span className="text-xs text-gray-500">KDV Dahil</span>
              {product.price >= 500 && (
                <span className="rounded-full bg-emerald-600/80 px-2.5 py-0.5 text-xs font-medium text-white">
                  🚚 Ücretsiz Kargo
                </span>
              )}
            </div>

            <p className="mt-6 leading-relaxed text-gray-400">{product.description}</p>

            {/* Stock info */}
            <p className="mt-6 text-sm">
              {outOfStock ? (
                <span className="font-medium text-red-400">Stok tükendi</span>
              ) : lowStock ? (
                <span className="font-medium text-amber-400">Son {product.stockQuantity} adet!</span>
              ) : (
                <span className="font-medium text-emerald-400">Stokta ({product.stockQuantity} adet)</span>
              )}
            </p>

            {/* Quantity selector */}
            {!outOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm text-gray-400">Adet</span>
                <div className="flex items-center rounded-xl border border-gray-700 bg-gray-800">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="flex h-10 w-10 items-center justify-center text-lg text-gray-300 hover:text-yellow-400 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-10 text-center font-medium text-white">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stockQuantity, q + 1))}
                    disabled={qty >= product.stockQuantity}
                    className="flex h-10 w-10 items-center justify-center text-lg text-gray-300 hover:text-yellow-400 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
                className={`flex-1 rounded-xl py-4 font-semibold transition-all ${
                  outOfStock
                    ? "cursor-not-allowed bg-gray-700 text-gray-500"
                    : "bg-yellow-500 text-gray-900 hover:bg-yellow-400 active:scale-95"
                }`}
              >
                {outOfStock ? "Stok Tükendi" : adding ? "Ekleniyor..." : "Sepete Ekle"}
              </button>

              {/* Favorite button */}
              <button
                onClick={handleToggleFavorite}
                title={favorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl transition-all ${
                  favorited
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-red-500/50 hover:text-red-400"
                }`}
              >
                {favorited ? "♥" : "♡"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
