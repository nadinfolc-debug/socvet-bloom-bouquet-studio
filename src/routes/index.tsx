import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard, EmptyProducts } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/queries";
import atelier from "@/assets/atelier.jpg";
import { Hero } from "@/components/site/Hero";
import { HowWeWork, Reviews, MessengerButtons, Stats, Florist, Faq } from "@/components/site/HomeSections";
import { RequestForm } from "@/components/site/RequestForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Соцвет — цветы как искусство | Авторская флористика, Москва" },
      {
        name: "description",
        content:
          "Скульптурные букеты, необычные сочетания и выразительные композиции. Доставка по Москве. Чувства обретают форму.",
      },
      { property: "og:title", content: "Соцвет — цветы как искусство" },
      {
        property: "og:description",
        content: "Авторская флористика в Москве. Чувства обретают форму.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products, isLoading } = useQuery(productsQuery(4));

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-[1400px] px-5 py-8 md:px-10 md:py-10">
        <Stats />
      </section>

      <section className="screen-block mx-auto flex max-w-[1400px] flex-col justify-center px-5 py-6 md:px-10 md:py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 md:mb-8" data-reveal>
          <h2 className="display-lg">
            Готовые
            <br />
            <em className="text-primary">букеты</em>
          </h2>
          <Link
            to="/catalog"
            className="eyebrow border-b border-foreground pb-1 hover:border-primary hover:text-primary"
          >
            Весь каталог →
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-muted" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.node.id} product={p} index={i} compact />
            ))}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </section>

      <Florist />
      <HowWeWork />
      <Reviews />
      <Faq />

      <section
        id="individual-order"
        className="screen-block relative flex flex-col justify-center bg-ink text-ink-foreground"
      >
        <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-5 py-8 md:grid-cols-2 md:gap-16 md:px-10 md:py-10">
          <div data-reveal>
            <p className="eyebrow mb-4 opacity-80">Индивидуальный заказ</p>
            <h2 className="display-lg">
              Ваш особенный
              <br />
              <em className="text-blush">букет</em>
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed opacity-90 md:mt-6 md:text-base">
              Не нашли тот самый? Посоветуйтесь с флористом: расскажите о поводе, любимых цветах и
              бюджете. Вместе подберём сочетания и соберём букет на заказ.
            </p>
            <p className="mt-4 text-sm opacity-90 md:mt-6">Быстрее всего — написать флористу:</p>
            <MessengerButtons className="mt-3" />
            <RequestForm />
          </div>
          <img
            src={atelier}
            alt="Руки флориста собирают весенний букет"
            loading="lazy"
            width={1008}
            height={1312}
            className="editorial-photo mx-auto max-w-md"
            data-reveal
            data-delay="1"
          />
        </div>
      </section>
    </>
  );
}
