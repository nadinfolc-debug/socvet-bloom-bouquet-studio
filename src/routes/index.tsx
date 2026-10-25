import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductCard, EmptyProducts } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import hero from "@/assets/hero.jpg";
import atelier from "@/assets/atelier.jpg";
import sculpture from "@/assets/sculpture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "СОЦВЕТ — цветы как искусство | Авторская флористика, Москва" },
      { name: "description", content: "Скульптурные букеты, необычные сочетания и выразительные композиции. Доставка по Москве. Чувства обретают форму." },
      { property: "og:title", content: "СОЦВЕТ — цветы как искусство" },
      { property: "og:description", content: "Авторская флористика в Москве. Чувства обретают форму." },
    ],
  }),
  component: Index,
});

const principles = [
  { n: "01", t: "Свободный силуэт", d: "Мы не собираем шары. Каждый букет — живой жест с асимметрией и дыханием." },
  { n: "02", t: "Смелые сочетания", d: "Бордовая калла рядом с цветущей вишней, сухие травы с садовой розой." },
  { n: "03", t: "Сезонность", d: "Работаем с тем, что цветёт сейчас — поэтому каждая композиция неповторима." },
];

function Index() {
  const { data: products, isLoading } = useQuery(productsQuery(6));

  return (
    <>
      {/* Спокойный блок: герой */}
      <section className="relative mx-auto max-w-[1400px] px-6 pb-24 pt-8 md:px-10">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="animate-rise md:col-span-5">
            <p className="eyebrow mb-8 text-primary">Авторская флористика · Москва</p>
            <h1 className="display-xl">
              Чувства<br />
              <em className="text-primary">обретают</em><br />
              форму
            </h1>
            <p className="mt-8 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Созвучие цветов и оттенков. Скульптурные букеты для тех, кому важно сказать больше, чем словами.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button variant="petal" size="xl" asChild>
                <Link to="/catalog">Смотреть букеты</Link>
              </Button>
              <Button variant="line" size="xl" asChild>
                <Link to="/delivery">Доставка</Link>
              </Button>
            </div>
          </div>
          <div className="md:col-span-7">
            <img src={hero} alt="Скульптурный букет с бордовыми ранункулюсами и сухими травами" width={1600} height={1104} className="w-full shadow-soft" />
          </div>
        </div>
      </section>

      {/* Насыщенный блок: манифест */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
          <p className="eyebrow mb-10 opacity-70">Манифест</p>
          <p className="display-lg max-w-5xl">
            Мы относимся к цветам как к <em>скульптуре</em> — с изгибом, светом и тенью.
          </p>
        </div>
      </section>

      {/* Коллекция */}
      <section className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display-lg">Сейчас<br /><em className="text-primary">в мастерской</em></h2>
          <Link to="/catalog" className="eyebrow border-b border-foreground pb-1 hover:border-primary hover:text-primary">
            Весь каталог →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-12 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-muted arch" />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-x-10 gap-y-20 md:grid-cols-3">
            {products.map((p, i) => <ProductCard key={p.node.id} product={p} index={i} />)}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </section>

      {/* Спокойный блок: принципы с фото */}
      <section className="bg-milk">
        <div className="mx-auto grid max-w-[1400px] gap-16 px-6 py-28 md:grid-cols-12 md:px-10 md:py-40">
          <div className="md:col-span-5">
            <img src={sculpture} alt="Калла и цветущая вишня в чёрной вазе" loading="lazy" width={1008} height={1312} className="w-full arch" />
          </div>
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <p className="eyebrow mb-6 text-primary">Почерк</p>
            <h2 className="display-lg mb-14">Каждая композиция — <em>жест</em></h2>
            <div className="space-y-10">
              {principles.map((p) => (
                <div key={p.n} className="grid grid-cols-[3rem_1fr] gap-4 border-t pt-6">
                  <span className="font-display text-xl italic text-primary">{p.n}</span>
                  <div>
                    <h3 className="text-3xl">{p.t}</h3>
                    <p className="mt-2 text-muted-foreground">{p.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Насыщенный блок: мастерская */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 py-28 md:grid-cols-2 md:px-10 md:py-36">
          <div>
            <p className="eyebrow mb-6 opacity-60">Индивидуальный заказ</p>
            <h2 className="display-lg">Расскажите о чувстве — <em className="text-blush">мы найдём ему форму</em></h2>
            <p className="mt-8 max-w-md leading-relaxed opacity-75">
              Свадьбы, события, оформление пространств и букеты по вашему настроению. Напишите нам — флорист свяжется в течение часа.
            </p>
            <Button variant="petal" size="xl" className="mt-10" asChild>
              <a href="mailto:hello@socvet.ru">Написать флористу</a>
            </Button>
          </div>
          <img src={atelier} alt="Руки флориста собирают весенний букет" loading="lazy" width={1008} height={1312} className="w-full max-w-md justify-self-end" />
        </div>
      </section>
    </>
  );
}
