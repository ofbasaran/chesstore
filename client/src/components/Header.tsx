import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/axiosInstance";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useFavoriteStore } from "../store/favoriteStore";

interface CartResponse {
  totalItems: number;
}

export default function Header() {
  const itemCount = useCartStore((s) => s.itemCount);
  const setItemCount = useCartStore((s) => s.setItemCount);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const favoriteCount = useFavoriteStore((s) => s.count);
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<CartResponse>("/cart/api/cart")
      .then((res) => setItemCount(res.data.totalItems))
      .catch(() => setItemCount(0));
  }, [token, setItemCount]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/?search=${encodeURIComponent(q)}`);
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top bar */}
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

          {/* Search bar (expands) */}
          {searchOpen && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-1 items-center gap-2 rounded-xl border border-yellow-500/50 bg-gray-800 px-4 py-2"
            >
              <span className="text-gray-500">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Ürün ara..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="text-gray-500 transition-colors hover:text-gray-300"
                aria-label="Aramayı Kapat"
              >
                ✕
              </button>
            </form>
          )}

          <div className="flex items-center gap-5 text-gray-200">
            {/* Search icon */}
            {!searchOpen && (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Ara"
                className="hover:text-yellow-500 transition-colors flex items-center gap-1 text-sm"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Ara</span>
              </button>
            )}

            {/* Favorites */}
            <Link
              to="/favoriler"
              className="hover:text-yellow-500 transition-colors relative flex items-center gap-1 text-sm"
              aria-label="Favorilerim"
            >
              <span>♡</span>
              <span className="hidden sm:inline">Favoriler</span>
              {favoriteCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {favoriteCount}
                </span>
              )}
            </Link>

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
