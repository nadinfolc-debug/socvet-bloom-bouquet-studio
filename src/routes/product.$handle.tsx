import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/catalog";
import { MessengerButtons } from "@/components/site/HomeSections";
import { useCartStore } from "@/stores/cartStore";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export const Route = createFileRoute("/product/$handle")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQuery(params.handle)).catch(() => null),
  head: ({ loaderData, params }) => {
    const p = loaderData?.node;
    const title = p ? `${p.title} — букет Соцвет` : "Букет — Соцвет";
    const price = p?.variants.edges[0]?.node.price;
    const desc = p ? `${(p.description || "Авторский букет").slice(0, 140)}${price ? ` · ${formatPrice(price.amount)}` : ""} · Доставка по Москве.` : "Авторский букет мастерской Соцвет с доставкой по Москве.";
    const rawImg = p?.images.edges[0]?.node.url;
    const img = rawImg ? `${rawImg}${rawImg.includes("?") ? "&" : "?"}width=1200&height=630&crop=center` : undefined;
    const url = `https://socvet-bloom-bouquet-studio.lovable.app/product/${params.handle}`;
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "product" }, { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p ? [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.title, description: p.description, image: rawImg, brand: "Соцвет", offers: price ? { "@type": "Offer", price: price.amount, priceCurrency: "RUB", availability: "https://schema.org/InStock" } : undefined }) }] : [],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  useScrollReveal();
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useQuery(productQuery(handle));
  const [variantIdx, setVariantIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <p className="font-display text-4xl italic">Букет не найден</p>
        <Button variant="line" asChild><Link to="/catalog">В каталог</Link></Button>
      </div>
    );
  }

  const p = product.node;
  const variants = p.variants.edges.map((e) => e.node);
  const variant = variants[variantIdx];
  const images = p.images.edges.map((e) => e.node);

  const add = async () => {
    if (!variant) return;
    try {
      await addItem({ product, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions });
      toast.success("Добавлено в корзину", { description: p.title, position: "top-center" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось добавить букет");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-8 md:px-10">
      <Link to="/catalog" className="eyebrow text-muted-foreground hover:text-primary">← Каталог</Link>
      <div className="mt-5 grid gap-8 md:mt-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7" data-reveal>
          <div className="aspect-[4/5] max-h-[65svh] bg-milk rounded-sm shadow-soft">
            {images[imgIdx] && <img src={images[imgIdx].url} alt={images[imgIdx].altText ?? p.title} className="h-full w-full object-contain" />}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((im, i) => (
                <button key={im.url} onClick={() => setImgIdx(i)} className={`h-24 w-20 overflow-hidden ${i === imgIdx ? "ring-2 ring-primary" : "opacity-60"}`}>
                  <img src={im.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-5 md:self-start" data-reveal data-delay="1">
          <p className="eyebrow mb-6 text-primary">Авторская композиция</p>
          <h1 className="display-lg">{p.title}</h1>
          <p className="mt-6 font-display text-4xl text-primary">{variant && formatPrice(variant.price.amount, variant.price.currencyCode)}
            {variant?.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount) && <s className="ml-4 text-2xl text-muted-foreground">{formatPrice(variant.compareAtPrice.amount)}</s>}
          </p>
          {p.description && <p className="mt-8 whitespace-pre-line leading-relaxed text-muted-foreground">{p.description}</p>}
          {(p.composition?.value.trim() || p.size?.value.trim()) && (
            <dl className="mt-8 space-y-4 text-sm">
              {p.composition?.value.trim() && <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"><dt className="eyebrow text-muted-foreground">Состав</dt><dd className="whitespace-pre-line">{p.composition.value.trim()}</dd></div>}
              {p.size?.value.trim() && <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"><dt className="eyebrow text-muted-foreground">Размер</dt><dd className="whitespace-pre-line">{p.size.value.trim()}</dd></div>}
            </dl>
          )}

          {variants.length > 1 && (
            <div className="mt-10">
              <p className="eyebrow mb-4">{p.options[0]?.name ?? "Вариант"}</p>
              <div className="flex flex-wrap gap-3">
                {variants.map((v, i) => (
                  <button key={v.id} onClick={() => setVariantIdx(i)} className={`rounded-full border px-5 py-2 text-sm ${i === variantIdx ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button variant="petal" size="xl" className="mt-10 w-full" onClick={add} disabled={cartLoading || !variant?.availableForSale}>
            {cartLoading ? <Loader2 className="animate-spin" /> : variant?.availableForSale ? "Добавить в корзину" : "Нет в наличии"}
          </Button>
          <p className="mt-6 text-sm text-muted-foreground">Есть вопросы по букету? Напишите флористу:</p>
          <MessengerButtons className="mt-3" />

          <div className="mt-12 space-y-5 border-t pt-8 text-sm">
            <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"><span className="eyebrow text-muted-foreground">Доставка</span><span>По Москве за 2–3 часа или ко времени</span></div>
            <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"><span className="eyebrow text-muted-foreground">Уход</span><span>Подрежьте стебли и меняйте воду каждый день</span></div>
            <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4"><span className="eyebrow text-muted-foreground">Открытка</span><span>Бесплатно, с вашим текстом от руки</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
