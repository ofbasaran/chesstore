import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  categoryName: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void | Promise<void>;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;

  const handleAddToCart = async () => {
    if (outOfStock) return;

    if (onAddToCart) {
      try {
        await onAddToCart(product.id);
        toast.success("Sepete eklendi!");
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      } catch {
        toast.error("Sepete eklenemedi. Giriş yapmış olmanız gerekebilir.");
      }
      return;
    }

    try {
      await api.post("/cart/api/cart/items", { productId: product.id, quantity: 1 });
      openDrawer();
      toast.success("Sepete eklendi!");
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    } catch {
      toast.error("Sepete eklenemedi. Giriş yapmış olmanız gerekebilir.");
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-gray-800/60 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-500/40 hover:shadow-2xl hover:shadow-black/50">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-900">
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-7xl text-gray-700">♟</div>
        )}

        {/* Category badge */}
        {product.categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-yellow-400 backdrop-blur">
            {product.categoryName}
          </span>
        )}

        {/* Stock badge */}
        {outOfStock ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            Tükendi
          </span>
        ) : lowStock ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-900">
            Son {product.stockQuantity}
          </span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            Stokta
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-base font-semibold text-white transition-colors group-hover:text-yellow-400">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-400">
          {product.description}
        </p>

        <div className="mt-5 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider text-gray-500">Fiyat</span>
            <span className="text-xl font-bold text-white">
              ₺{formatPrice(product.price)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              outOfStock
                ? "cursor-not-allowed bg-gray-700 text-gray-500"
                : added
                ? "bg-emerald-500 text-white"
                : "bg-yellow-500 text-gray-900 hover:bg-yellow-400 active:scale-95"
            }`}
          >
            {outOfStock ? "Tükendi" : added ? "Eklendi ✓" : "Sepete Ekle"}
          </button>
        </div>
      </div>
    </div>
  );
}
