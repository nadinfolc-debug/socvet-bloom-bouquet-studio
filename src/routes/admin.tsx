import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SHOPIFY_ADMIN_URL } from "@/lib/shopify";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Панель мастерской — Соцвет" },
      { name: "description", content: "Управление заказами и товарами мастерской Соцвет." },
      { property: "og:title", content: "Панель мастерской — Соцвет" },
      { property: "og:description", content: "Управление заказами и товарами." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const tiles = [
  { t: "Заказы", d: "Все оформленные заказы с адресами, временем доставки и оплатой.", path: "/orders" },
  { t: "Товары", d: "Добавляйте новые букеты, меняйте фото, цены, описания и наличие.", path: "/products" },
  { t: "Новый букет", d: "Сразу перейти к созданию новой позиции в каталоге.", path: "/products/new" },
];

function Admin() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-12 md:px-10">
      <p className="eyebrow mb-6 text-primary">Только для команды</p>
      <h1 className="display-xl">Мастерская</h1>
      <p className="mt-8 max-w-xl text-muted-foreground">Заказы и каталог хранятся в защищённой панели магазина — изменения сразу появляются на сайте.</p>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {tiles.map((t) => (
          <a key={t.t} href={`${SHOPIFY_ADMIN_URL}${t.path}`} target="_blank" rel="noopener noreferrer" className="group bg-milk p-10 transition-colors hover:bg-primary hover:text-primary-foreground">
            <h2 className="text-5xl">{t.t}</h2>
            <p className="mt-4 text-sm opacity-75">{t.d}</p>
            <span className="eyebrow mt-10 inline-block">Открыть →</span>
          </a>
        ))}
      </div>
      <Button variant="ink" size="xl" className="mt-12" asChild>
        <a href={SHOPIFY_ADMIN_URL} target="_blank" rel="noopener noreferrer">Вся панель управления</a>
      </Button>
    </div>
  );
}
