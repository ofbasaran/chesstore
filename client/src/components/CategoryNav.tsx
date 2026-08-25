import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import type { Category } from "../types/category";

interface Props {
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategoryNav({ selectedCategoryId, onSelect }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api
      .get<Category[]>("/catalog/api/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  return (
    <nav className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
        <button
          onClick={() => onSelect(null)}
          className={`py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
            selectedCategoryId === null
              ? "border-yellow-500 text-yellow-500 font-semibold"
              : "border-transparent text-gray-300 hover:text-yellow-400"
          }`}
        >
          Tümü
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              selectedCategoryId === c.id
                ? "border-yellow-500 text-yellow-500 font-semibold"
                : "border-transparent text-gray-300 hover:text-yellow-400"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}