import { useEffect } from "react";

/**
 * Плавное появление блоков при прокрутке.
 *
 * Элементы с атрибутом [data-reveal] скрыты (см. styles.css) и поднимаются,
 * когда оказываются в поле зрения. Контент, загруженный позже (каталог,
 * карточка товара), подхватывается автоматически.
 */
export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;

    const reveal = () => {
      const limit = window.innerHeight * 0.92;
      document
        .querySelectorAll("[data-reveal]:not(.is-revealed)")
        .forEach((el) => {
          if (el.getBoundingClientRect().top < limit) el.classList.add("is-revealed");
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
      root.classList.remove("js-reveal");
    };
  }, []);
}
