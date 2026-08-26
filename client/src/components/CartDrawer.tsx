import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useCartStore } from '../store/cartStore';

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

const formatPrice = (value: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function CartDrawer() {
  const { isDrawerOpen, closeDrawer, setItemCount } = useCartStore();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get<CartResponse>('/cart/api/cart');
      setCart(res.data);
      setItemCount(res.data.totalItems);
      setIsError(false);
    } catch {
      setIsError(true);
      setCart(null);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) fetchCart();
  }, [isDrawerOpen]);

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/api/cart/items/${productId}`, { quantity });
      await fetchCart();
    } catch {
      setIsError(true);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/cart/api/cart/items/${productId}`);
      await fetchCart();
    } catch {
      setIsError(true);
    }
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div
      className={`fixed inset-0 z-50 ${isDrawerOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isDrawerOpen}
    >
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-gray-900 shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-yellow-500">🛒</span> Sepetim
            <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-semibold text-yellow-400">
              {cart?.totalItems ?? 0}
            </span>
          </h2>
          <button
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {isError ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-4xl">🔒</div>
              <p className="mt-4 font-medium text-white">Sepeti görüntülemek için lütfen giriş yapın</p>
              <p className="mt-1 text-sm text-gray-500">Sepetinize eklediğiniz ürünleri görmek için oturum açmalısınız.</p>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/login');
                }}
                className="mt-6 rounded-xl bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
              >
                Giriş Yap
              </button>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-4xl">🛒</div>
              <p className="mt-4 font-medium text-white">Sepetiniz boş</p>
              <p className="mt-1 text-sm text-gray-500">Beğendiğiniz ürünleri sepete ekleyin.</p>
              <button
                onClick={() => {
                  closeDrawer();
                  navigate('/');
                }}
                className="mt-6 rounded-xl bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
              >
                Alışverişe Başla
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {cart!.items.map((item) => (
                <div key={item.productId} className="flex gap-3 p-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gray-800 text-2xl text-gray-600">
                    ♟
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium text-white">{item.productName}</p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex-shrink-0 text-xs text-red-400 hover:text-red-300 hover:underline"
                      >
                        Kaldır
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">₺{formatPrice(item.unitPrice)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center text-gray-300 hover:text-yellow-400 disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-gray-300 hover:text-yellow-400"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        ₺{formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-white/10 p-5">
            <div className="mb-4 flex justify-between text-base font-bold text-white">
              <span>Toplam</span>
              <span>₺{formatPrice(cart!.totalPrice)}</span>
            </div>
            <button
              onClick={() => {
                closeDrawer();
                navigate('/cart');
              }}
              className="mb-2 w-full rounded-xl border border-gray-700 py-3 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:text-white"
            >
              Sepete Git
            </button>
            <button
              onClick={() => {
                closeDrawer();
                navigate('/checkout');
              }}
              className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
            >
              Ödemeye Geç
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
