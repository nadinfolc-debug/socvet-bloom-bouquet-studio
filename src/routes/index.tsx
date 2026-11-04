import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductCard, EmptyProducts } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import hero from "@/assets/hero.jpg";
import atelier from "@/assets/atelier.jpg";
import { HowWeWork, Reviews, MessengerButtons, Stats, Florist, Faq } from '@/components/site/HomeSections';
import { RequestForm } from '@/components/site/RequestForm';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Соцвет — цветы как искусство | Авторская флористика, Москва" },
      { name: "description", content: "Скульптурные букеты, необычные сочетания и выразительные композиции. Доставка по Москве. Чувства обретают форму." },
      { property: "og:title", content: "Соцвет — цветы как искусство" },
      { property: "og:description", content: "Авторская флористика в Москве. Чувства обретают форму." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useScrollReveal();
  const { data: products, isLoading } = useQuery(productsQuery(6));

  return (
    <>
      {/* Спокойный блок: герой */}
      <section className="relative mx-auto max-w-[1400px] px-6 pb-12 pt-4 md:px-10 md:pb-14">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="animate-rise md:col-span-5">
            <p className="eyebrow mb-6 text-primary">Авторская флористика · Москва</p>
            <h1 className="display-xl">
              Чувства<br />
              <em className="text-primary">обретают</em><br />
              форму
            </h1>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-muted-foreground">
              Выберите готовый букет или посоветуйтесь с флористом — и мы соберём ваш особенный.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="petal" size="xl" asChild>
                <Link to="/catalog">Смотреть букеты</Link>
              </Button>
              <Button variant="line" size="xl" asChild>
                <Link to="/delivery">Доставка</Link>
              </Button>
            </div>
          </div>
          <div className="md:col-span-7" data-reveal>
            <img src={hero} alt="Скульптурный букет с бордовыми ранункулюсами и сухими травами" width={1600} height={1104} className="w-full max-h-[70vh] object-cover shadow-soft md:max-h-fit-screen" />
          </div>
        </div>
      </section>

      <Stats />

      {/* Коллекция */}
      <section className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-14">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
          <h2 className="display-lg">Готовые<br /><em className="text-primary">букеты</em></h2>
          <Link to="/catalog" className="eyebrow border-b border-foreground pb-1 hover:border-primary hover:text-primary">
            Весь каталог →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-12 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-muted arch" />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-x-10 gap-y-14 md:grid-cols-3">
            {products.map((p, i) => <ProductCard key={p.node.id} product={p} index={i} />)}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </section>

      <Florist />
      <HowWeWork />
      <Reviews />
      <Faq />

      {/* Насыщенный блок: мастерская */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 py-16 md:grid-cols-2 md:px-10 md:py-14">
          <div data-reveal>
            <p className="eyebrow mb-6 opacity-60">Индивидуальный заказ</p>
            <h2 className="display-lg">Ваш особенный<br /><em className="text-blush">букет</em></h2>
            <p className="mt-8 max-w-md leading-relaxed opacity-75">
              Не нашли тот самый? Посоветуйтесь с флористом: расскажите о поводе, любимых цветах и бюджете. Вместе подберём сочетания и соберём букет на заказ.
            </p>
            <p className="mt-6 text-sm opacity-75">Быстрее всего — написать флористу:</p>
            <MessengerButtons className="mt-3" />
            <RequestForm />
          </div>
          <img src={atelier} alt="Руки флориста собирают весенний букет" loading="lazy" width={1008} height={1312} className="w-full max-w-md justify-self-end max-h-[70vh] object-cover md:max-h-fit-screen" data-reveal data-delay="1" />
        </div>
      </section>
    </>
  );
}
