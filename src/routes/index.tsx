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
  const { data: products, isLoading } = useQuery(productsQuery(4));

  return (
    <>
      {/* Спокойный блок: герой */}
      <section className="screen-block relative mx-auto flex max-w-[1400px] flex-col justify-center px-5 py-5 md:px-10 md:py-6">
        <div className="grid items-end gap-6 md:grid-cols-12 md:gap-10">
          <div className="animate-rise md:col-span-6 lg:col-span-5">
            <p className="eyebrow mb-3 text-primary md:mb-5">Авторская флористика · Москва</p>
            <h1 className="display-xl [font-size:clamp(2.3rem,min(11vw,6.5svh),3.6rem)] md:[font-size:clamp(3rem,min(8vw,11vh),8.5rem)]">
              Чувства<br />
              <em className="text-primary">обретают</em><br />
              форму
            </h1>
            <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed md:mt-5 md:text-lg text-muted-foreground">
              Выберите готовый букет или посоветуйтесь с флористом — и мы соберём ваш особенный.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap md:mt-6">
              <Button variant="petal" size="xl" className="h-12 px-3 text-[0.68rem] sm:h-14 sm:px-7 sm:text-xs" asChild>
                <Link to="/catalog">Смотреть букеты</Link>
              </Button>
              <Button variant="line" size="xl" className="h-12 px-3 text-[0.68rem] sm:h-14 sm:px-7 sm:text-xs" asChild>
                <Link to="/delivery">Доставка</Link>
              </Button>
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-7" data-reveal>
            <img src={hero} alt="Скульптурный букет с бордовыми ранункулюсами и сухими травами" width={1600} height={1104} className="mx-auto aspect-[1600/1104] h-[28svh] w-auto max-w-full object-cover md:mx-0 md:w-full md:h-auto shadow-soft md:max-h-[calc(100svh-24rem)]" />
          </div>
        </div>
        <Stats />
      </section>

      {/* Коллекция */}
      <section className="screen-block mx-auto flex max-w-[1400px] flex-col justify-center px-5 py-6 md:px-10 md:py-10">
        <div className="mb-5 flex items-end justify-between gap-6 md:mb-8" data-reveal>
          <h2 className="display-lg">Готовые<br /><em className="text-primary">букеты</em></h2>
          <Link to="/catalog" className="eyebrow border-b border-foreground pb-1 hover:border-primary hover:text-primary">
            Весь каталог →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-muted arch" />)}
          </div>
        ) : products && products.length > 0 ? (
          <>
          <div className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-pl-5 px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden [&>*]:w-full [&>*]:shrink-0 [&>*]:snap-start md:[&>*]:w-auto">
            {products.map((p, i) => <ProductCard key={p.node.id} product={p} index={i} compact />)}
          </div>
        <p className="mt-3 text-xs text-muted-foreground md:hidden">Листайте вбок →</p>
          </>
        ) : (
          <EmptyProducts />
        )}
      </section>

      <Florist />
      <HowWeWork />
      <Reviews />
      <Faq />

      {/* Насыщенный блок: мастерская */}
      <section className="screen-block relative flex flex-col justify-center overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-8 md:grid-cols-2 md:gap-16 md:px-10 md:py-10">
          <div data-reveal>
            <p className="eyebrow mb-4 opacity-80">Индивидуальный заказ</p>
            <h2 className="display-lg">Ваш особенный<br /><em className="text-blush">букет</em></h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed opacity-90 md:mt-6 md:text-base">
              Не нашли тот самый? Посоветуйтесь с флористом: расскажите о поводе, любимых цветах и бюджете. Вместе подберём сочетания и соберём букет на заказ.
            </p>
            <p className="mt-4 text-sm opacity-90 md:mt-6">Быстрее всего — написать флористу:</p>
            <MessengerButtons className="mt-3" />
            <RequestForm />
          </div>
          <img src={atelier} alt="Руки флориста собирают весенний букет" loading="lazy" width={1008} height={1312} className="hidden w-full max-w-md justify-self-end md:block object-cover md:max-h-fit-screen" data-reveal data-delay="1" />
        </div>
      </section>
    </>
  );
}
