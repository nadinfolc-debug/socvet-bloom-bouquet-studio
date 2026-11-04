import { queryOptions } from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "./catalog";

export const productsQuery = (first = 50) =>
  queryOptions({ queryKey: ["products", first], queryFn: () => fetchProducts(first) });

export const productQuery = (handle: string) =>
  queryOptions({ queryKey: ["product", handle], queryFn: () => fetchProduct(handle) });
