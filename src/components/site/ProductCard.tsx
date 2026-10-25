import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product, index = 0 }: { product: ShopifyProduct; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const img = p.images.edges[0]?.node;
  const offset = index % 3 === 1 ? "md:mt-24" : "";

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Добавлено в корзину", { description: p.title, position: "top-center" });
  };

  return (
    <Link to="/product/$handle" params={{ handle: p.handle }} className={`group block ${offset}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-milk arch">
        {img && (
          <img src={img.url} alt={img.altText ?? p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
        )}
        <button
          onClick={add}
          disabled={isLoading || !variant?.availableForSale}
          className="eyebrow absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-4 rounded-full bg-background px-6 py-3 opacity-0 transition-all duration-500 hover:bg-primary hover:text-primary-foreground group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {variant?.availableForSale === false ? "Нет в наличии" : "В корзину"}
        </button>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-3xl">{p.title}</h3>
        <span className="whitespace-nowrap text-sm font-semibold text-primary">
          {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
        </span>
      </div>
      {p.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
    </Link>
  );
}

export function EmptyProducts() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-4xl italic">Букеты скоро появятся</p>
      <p className="mt-3 text-muted-foreground">No products found — коллекция готовится в мастерской.</p>
    </div>
  );
}
