import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { storefrontApiRequest } from "@/lib/shopify";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { openShopifyCheckout } from "@/lib/checkout";

vi.mock("@/lib/shopify", () => ({ storefrontApiRequest: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const item = { variantId: "gid://shopify/ProductVariant/1", quantity: 1 } as CartItem;
const checkoutUrl = "https://example.myshopify.com/checkouts/from-shopify?key=test";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  useCartStore.setState({ items: [item], cartId: "cart", checkoutUrl, isSyncing: false });
});

describe("Shopify checkout", () => {
  it("repairs a persisted checkout URL and opens Shopify in a new tab synchronously", () => {
    const tab = { opener: window };
    const open = vi.spyOn(window, "open").mockReturnValue(tab as unknown as Window);
    expect(openShopifyCheckout()).toBe(true);
    expect(open).toHaveBeenCalledWith(`${checkoutUrl}&channel=online_store`, "_blank");
    expect(tab.opener).toBeNull();
  });

  it("refreshes the checkout URL from the existing Shopify cart", async () => {
    const fresh = "https://example.myshopify.com/checkouts/fresh";
    vi.mocked(storefrontApiRequest).mockResolvedValue({ data: { cart: { totalQuantity: 1, checkoutUrl: fresh } } });
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().getCheckoutUrl()).toBe(`${fresh}?channel=online_store`);
    expect(vi.mocked(storefrontApiRequest).mock.calls[0]?.[0]).toContain("checkoutUrl");
  });

  it("reports blocked tabs without treating checkout as opened", () => {
    vi.spyOn(window, "open").mockReturnValue(null);
    expect(openShopifyCheckout()).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });

  it("does not open a blank or invalid stored URL", () => {
    useCartStore.setState({ checkoutUrl: "about:blank", cartId: null });
    const open = vi.spyOn(window, "open");
    expect(openShopifyCheckout()).toBe(false);
    expect(open).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("preserves the cart when Shopify is temporarily unavailable", async () => {
    vi.mocked(storefrontApiRequest).mockRejectedValue(new Error("offline"));
    await useCartStore.getState().syncCart();
    expect(useCartStore.getState().checkoutUrl).toBe(checkoutUrl);
    expect(useCartStore.getState().items).toEqual([item]);
  });
});