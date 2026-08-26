import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Footer() {
  const [kvkk, setKvkk] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkk) {
      toast.error("KVKK metnini onaylamanız gerekmektedir.");
      return;
    }
    toast.success("Teşekkürler! Bültenimize abone oldunuz.");
    (e.currentTarget as HTMLFormElement).reset();
    setKvkk(false);
  };

  return (
    <footer className="mt-16 bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">♞</span>
              <span className="text-xl font-bold text-yellow-500 tracking-wide">ChessStore</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Satranç tutkunları için premium ekipman ve aksesuarlar. El işçiliği taşlar, turnuva standardı tahtalar.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {/* X / Twitter */}
              <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-yellow-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-yellow-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors hover:bg-yellow-500 hover:text-gray-900">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </div>

          {/* Yardım */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Yardım</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/orders" className="transition-colors hover:text-yellow-400">Siparişlerim</Link></li>
              <li><a href="#" className="transition-colors hover:text-yellow-400">SSS</a></li>
              <li><a href="#" className="transition-colors hover:text-yellow-400">Kargo Bilgisi</a></li>
              <li><a href="#" className="transition-colors hover:text-yellow-400">İade Politikası</a></li>
            </ul>
          </div>

          {/* Şirket */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Şirket</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="transition-colors hover:text-yellow-400">Hakkımızda</a></li>
              <li><a href="#" className="transition-colors hover:text-yellow-400">İletişim</a></li>
              <li><a href="#" className="transition-colors hover:text-yellow-400">Gizlilik Politikası</a></li>
              <li><a href="#" className="transition-colors hover:text-yellow-400">KVKK</a></li>
            </ul>
          </div>

          {/* Bülten */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Bülten</h4>
            <p className="mb-4 text-sm">Kampanyalardan haberdar ol</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="E-posta adresiniz"
                className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
              />

              {/* KVKK onay kutusu */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={kvkk}
                  onChange={(e) => setKvkk(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-yellow-500"
                />
                <span className="text-[11px] leading-relaxed text-gray-500">
                  <a href="#" className="underline hover:text-yellow-400">KVKK Aydınlatma Metni</a>
                  'ni okudum ve kişisel verilerimin işlenmesine onay veriyorum.
                </span>
              </label>

              <button
                type="submit"
                className="rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
          <p className="text-xs text-gray-500">© 2026 ChessStore. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-300">VISA</span>
            <span className="rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-300">MC</span>
            <span className="rounded-md border border-gray-700 bg-gray-800 px-2.5 py-1 text-[10px] font-bold tracking-wider text-gray-300">3D Secure</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
