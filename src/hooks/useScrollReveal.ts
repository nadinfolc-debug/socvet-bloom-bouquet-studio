import { useEffect } from "react";
import gsap from "gsap";

/**
 * Плавное появление блоков при прокрутке (GSAP).
 *
 * Элементы с [data-reveal] скрыты (см. styles.css) и поднимаются снизу,
 * когда оказываются в поле зрения. Контент, загруженный позже (каталог,
 * карточка товара), подхватывается автоматически.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tweens = new Map<Element, gsap.core.Tween>();

    const reveal = () => {
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.hasAttribute("data-shown") || tweens.has(el)) return;
        if (el.getBoundingClientRect().top >= limit) return;

        el.setAttribute("data-shown", "");

        if (reduced) {
          gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
          return;
        }

        const delay = Number(el.dataset.delay || 0) * 0.11;
        const tween = gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            delay,
            ease: "power3.out",
            overwrite: true,
            clearProps: "transform",
            onComplete: () => {
              tweens.delete(el);
            },
          },
        );
        tweens.set(el, tween);
      });
    };

    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        reveal();
      });
    };

    reveal();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const mutation = new MutationObserver(schedule);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mutation.disconnect();

      // Strict Mode: сбрасываем, чтобы повторный mount снова показал блоки
      tweens.forEach((tween) => tween.kill());
      tweens.clear();
      document.querySelectorAll<HTMLElement>("[data-reveal][data-shown]").forEach((el) => {
        el.removeAttribute("data-shown");
        gsap.set(el, { clearProps: "opacity,transform,visibility" });
      });
    };
  }, []);
}
