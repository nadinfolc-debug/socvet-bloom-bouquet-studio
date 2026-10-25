import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";

export function openShopifyCheckout(): boolean {
  const { items, getCheckoutUrl, syncCart } = useCartStore.getState();
  const url = getCheckoutUrl();
  if (!items.length || !url) {
    toast.error("Не удалось открыть оформление заказа", {
      description: "Обновите корзину и попробуйте ещё раз.",
    });
    void syncCart();
    return false;
  }

  // Open synchronously from the click: awaiting a request first can block the tab.
  try {
    const checkout = window.open(url, "_blank");
    if (!checkout) {
      toast.error("Браузер заблокировал страницу оплаты", {
        description: "Разрешите открытие новых вкладок для этого сайта и попробуйте снова.",
      });
      return false;
    }
    checkout.opener = null;
    return true;
  } catch {
    toast.error("Не удалось открыть страницу оплаты. Попробуйте ещё раз.");
    return false;
  }
}