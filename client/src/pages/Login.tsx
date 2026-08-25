import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuthStore } from "../store/authStore";
import type { LoginRequestDto, LoginResponse } from "../types/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setToken = useAuthStore((s: { setToken: any; }) => s.setToken);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const dto: LoginRequestDto = { email, password };
      const res = await api.post<LoginResponse>("/identity/api/auth/login", dto);
      setToken(res.data.accessToken, res.data.refreshToken);

      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch {
      setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-2xl shadow-black/50">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="text-5xl">♞</span>
          <h1 className="mt-3 text-2xl font-bold text-yellow-500 tracking-wide">ChessStore</h1>
          <p className="mt-2 text-sm text-gray-400">Hesabınıza Giriş Yapın</p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">E-posta</label>
            <input
              type="email"
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-400">Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-500 py-3.5 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95 disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Hesabın yok mu?{" "}
          <Link to="/register" className="font-medium text-yellow-500 hover:text-yellow-400">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}
