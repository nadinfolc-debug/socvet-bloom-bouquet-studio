import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/shopify";
import { MessengerButtons } from "@/components/site/HomeSections";
import { useCartStore } from "@/stores/cartStore";
import { flyImageToCart } from "@/lib/cart-motion";

export const Route = createFileRoute("/product/$handle")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(productQuery(params.handle)).catch(() => null),
  head: ({ loaderData, params }) => {
    const p = loaderData?.node;
    const title = p ? `${p.title} — букет Соцвет` : "Букет — Соцвет";
    const price = p?.variants.edges[0]?.node.price;
    const desc = p
      ? `${(p.description || "Авторский букет").slice(0, 140)}${price ? ` · ${formatPrice(price.amount)}` : ""} · Доставка по Москве.`
      : "Авторский букет мастерской Соцвет с доставкой по Москве.";
    const rawImg = p?.images.edges[0]?.node.url;
    const img = rawImg
      ? `${rawImg}${rawImg.includes("?") ? "&" : "?"}width=1200&height=630&crop=center`
      : undefined;
    const url = `https://socvet-bloom-bouquet-studio.lovable.app/product/${params.handle}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img
          ? [
              { property: "og:image", content: img },
              { name: "twitter:image", content: img },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.title,
                description: p.description,
                image: rawImg,
                brand: "Соцвет",
                offers: price
                  ? {
                      "@type": "Offer",
                      price: price.amount,
                      priceCurrency: "RUB",
                      availability: "https://schema.org/InStock",
                    }
                  : undefined,
              }),
            },
          ]
        : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(handle));
  const [variantIdx, setVariantIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100svh-var(--header-h))] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex min-h-[calc(100svh-var(--header-h))] flex-col items-center justify-center gap-6 text-center">
        <p className="font-display text-4xl italic">Букет не найден</p>
        <Button variant="line" asChild>
          <Link to="/catalog">В каталог</Link>
        </Button>
      </div>
    );
  }

  const p = product.node;
  const variants = p.variants.edges.map((e) => e.node);
  const variant = variants[variantIdx];
  const images = p.images.edges.map((e) => e.node);
  const composition = p.composition?.value.trim();
  const size = p.size?.value.trim();

  const add = async () => {
    if (!variant) return;
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions,
      });
      flyImageToCart(mediaRef.current, images[imgIdx]?.url);
      toast.success("Добавлено в корзину", { description: p.title, position: "top-center" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось добавить букет");
    }
  };

  return (
    <div className="grid h-[calc(100svh-var(--header-h))] w-full grid-cols-1 grid-rows-[minmax(0,40svh)_minmax(0,1fr)] overflow-hidden md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)] md:grid-rows-1">
      {/* Фото компактнее: целиком в кадре, без растягивания на весь экран */}
      <div className="relative flex min-h-0 min-w-0 items-center justify-center bg-milk p-3 md:p-6 lg:p-8">
        <div ref={mediaRef} className="flex h-full max-h-[min(72svh,36rem)] w-full max-w-lg items-center justify-center">
          {images[imgIdx] && (
            <img
              src={images[imgIdx].url}
              alt={images[imgIdx].altText ?? p.title}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 md:bottom-5 md:left-5">
            {images.map((im, i) => (
              <button
                key={im.url}
                type="button"
                onClick={() => setImgIdx(i)}
                className={`h-10 w-8 overflow-hidden bg-background/90 backdrop-blur-sm md:h-12 md:w-10 ${i === imgIdx ? "ring-2 ring-primary" : "opacity-80"}`}
              >
                <img src={im.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Инфо плотным столбиком — без больших вертикальных дыр */}
      <div className="flex min-h-0 min-w-0 flex-col justify-start gap-3 overflow-y-auto px-5 py-4 md:justify-center md:gap-5 md:px-10 md:py-8 lg:px-12 xl:px-16">
        <Link to="/catalog" className="eyebrow w-fit shrink-0 text-muted-foreground hover:text-primary">
          ← Каталог
        </Link>

        <div>
          <p className="eyebrow mb-2 text-primary">Авторская композиция</p>
          <h1 className="font-display text-[clamp(2.1rem,4.2vw,4rem)] font-medium leading-[1.02] tracking-[-0.03em]">
            {p.title}
          </h1>
          <p className="mt-3 font-display text-3xl text-primary md:text-[2.5rem]">
            {variant && formatPrice(variant.price.amount, variant.price.currencyCode)}
            {variant?.compareAtPrice &&
              Number(variant.compareAtPrice.amount) > Number(variant.price.amount) && (
                <s className="ml-3 text-xl text-muted-foreground md:text-2xl">
                  {formatPrice(variant.compareAtPrice.amount)}
                </s>
              )}
          </p>
        </div>

        {p.description && (
          <p className="text-[0.95rem] leading-relaxed text-muted-foreground md:text-base lg:text-lg">
            {p.description}
          </p>
        )}

        {(composition || size) && (
          <p className="text-sm text-muted-foreground">
            {[composition, size ? `Размер ${size}` : null].filter(Boolean).join(" · ")}
          </p>
        )}

        {variants.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariantIdx(i)}
                className={`rounded-full border px-4 py-1.5 text-sm ${i === variantIdx ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}
              >
                {v.title}
              </button>
            ))}
          </div>
        )}

        <Button
          variant="petal"
          size="xl"
          className="mt-1 h-12 w-full shrink-0 md:mt-2 md:h-14"
          onClick={add}
          disabled={cartLoading || !variant?.availableForSale}
        >
          {cartLoading ? (
            <Loader2 className="animate-spin" />
          ) : variant?.availableForSale ? (
            "Добавить в корзину"
          ) : (
            "Нет в наличии"
          )}
        </Button>

        <div className="mt-1 border-t border-foreground/10 pt-3 md:mt-2 md:pt-4">
          <p className="hidden text-sm text-muted-foreground md:block">
            Вопросы по букету — напишите флористу:
          </p>
          <MessengerButtons className="mt-2 hidden md:flex" />
          <p className="text-xs text-muted-foreground md:mt-3">
            Доставка 2–3 ч · Уход в памятке · Открытка бесплатно
          </p>
        </div>
      </div>
    </div>
  );
}
