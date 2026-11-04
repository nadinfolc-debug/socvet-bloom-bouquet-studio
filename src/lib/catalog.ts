import { supabase } from "@/integrations/supabase/client";
import { toCatalogProduct } from "./catalog-model";

export interface CatalogProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          compareAtPrice?: { amount: string; currencyCode: string } | null;
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
    tags?: string[];
    composition?: { value: string } | null;
    size?: { value: string } | null;
    collections?: { nodes: Array<{ id: string; title: string; handle: string }> };
  };
}

export async function fetchProducts(first = 50): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from("bouquets")
    .select("*")
    .eq("status", "ACTIVE")
    .order("updated_at", { ascending: false })
    .limit(first);
  if (error) throw new Error("Не удалось загрузить каталог");
  const collections = await fetchCatalogCollections();
  return (data ?? []).map((row) => toCatalogProduct(row, collections));
}

export async function fetchProduct(handle: string): Promise<CatalogProduct | null> {
  const { data, error } = await supabase
    .from("bouquets")
    .select("*")
    .eq("handle", handle)
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (error) throw new Error("Не удалось загрузить букет");
  return data ? toCatalogProduct(data, await fetchCatalogCollections()) : null;
}

async function fetchCatalogCollections() {
  const { data, error } = await supabase.from("bouquet_collections").select("*").order("title");
  if (error) throw new Error("Не удалось загрузить подборки");
  return data ?? [];
}

export function formatPrice(amount: string | number, _currencyCode?: string) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
