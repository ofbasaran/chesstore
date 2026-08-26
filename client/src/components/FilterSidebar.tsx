import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface FilterSidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
  onApplyPrice: () => void;
  onResetAll: () => void;
}

export default function FilterSidebar({
  categories,
  selectedCategoryId,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onApplyPrice,
  onResetAll,
}: FilterSidebarProps) {
  const [catOpen, setCatOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);

  const hasActiveFilter = selectedCategoryId || minPrice || maxPrice;

  return (
    <aside className="w-full shrink-0 md:w-56">
      {/* Başlık + Temizle */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Filtrele</span>
        {hasActiveFilter && (
          <button
            onClick={onResetAll}
            className="text-xs text-yellow-400 underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            Temizle
          </button>
        )}
      </div>

      {/* Kategori */}
      <div className="mb-4 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
        <button
          onClick={() => setCatOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-white"
        >
          <span>Kategoriler</span>
          <span className={`transition-transform duration-200 text-gray-500 ${catOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        {catOpen && (
          <div className="border-t border-gray-800 px-4 py-3 space-y-2">
            {/* Tümü */}
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="radio"
                name="category"
                checked={!selectedCategoryId}
                onChange={() => onCategoryChange(null)}
                className="accent-yellow-500"
              />
              <span className={`transition-colors ${!selectedCategoryId ? "font-semibold text-yellow-400" : "text-gray-300"}`}>
                Tümü
              </span>
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategoryId === cat.id}
                  onChange={() => onCategoryChange(cat.id)}
                  className="accent-yellow-500"
                />
                <span
                  className={`transition-colors ${
                    selectedCategoryId === cat.id ? "font-semibold text-yellow-400" : "text-gray-300"
                  }`}
                >
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Fiyat Aralığı */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
        <button
          onClick={() => setPriceOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-white"
        >
          <span>Fiyat Aralığı</span>
          <span className={`transition-transform duration-200 text-gray-500 ${priceOpen ? "rotate-180" : ""}`}>▾</span>
        </button>
        {priceOpen && (
          <div className="border-t border-gray-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min ₺"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-2.5 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-yellow-500"
              />
              <span className="text-gray-600">–</span>
              <input
                type="number"
                min={0}
                placeholder="Max ₺"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-2.5 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-yellow-500"
              />
            </div>
            <button
              onClick={onApplyPrice}
              className="mt-3 w-full rounded-lg bg-yellow-500 py-2 text-xs font-bold text-gray-900 transition-colors hover:bg-yellow-400 active:scale-95"
            >
              Uygula
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
