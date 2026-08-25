import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosInstance";
import type { ProductListResponse } from "../../types/product";
import type { Category } from "../../types/category";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get<ProductListResponse>("/catalog/api/products", {
            params: { pageNumber: 1, pageSize: 100 },
          }),
          api.get<Category[]>("/catalog/api/categories"),
        ]);
        const items = prodRes.data.items ?? [];
        setStats({
          totalProducts: prodRes.data.totalCount ?? items.length,
          totalCategories: catRes.data.length,
          outOfStock: items.filter((p) => p.stockQuantity <= 0).length,
        });
      } catch {
        setStats({ totalProducts: 0, totalCategories: 0, outOfStock: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    {
      label: "Toplam Ürün",
      value: stats?.totalProducts ?? 0,
      icon: "♟",
      accent: "text-yellow-400",
      to: "/admin/products",
    },
    {
      label: "Toplam Kategori",
      value: stats?.totalCategories ?? 0,
      icon: "🏷️",
      accent: "text-sky-400",
      to: "/admin/categories",
    },
    {
      label: "Stokta Yok",
      value: stats?.outOfStock ?? 0,
      icon: "⚠️",
      accent: "text-red-400",
      to: "/admin/products",
    },
  ];

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-white">Genel Bakış</h2>
      <p className="mb-8 text-sm text-gray-400">Mağazanızın özet istatistikleri</p>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-yellow-500" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-all hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-xl hover:shadow-black/40"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">{card.label}</span>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className={`mt-4 text-4xl font-bold ${card.accent}`}>{card.value}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
