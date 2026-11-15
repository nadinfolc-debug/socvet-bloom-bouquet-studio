import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductCard, EmptyProducts } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Каталог букетов — Соцвет" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "description", content: "Авторские букеты и скульптурные композиции с доставкой по Москве." },
      { property: "og:title", content: "Каталог букетов — Соцвет" },
      { property: "og:description", content: "Авторские букеты и скульптурные композиции с доставкой по Москве." },
    ],
  }),
  component: Catalog,
});

const sorts = [
  { id: "new", label: "Новое" },
  { id: "asc", label: "Сначала нежнее" },
  { id: "desc", label: "Сначала роскошнее" },
] as const;

function Catalog() {
  const { data: products, isLoading } = useQuery(productsQuery(100));
  const [sort, setSort] = useState<(typeof sorts)[number]["id"]>("new");
  const [collection, setCollection] = useState<string | null>(null);
  const collections = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products ?? []) for (const c of p.node.collections?.nodes ?? []) if (!/^home ?page$/i.test(c.title)) map.set(c.id, c.title);
    return [...map].map(([id, title]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }, [products]);

  const list = useMemo(() => {
    const arr = (products ?? []).filter((p) => !collection || p.node.collections?.nodes.some((c) => c.id === collection));
    const price = (p: (typeof arr)[number]) => Number(p.node.priceRange.minVariantPrice.amount);
    if (sort === "asc") arr.sort((a, b) => price(a) - price(b));
    if (sort === "desc") arr.sort((a, b) => price(b) - price(a));
    return arr;
  }, [products, sort, collection]);

  return (
    <div className="mx-auto max-w-[1400px] px-2.5 pb-16 pt-2 md:px-10 md:pb-24 md:pt-8">
      <header className="mb-2 grid gap-2 md:mb-8 md:grid-cols-12 md:items-end md:gap-4" data-reveal>
        <h1 className="font-display text-xl leading-none tracking-tight md:col-span-7 md:text-[clamp(2.25rem,min(6vw,8.5vh),5.5rem)] md:leading-[1.05] md:tracking-[-0.03em]">
          Каталог
        </h1>
        <p className="hidden text-lg leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9 md:block">
          Букеты собираются вручную в день доставки. Состав может меняться по сезону — характер остаётся.
        </p>
      </header>
      <div role="group" aria-label="Сортировка по цене" className="-mx-2.5 mb-1.5 flex gap-1.5 overflow-x-auto border-y px-2.5 py-1.5 md:mx-0 md:mb-6 md:flex-wrap md:gap-2 md:px-0 md:py-3" data-reveal data-delay="1">
        {sorts.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSort(s.id)}
            aria-pressed={sort === s.id}
            className={`eyebrow min-h-8 shrink-0 rounded-full px-2.5 text-[11px] transition-colors md:min-h-11 md:px-5 md:text-xs ${sort === s.id ? "bg-primary text-primary-foreground" : "hover:text-primary"}`}
          >
            {s.label}
          </button>
        ))}
        <span className="eyebrow ml-auto hidden shrink-0 self-center text-muted-foreground md:inline" role="status" aria-live="polite">{list.length} композиций</span>
      </div>
      {collections.length > 0 && (
        <div role="group" aria-label="Подборки" className="-mx-2.5 mb-2 flex gap-1.5 overflow-x-auto px-2.5 md:mx-0 md:mb-10 md:flex-wrap md:gap-2 md:px-0" data-reveal data-delay="2">
          {[{ id: null, title: "Все букеты" }, ...collections].map((c) => (
            <button type="button" key={c.id ?? "all"} onClick={() => setCollection(c.id)} aria-pressed={collection === c.id}
              className={`min-h-8 shrink-0 rounded-full border px-2.5 text-[11px] transition-colors md:min-h-11 md:px-5 md:text-sm ${collection === c.id ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary hover:text-primary"}`}>
              {c.title}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:gap-10 lg:grid-cols-4" aria-busy="true" aria-label="Загрузка букетов">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-square animate-pulse rounded-sm bg-muted md:aspect-[4/5]" />)}
        </div>
      ) : list.length > 0 ? (
        <ul className="grid grid-cols-2 gap-x-2 gap-y-3 md:gap-x-8 md:gap-y-14 lg:grid-cols-4" aria-label="Букеты">
          {list.map((p, i) => <li key={p.node.id}><ProductCard product={p} index={i} dense /></li>)}
        </ul>
      ) : (
        <EmptyProducts />
      )}
    </div>
  );
}
