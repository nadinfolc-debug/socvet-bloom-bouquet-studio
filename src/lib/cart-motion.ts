import gsap from "gsap";

/** Мини-фото «летит» к корзине; счётчик пульсирует. */
export function flyImageToCart(fromEl: HTMLElement | null, imageUrl: string | undefined) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    pulseCartBadge();
    return;
  }

  const cart = document.querySelector<HTMLElement>("[data-cart-trigger]");
  if (!cart || !fromEl || !imageUrl) {
    pulseCartBadge();
    return;
  }

  const from = fromEl.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  const ghost = document.createElement("img");
  ghost.src = imageUrl;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - 28}px`,
    top: `${from.top + from.height / 2 - 36}px`,
    width: "56px",
    height: "72px",
    objectFit: "contain",
    zIndex: "80",
    pointerEvents: "none",
    borderRadius: "4px",
    background: "oklch(0.95 0.022 78)",
    boxShadow: "0 12px 28px -12px oklch(0.36 0.12 15 / 0.45)",
  } as CSSStyleDeclaration);
  document.body.appendChild(ghost);

  gsap.to(ghost, {
    left: to.left + to.width / 2 - 14,
    top: to.top + to.height / 2 - 14,
    width: 28,
    height: 28,
    opacity: 0.35,
    duration: 0.75,
    ease: "power3.inOut",
    onComplete: () => {
      ghost.remove();
      pulseCartBadge();
    },
  });
}

export function pulseCartBadge() {
  const badge = document.querySelector<HTMLElement>("[data-cart-count]");
  if (!badge) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.fromTo(
    badge,
    { scale: 1 },
    { scale: 1.28, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" },
  );
}
