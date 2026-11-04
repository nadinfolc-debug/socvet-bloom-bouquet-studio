import type { CatalogProduct } from "./catalog";

export type AdminVariant = {
  id: string;
  name: string;
  price: string;
  compareAtPrice: string | null;
};
export type AdminBouquet = {
  id: string;
  title: string;
  description: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  price: string;
  currency: string;
  image: string | null;
  images: { id: string; url: string }[];
  composition: string;
  size: string;
  tags: string[];
  collectionIds: string[];
  soldOut: boolean;
  optionName: string;
  variants: AdminVariant[];
  updatedAt: string;
};
export type AdminCollection = { id: string; title: string; count: number };
export type StoredBouquet = {
  id: string;
  handle: string;
  status: AdminBouquet["status"];
  details: Omit<AdminBouquet, "id" | "status" | "updatedAt">;
  updated_at: string;
};
export type StoredCollection = { id: string; title: string };

export function toAdminBouquet(row: StoredBouquet): AdminBouquet {
  return { ...row.details, id: row.id, status: row.status, updatedAt: row.updated_at };
}

export function toCatalogProduct(
  row: StoredBouquet,
  collections: StoredCollection[] = [],
): CatalogProduct {
  const b = toAdminBouquet(row);
  const money = (amount: string) => ({ amount, currencyCode: "RUB" });
  return {
    node: {
      id: b.id,
      handle: row.handle,
      title: b.title,
      description: b.description,
      priceRange: {
        minVariantPrice: money(String(Math.min(...b.variants.map((v) => Number(v.price))))),
      },
      images: { edges: b.images.map((i) => ({ node: { url: i.url, altText: b.title } })) },
      variants: {
        edges: b.variants.map((v) => ({
          node: {
            id: v.id,
            title: v.name || "Default Title",
            price: money(v.price),
            compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null,
            availableForSale: !b.soldOut && row.status === "ACTIVE",
            selectedOptions: [{ name: b.optionName, value: v.name || "Default Title" }],
          },
        })),
      },
      options: [{ name: b.optionName, values: b.variants.map((v) => v.name || "Default Title") }],
      tags: b.tags,
      composition: { value: b.composition },
      size: { value: b.size },
      collections: {
        nodes: collections
          .filter((c) => b.collectionIds.includes(c.id))
          .map((c) => ({ ...c, handle: c.id })),
      },
    },
  };
}

export function resolveDeliveryLines(
  products: CatalogProduct[],
  items: { variantId: string; quantity: number }[],
) {
  if (new Set(items.map((i) => i.variantId)).size !== items.length)
    throw new Error("Повторяющиеся позиции");
  return items.map((item) => {
    const product = products.find((p) =>
      p.node.variants.edges.some((v) => v.node.id === item.variantId),
    );
    const variant = product?.node.variants.edges.find((v) => v.node.id === item.variantId)?.node;
    if (!product || !variant?.availableForSale)
      throw new Error("Букет недоступен. Обновите корзину.");
    return {
      ...item,
      title: product.node.title,
      variantTitle: variant.title,
      unitPrice: Number(variant.price.amount),
    };
  });
}
