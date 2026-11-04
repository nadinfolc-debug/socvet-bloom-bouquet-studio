import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product, index = 0, compact = false }: { product: ShopifyProduct; index?: number; compact?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const img = p.images.edges[0]?.node;
  const offset = "";

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
    <article className={`group relative ${offset}`} data-reveal data-delay={index % 3}>
      <div className={`relative mx-auto aspect-[4/5] max-w-full overflow-hidden ${compact ? "h-[38svh] md:h-auto md:w-full md:max-h-[calc(100svh-28rem)]" : "h-[50svh] md:h-auto md:w-full md:max-h-[60vh]"} bg-milk arch`}>
        {img && (
          <img src={img.url} alt={img.altText ?? p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
        )}
        <button
          type="button"
          onClick={add}
          disabled={isLoading || !variant?.availableForSale}
          aria-label={variant?.availableForSale === false ? `${p.title} — нет в наличии` : `Добавить в корзину: ${p.title}`}
          className="eyebrow absolute bottom-4 left-1/2 z-10 min-h-11 -translate-x-1/2 rounded-full bg-background px-6 py-3 shadow-soft transition-all duration-500 hover:bg-primary hover:text-primary-foreground focus-visible:translate-y-0 focus-visible:opacity-100 disabled:opacity-60 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        >
          {variant?.availableForSale === false ? "Нет в наличии" : "В корзину"}
        </button>
      </div>
      <div className={`${compact ? "mt-3" : "mt-5"} flex items-baseline justify-between gap-4`}>
        <h3 className={`font-display ${compact ? "text-2xl" : "text-2xl md:text-3xl"}`}>
          <Link to="/product/$handle" params={{ handle: p.handle }} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </h3>
        <span className="whitespace-nowrap text-sm font-semibold text-primary">
          {p.variants.edges.length > 1 ? "от " : ""}{formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
          {variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount) && (
            <s className="ml-2 font-normal text-muted-foreground"><span className="sr-only">старая цена </span>{formatPrice(variant.compareAtPrice.amount)}</s>
          )}
        </span>
      </div>
      {p.description && <p className="mt-2 text-sm md:line-clamp-2 text-muted-foreground">{p.description}</p>}
    </article>
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
