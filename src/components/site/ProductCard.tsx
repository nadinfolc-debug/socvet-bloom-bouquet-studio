import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { flyImageToCart } from "@/lib/cart-motion";

export function ProductCard({
  product,
  index = 0,
  compact = false,
  dense = false,
}: {
  product: ShopifyProduct;
  index?: number;
  compact?: boolean;
  /** Каталог: на телефоне компактная карточка как на маркетплейсе. */
  dense?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const mediaRef = useRef<HTMLDivElement>(null);
  const p = product.node;
  const variant = p.variants.edges[0]?.node;
  const images = p.images.edges.map((e) => e.node);
  const img = images[0];
  const imgAlt = images[1];

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!variant) return;
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      flyImageToCart(mediaRef.current, img?.url);
      toast.success("Добавлено в корзину", { description: p.title, position: "top-center" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось добавить букет");
    }
  };

  const price = (
    <span className={`font-semibold text-primary ${dense ? "text-[13px] md:text-sm" : "text-sm"}`}>
      {p.variants.edges.length > 1 ? "от " : ""}
      {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
      {variant?.compareAtPrice &&
        Number(variant.compareAtPrice.amount) > Number(variant.price.amount) && (
          <s className="ml-1.5 font-normal text-muted-foreground">
            <span className="sr-only">старая цена </span>
            {formatPrice(variant.compareAtPrice.amount)}
          </s>
        )}
    </span>
  );

  return (
    <article
      className={`group relative min-w-0 ${dense ? "flex h-[calc((100dvh-12rem)/2)] flex-col md:block md:h-auto" : ""}`}
      data-reveal
      data-delay={index % 3}
    >
      <div
        ref={mediaRef}
        className={
          dense
            ? "relative min-h-0 w-full flex-1 overflow-hidden rounded-md bg-milk md:aspect-[4/5] md:max-h-[45svh] md:flex-none md:rounded-sm"
            : `relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-milk ${compact ? "max-h-[45svh]" : "max-h-[55svh]"}`
        }
      >
        {img && (
          <img
            src={img.url}
            alt={img.altText ?? p.title}
            loading="lazy"
            className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] ${dense ? "object-cover md:object-contain" : "object-contain"} ${imgAlt ? "group-hover:opacity-0" : ""}`}
          />
        )}
        {imgAlt && (
          <img
            src={imgAlt.url}
            alt=""
            aria-hidden
            loading="lazy"
            className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 ${dense ? "object-cover md:object-contain" : "object-contain"}`}
          />
        )}
        {dense && (
          <button
            type="button"
            onClick={add}
            disabled={isLoading || !variant?.availableForSale}
            aria-label={
              variant?.availableForSale === false
                ? `${p.title} — нет в наличии`
                : `Добавить в корзину: ${p.title}`
            }
            className="absolute bottom-1.5 right-1.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-background/95 text-lg leading-none shadow-sm hover:bg-primary hover:text-primary-foreground disabled:opacity-60 md:hidden"
          >
            {variant?.availableForSale === false ? "–" : "+"}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={isLoading || !variant?.availableForSale}
        aria-label={
          variant?.availableForSale === false
            ? `${p.title} — нет в наличии`
            : `Добавить в корзину: ${p.title}`
        }
        className={`eyebrow relative z-10 mt-3 min-h-11 w-full whitespace-normal rounded-full border bg-background px-4 py-3 hover:bg-primary hover:text-primary-foreground disabled:opacity-60 ${dense ? "hidden md:block" : ""}`}
      >
        {variant?.availableForSale === false ? "Нет в наличии" : "В корзину"}
      </button>
      <div
        className={
          dense
            ? "mt-1.5 flex shrink-0 flex-col gap-0.5 md:mt-3 md:flex-row md:flex-wrap md:items-baseline md:justify-between md:gap-x-3 md:gap-y-2"
            : `${compact ? "mt-3" : "mt-5"} flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2`
        }
      >
        <h3 className={dense ? "line-clamp-2 text-[13px] font-medium leading-tight md:font-display md:text-2xl md:font-normal" : `font-display ${compact ? "text-2xl" : "text-2xl md:text-3xl"}`}>
          <Link to="/product/$handle" params={{ handle: p.handle }} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </h3>
        {price}
      </div>
      {(dense || !compact) && p.description && (
        <p className={dense ? "mt-0.5 line-clamp-2 shrink-0 text-[11px] leading-snug text-muted-foreground md:mt-2 md:text-sm" : "mt-2 line-clamp-2 text-sm text-muted-foreground"}>
          {p.description}
        </p>
      )}
    </article>
  );
}

export function EmptyProducts() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-4xl italic">Букеты скоро появятся</p>
      <p className="mt-3 text-muted-foreground">Коллекция готовится в мастерской.</p>
    </div>
  );
}
