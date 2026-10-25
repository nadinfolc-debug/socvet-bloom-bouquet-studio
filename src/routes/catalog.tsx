import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ProductCard, EmptyProducts } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Каталог букетов — Соцвет" },
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

  const list = useMemo(() => {
    const arr = [...(products ?? [])];
    const price = (p: (typeof arr)[number]) => Number(p.node.priceRange.minVariantPrice.amount);
    if (sort === "asc") arr.sort((a, b) => price(a) - price(b));
    if (sort === "desc") arr.sort((a, b) => price(b) - price(a));
    return arr;
  }, [products, sort]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-12 md:px-10">
      <header className="mb-20 grid gap-8 md:grid-cols-12 md:items-end">
        <h1 className="display-xl md:col-span-7">Каталог</h1>
        <p className="text-lg leading-relaxed text-muted-foreground md:col-span-4 md:col-start-9">
          Букеты собираются вручную в день доставки. Состав может меняться по сезону — характер остаётся.
        </p>
      </header>
      <div className="mb-14 flex flex-wrap gap-3 border-y py-5">
        {sorts.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            className={`eyebrow rounded-full px-5 py-2 transition-colors ${sort === s.id ? "bg-primary text-primary-foreground" : "hover:text-primary"}`}
          >
            {s.label}
          </button>
        ))}
        <span className="eyebrow ml-auto self-center text-muted-foreground">{list.length} композиций</span>
      </div>
      {isLoading ? (
        <div className="grid gap-12 md:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-muted arch" />)}
        </div>
      ) : list.length > 0 ? (
        <div className="grid gap-x-10 gap-y-20 md:grid-cols-3">
          {list.map((p, i) => <ProductCard key={p.node.id} product={p} index={i} />)}
        </div>
      ) : (
        <EmptyProducts />
      )}
    </div>
  );
}
