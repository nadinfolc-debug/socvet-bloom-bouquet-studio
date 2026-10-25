import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { productQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/product/$handle")({
  head: () => ({
    meta: [
      { title: "Букет — Соцвет" },
      { name: "description", content: "Авторский букет мастерской Соцвет с доставкой по Москве." },
      { property: "og:title", content: "Букет — Соцвет" },
      { property: "og:description", content: "Авторский букет мастерской Соцвет с доставкой по Москве." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
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
    await addItem({ product, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity: 1, selectedOptions: variant.selectedOptions });
    toast.success("Добавлено в корзину", { description: p.title, position: "top-center" });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-8 md:px-10">
      <Link to="/catalog" className="eyebrow text-muted-foreground hover:text-primary">← Каталог</Link>
      <div className="mt-10 grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="aspect-[4/5] overflow-hidden bg-milk arch shadow-soft">
            {images[imgIdx] && <img src={images[imgIdx].url} alt={images[imgIdx].altText ?? p.title} className="h-full w-full object-cover" />}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((im, i) => (
                <button key={im.url} onClick={() => setImgIdx(i)} className={`h-24 w-20 overflow-hidden ${i === imgIdx ? "ring-2 ring-primary" : "opacity-60"}`}>
                  <img src={im.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-6 text-primary">Авторская композиция</p>
          <h1 className="display-lg">{p.title}</h1>
          <p className="mt-6 font-display text-4xl text-primary">{variant && formatPrice(variant.price.amount, variant.price.currencyCode)}</p>
          {p.description && <p className="mt-8 leading-relaxed text-muted-foreground">{p.description}</p>}

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

          <div className="mt-12 space-y-5 border-t pt-8 text-sm">
            <div className="grid grid-cols-[8rem_1fr] gap-4"><span className="eyebrow text-muted-foreground">Доставка</span><span>По Москве за 2–3 часа или ко времени</span></div>
            <div className="grid grid-cols-[8rem_1fr] gap-4"><span className="eyebrow text-muted-foreground">Уход</span><span>Подрежьте стебли и меняйте воду каждый день</span></div>
            <div className="grid grid-cols-[8rem_1fr] gap-4"><span className="eyebrow text-muted-foreground">Открытка</span><span>Бесплатно, с вашим текстом от руки</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
