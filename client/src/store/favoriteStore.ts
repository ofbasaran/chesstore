import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  stockQuantity: number;
}

interface FavoriteState {
  items: FavoriteItem[];
  count: number;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;
  removeAll: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      toggleFavorite: (item) => {
        const current = get().items;
        const exists = current.some((i) => i.id === item.id);
        const updated = exists
          ? current.filter((i) => i.id !== item.id)
          : [...current, item];
        set({ items: updated, count: updated.length });
      },
      isFavorite: (id) => get().items.some((i) => i.id === id),
      removeAll: () => set({ items: [], count: 0 }),
    }),
    { name: "chess-favorites" }
  )
);
