import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Доставка и оплата — Соцвет" },
      { name: "description", content: "Доставка авторских букетов по Москве: сроки, зоны и способы оплаты." },
      { property: "og:title", content: "Доставка и оплата — Соцвет" },
      { property: "og:description", content: "Доставка авторских букетов по Москве: сроки, зоны и способы оплаты." },
    ],
  }),
  component: Delivery,
});

const zones = [
  { t: "В пределах МКАД", d: "2–3 часа или к точному времени", p: "от 500 ₽" },
  { t: "За МКАД до 15 км", d: "3–4 часа", p: "от 900 ₽" },
  { t: "Ночная доставка", d: "с 22:00 до 8:00 по договорённости", p: "от 1 500 ₽" },
];

function Delivery() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-12 md:px-10">
      <h1 className="display-xl">Доставка</h1>
      <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Мы бережно привозим букеты по Москве в фирменной упаковке с водой — чтобы композиция сохранила форму в пути.
      </p>
      <div className="mt-20 divide-y border-y">
        {zones.map((z) => (
          <div key={z.t} className="grid gap-4 py-10 md:grid-cols-12 md:items-baseline">
            <h2 className="text-4xl md:col-span-5">{z.t}</h2>
            <p className="text-muted-foreground md:col-span-4">{z.d}</p>
            <p className="font-display text-3xl text-primary md:col-span-3 md:text-right">{z.p}</p>
          </div>
        ))}
      </div>
      <div className="mt-24 grid gap-16 md:grid-cols-3">
        <div><p className="eyebrow mb-4 text-primary">Оплата</p><p className="leading-relaxed text-muted-foreground">Банковской картой онлайн при оформлении заказа.</p></div>
        <div><p className="eyebrow mb-4 text-primary">Фото перед отправкой</p><p className="leading-relaxed text-muted-foreground">Пришлём фотографию готового букета, прежде чем курьер выедет.</p></div>
        <div><p className="eyebrow mb-4 text-primary">Анонимно</p><p className="leading-relaxed text-muted-foreground">Можем не раскрывать отправителя — просто отметьте это в комментарии.</p></div>
      </div>
    </div>
  );
}
