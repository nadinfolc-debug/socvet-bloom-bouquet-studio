import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from 'react';
import { Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { DeliveryRequestDialog } from '@/components/site/DeliveryRequestDialog';

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Корзина — Соцвет" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "description", content: "Ваши выбранные букеты мастерской Соцвет." },
      { property: "og:title", content: "Корзина — Соцвет" },
      { property: "og:description", content: "Ваши выбранные букеты мастерской Соцвет." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem } = useCartStore();
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "EUR";

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-32 pt-12 md:px-10">
      <h1 className="display-xl mb-16" data-reveal>Корзина</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center" data-reveal>
          <p className="font-display text-4xl italic text-muted-foreground">Чувства ещё не обрели форму</p>
          <Button variant="petal" size="xl" className="mt-10" asChild><Link to="/catalog">Выбрать букет</Link></Button>
        </div>
      ) : (
        <div className="grid gap-16 md:grid-cols-12">
          <div className="divide-y border-y md:col-span-8" data-reveal>
            {items.map((item) => {
              const img = item.product.node.images.edges[0]?.node;
              return (
                <div key={item.variantId} className="flex gap-6 py-8">
                  <Link to="/product/$handle" params={{ handle: item.product.node.handle }} className="h-40 w-32 flex-shrink-0 overflow-hidden bg-milk arch">
                    {img && <img src={img.url} alt={item.product.node.title} className="h-full w-full object-cover" />}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <h2 className="font-display text-3xl">{item.product.node.title}</h2>
                    {item.variantTitle !== "Default Title" && <p className="mt-1 text-sm text-muted-foreground">{item.variantTitle}</p>}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="rounded-full border p-2 hover:border-primary" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} aria-label="Меньше"><Minus className="h-3 w-3" /></button>
                        <span>{item.quantity}</span>
                        <button className="rounded-full border p-2 hover:border-primary" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} aria-label="Больше"><Plus className="h-3 w-3" /></button>
                        <button className="eyebrow ml-4 text-muted-foreground hover:text-primary" onClick={() => removeItem(item.variantId)}>Удалить</button>
                      </div>
                      <span className="font-display text-2xl">{formatPrice(parseFloat(item.price.amount) * item.quantity, item.price.currencyCode)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <aside className="md:col-span-4" data-reveal data-delay="1">
            <div className="bg-milk p-8 md:sticky md:top-28">
              <p className="eyebrow mb-6">Ваш заказ</p>
              <div className="flex items-baseline justify-between border-b pb-6">
                <span>Итого</span>
                <span className="font-display text-4xl">{formatPrice(total, currency)}</span>
              </div>
               <p className="mt-6 text-sm text-muted-foreground">Оплата — отдельно после подтверждения заказа.</p>
               <Button variant="petal" size="xl" className="mt-8 w-full" onClick={() => setDeliveryOpen(true)} disabled={isLoading || isSyncing}>
                {isLoading || isSyncing ? <Loader2 className="animate-spin" /> : "Оформить заказ"}
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                Оформляя заказ, вы принимаете <Link to="/offer" className="underline">оферту</Link> и <Link to="/privacy" className="underline">политику конфиденциальности</Link>.
              </p>
            </div>
          </aside>
        </div>
      )}
      <DeliveryRequestDialog open={deliveryOpen} onOpenChange={setDeliveryOpen} />
    </div>
  );
}
