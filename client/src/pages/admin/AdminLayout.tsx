import { NavLink, Outlet, Navigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/products", label: "Ürünler", icon: "♟" },
  { to: "/admin/categories", label: "Kategoriler", icon: "🏷️" },
];

export default function AdminLayout() {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">♞</span>
            <span className="text-lg font-bold text-yellow-500 tracking-wide">ChessStore</span>
          </Link>
          <p className="mt-1 text-xs uppercase tracking-widest text-gray-500">Yönetim Paneli</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-yellow-500 text-gray-900"
                    : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-yellow-400"
          >
            <span>←</span> Mağazaya Dön
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-900/60 px-8 backdrop-blur">
          <h1 className="text-lg font-semibold text-white">Yönetim Paneli</h1>
          <span className="text-sm text-gray-400">Yönetici</span>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
