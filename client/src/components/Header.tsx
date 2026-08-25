import { Link } from "react-router-dom";
import { useEffect } from "react";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

interface CartResponse {
  totalItems: number;
}

export default function Header() {
  const itemCount = useCartStore((s) => s.itemCount);
  const setItemCount = useCartStore((s) => s.setItemCount);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!token) return;
    api
      .get<CartResponse>("/cart/api/cart")
      .then((res) => setItemCount(res.data.totalItems))
      .catch(() => setItemCount(0));
  }, [token, setItemCount]);

  return (
    <>
      <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 flex justify-between items-center">
        <span>Ücretsiz kargo 500₺ üzeri siparişlerde</span>
        <span>Destek: 0850 000 00 00</span>
      </div>

      <header className="bg-gray-950/95 backdrop-blur sticky top-0 z-30 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <span className="text-3xl">♞</span>
            <span className="text-2xl font-bold text-yellow-500 tracking-wide">ChessStore</span>
          </Link>

          <div className="flex items-center gap-5 text-gray-200">
             {token && (
              <Link to="/admin" className="hover:text-yellow-500 transition-colors flex items-center gap-1 text-sm">
                <span>⚙️</span> <span className="hidden sm:inline">Admin Panel</span>
              </Link>
            )}
            {token ? (
              <button onClick={logout} className="hover:text-yellow-500 transition-colors flex items-center gap-1 text-sm">
                <span>👤</span> <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            ) : (
              <Link to="/login" className="hover:text-yellow-500 transition-colors flex items-center gap-1 text-sm">
                <span>👤</span> <span className="hidden sm:inline">Giriş Yap</span>
              </Link>
            )}
            <Link to="/cart" className="hover:text-yellow-500 transition-colors relative flex items-center gap-1 text-sm">
              <span>🛒</span> <span className="hidden sm:inline">Sepet</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-yellow-500 text-gray-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}