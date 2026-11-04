import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveDeliveryLines, toCatalogProduct, type StoredBouquet } from "@/lib/catalog-model";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { deliveryRequestSchema } from "@/lib/delivery-schema";

const variantId = "22222222-2222-4222-8222-222222222222";
const row: StoredBouquet = {
  id: "11111111-1111-4111-8111-111111111111",
  handle: "utro",
  status: "ACTIVE",
  updated_at: "2026-11-04T00:00:00Z",
  details: {
    title: "Утро",
    description: "Букет",
    price: "4500",
    currency: "RUB",
    image: "/photo.jpg",
    images: [{ id: "33333333-3333-4333-8333-333333333333", url: "/photo.jpg" }],
    composition: "Пионы",
    size: "M",
    tags: ["весна"],
    collectionIds: ["collection"],
    soldOut: false,
    optionName: "Размер",
    variants: [{ id: variantId, name: "M", price: "4500", compareAtPrice: "5000" }],
  },
};
const product = toCatalogProduct(row);
const item: CartItem = {
  product,
  variantId,
  quantity: 1,
  variantTitle: "M",
  price: { amount: "4500", currencyCode: "RUB" },
  selectedOptions: [],
};

describe("Native catalog and request pricing", () => {
  it("preserves product URLs, variants, photos, metadata and collection filters", () => {
    const p = toCatalogProduct(row, [{ id: "collection", title: "Весна" }]).node;
    expect(p.handle).toBe("utro");
    expect(p.variants.edges[0]!.node.compareAtPrice?.amount).toBe("5000");
    expect(p.images.edges[0]!.node.url).toBe("/photo.jpg");
    expect(p.composition?.value).toBe("Пионы");
    expect(p.collections?.nodes[0]!.title).toBe("Весна");
  });
  it("uses current catalog prices instead of browser supplied prices", () => {
    const parsed = deliveryRequestSchema.parse({
      address: "Москва",
      phone: "+79991234567",
      desiredTime: "Завтра",
      consent: true,
      items: [{ variantId, quantity: 2, unitPrice: 1, title: "Подмена" }],
    });
    expect(resolveDeliveryLines([product], parsed.items)).toEqual([
      { variantId, quantity: 2, title: "Утро", variantTitle: "M", unitPrice: 4500 },
    ]);
  });
  it.each(["DRAFT", "ARCHIVED"] as const)("rejects a %s bouquet", (status) => {
    expect(() =>
      resolveDeliveryLines([toCatalogProduct({ ...row, status })], [{ variantId, quantity: 1 }]),
    ).toThrow("недоступен");
  });
  it("rejects sold out, deleted variants and duplicate lines", () => {
    const lines = [{ variantId, quantity: 1 }];
    expect(() =>
      resolveDeliveryLines(
        [toCatalogProduct({ ...row, details: { ...row.details, soldOut: true } })],
        lines,
      ),
    ).toThrow("недоступен");
    expect(() => resolveDeliveryLines([], lines)).toThrow("недоступен");
    expect(() => resolveDeliveryLines([product], [...lines, ...lines])).toThrow("Повторяющиеся");
  });
});

describe("Local cart", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    localStorage.clear();
  });
  it("adds, merges, changes quantities and removes items without network requests", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    await useCartStore.getState().addItem(item);
    await useCartStore.getState().addItem(item);
    expect(useCartStore.getState().items[0]!.quantity).toBe(2);
    await useCartStore.getState().updateQuantity(variantId, 3);
    expect(useCartStore.getState().items[0]!.quantity).toBe(3);
    await useCartStore.getState().updateQuantity(variantId, 0);
    expect(useCartStore.getState().items).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });
  it("persists and restores the basket across reloads", async () => {
    await useCartStore.getState().addItem(item);
    useCartStore.setState({ items: [] });
    // Restore the persisted payload as it would exist before a page reload.
    localStorage.setItem("socvet-cart", JSON.stringify({ state: { items: [item] }, version: 0 }));
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items).toEqual([item]);
  });
  it("rejects invalid quantities and preserves the basket", async () => {
    await useCartStore.getState().addItem(item);
    await expect(useCartStore.getState().updateQuantity(variantId, 1.5)).rejects.toThrow();
    await expect(useCartStore.getState().addItem({ ...item, quantity: 100 })).rejects.toThrow();
    expect(useCartStore.getState().items[0]!.quantity).toBe(1);
  });
});
