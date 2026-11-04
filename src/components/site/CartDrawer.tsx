import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import { DeliveryRequestDialog } from '@/components/site/DeliveryRequestDialog';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, syncCart } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "EUR";

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    setIsOpen(false);
    setDeliveryOpen(true);
  };

  return (
    <><Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="eyebrow relative flex min-h-11 min-w-11 items-center justify-center gap-2 hover:text-primary" aria-label="Открыть корзину">
          Корзина
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[0.65rem] tracking-normal text-primary-foreground">
            {totalItems}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-4xl font-medium">Ваш букет чувств</SheetTitle>
          <SheetDescription>{totalItems === 0 ? "Пока здесь пусто" : `Позиций: ${totalItems}`}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col pt-6">
          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
              <p className="font-display text-2xl italic text-muted-foreground">Чувства ещё не обрели форму</p>
              <Button variant="line" asChild onClick={() => setIsOpen(false)}>
                <Link to="/catalog">В каталог</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4">
                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-muted arch">
                      {item.product.node.images?.edges?.[0]?.node && (
                        <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-display text-xl">{item.product.node.title}</h4>
                      {item.variantTitle !== "Default Title" && (
                        <p className="text-xs text-muted-foreground">{item.selectedOptions.map((o) => o.value).join(" · ")}</p>
                      )}
                      <p className="mt-1 text-sm font-semibold">{formatPrice(item.price.amount, item.price.currencyCode)}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button className="grid h-11 w-11 place-items-center rounded-full border hover:border-primary" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} aria-label={`Уменьшить количество: ${item.product.node.title}`}><Minus className="h-3 w-3" /></button>
                        <span className="w-4 text-center text-sm" aria-live="polite" aria-label={`Количество: ${item.quantity}`}>{item.quantity}</span>
                        <button className="grid h-11 w-11 place-items-center rounded-full border hover:border-primary" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} aria-label={`Увеличить количество: ${item.product.node.title}`}><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="-mr-3 -mt-3 grid h-11 w-11 place-items-center self-start text-muted-foreground hover:text-primary" aria-label={`Удалить из корзины: ${item.product.node.title}`}><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div className="space-y-4 border-t pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="eyebrow">Итого</span>
                  <span className="font-display text-3xl">{formatPrice(totalPrice, currency)}</span>
                </div>
                <Button variant="petal" size="xl" className="w-full" onClick={handleCheckout} disabled={isLoading || isSyncing}>
                  {isLoading || isSyncing ? <Loader2 className="animate-spin" /> : "Оформить заказ"}
                </Button>
                <Link to="/cart" onClick={() => setIsOpen(false)} className="eyebrow block text-center text-muted-foreground hover:text-primary">
                  Открыть корзину целиком
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet><DeliveryRequestDialog open={deliveryOpen} onOpenChange={setDeliveryOpen} /></>
  );
}
