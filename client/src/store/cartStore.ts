import { create } from 'zustand';

interface CartState {
  itemCount: number;
  isDrawerOpen: boolean;
  setItemCount: (count: number) => void;
  incrementItemCount: (by: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  isDrawerOpen: false,
  setItemCount: (count) => set({ itemCount: count }),
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  incrementItemCount: (by) => set((state) => ({ itemCount: state.itemCount + by })),
}));