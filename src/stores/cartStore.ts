import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CatalogProduct } from "@/lib/catalog";

export interface CartItem {
  product: CatalogProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}
interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
}
const validQuantity = (quantity: number) =>
  Number.isInteger(quantity) && quantity >= 1 && quantity <= 100;
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      addItem: async (item) => {
        if (!validQuantity(item.quantity)) throw new Error("Укажите количество от 1 до 100");
        const existing = get().items.find((i) => i.variantId === item.variantId);
        const quantity = (existing?.quantity ?? 0) + item.quantity;
        if (!validQuantity(quantity))
          throw new Error("В корзине может быть не больше 100 одинаковых букетов");
        if (!existing && get().items.length >= 100)
          throw new Error("В корзине может быть не больше 100 позиций");
        set({
          items: existing
            ? get().items.map((i) => (i.variantId === item.variantId ? { ...item, quantity } : i))
            : [...get().items, item],
        });
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        if (!validQuantity(quantity)) throw new Error("Укажите количество от 1 до 100");
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
      },
      removeItem: async (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "socvet-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
