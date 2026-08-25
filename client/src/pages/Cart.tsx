import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";
import type { UpdateCartItemDto } from "../types/cart";

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface CartResponse {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE = 49.9;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const setItemCount = useCartStore((s) => s.setItemCount);

  const fetchCart = () => {
    setLoading(true);
    api
      .get<CartResponse>("/cart/api/cart")
      .then((res) => {
        setCart(res.data);
        setItemCount(res.data.totalItems);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setBusyId(productId);
    const dto: UpdateCartItemDto = { quantity };
    try {
      await api.put(`/cart/api/cart/items/${productId}`, dto);
      fetchCart();
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setBusyId(productId);
    try {
      await api.delete(`/cart/api/cart/items/${productId}`);
      fetchCart();
    } finally {
      setBusyId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
          <p className="mt-4 text-sm text-gray-400">Sepetiniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-28 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-5xl">🛒</div>
          <h2 className="mt-6 text-2xl font-bold text-white">Sepetiniz boş</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Görünüşe göre henüz sepetinize ürün eklemediniz. Premium satranç koleksiyonumuzu keşfedin.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalPrice;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = freeShipping ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="min-h-[70vh] bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold text-white">Sepetim</h1>
        <p className="mb-8 text-sm text-gray-400">{cart.totalItems} ürün</p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className={`flex items-center gap-4 rounded-2xl border border-white/5 bg-gray-800/60 p-4 transition-opacity ${
                  busyId === item.productId ? "opacity-50" : ""
                }`}
              >
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gray-900 text-3xl text-gray-600">
                  ♟
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-white">{item.productName}</h3>
                  <p className="mt-0.5 text-sm text-gray-400">Birim: ₺{formatPrice(item.unitPrice)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-700 bg-gray-900">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || busyId === item.productId}
                        className="flex h-8 w-8 items-center justify-center text-lg text-gray-300 hover:text-yellow-400 disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={busyId === item.productId}
                        className="flex h-8 w-8 items-center justify-center text-lg text-gray-300 hover:text-yellow-400 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      disabled={busyId === item.productId}
                      className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-white">₺{formatPrice(item.unitPrice * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-white/5 bg-gray-800/60 p-6">
              <h2 className="mb-5 text-lg font-bold text-white">Sipariş Özeti</h2>

              {/* Free shipping progress */}
              <div className="mb-5 rounded-xl bg-gray-900/60 p-4">
                {freeShipping ? (
                  <p className="text-sm font-medium text-emerald-400">🎉 Ücretsiz kargo kazandınız!</p>
                ) : (
                  <p className="text-sm text-gray-300">
                    Ücretsiz kargo için <span className="font-semibold text-yellow-400">₺{formatPrice(remaining)}</span> daha ekleyin
                  </p>
                )}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Ara Toplam</span>
                  <span>₺{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Kargo</span>
                  <span className={freeShipping ? "font-medium text-emerald-400" : ""}>
                    {freeShipping ? "Ücretsiz" : `₺${formatPrice(shipping)}`}
                  </span>
                </div>
                <div className="my-3 border-t border-gray-700" />
                <div className="flex justify-between text-base font-bold text-white">
                  <span>Toplam</span>
                  <span>₺{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-xl bg-yellow-500 py-3.5 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
              >
                Ödemeye Geç
              </button>
              <button
                onClick={() => navigate("/")}
                className="mt-3 w-full rounded-xl border border-gray-700 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
              >
                Alışverişe Devam Et
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
