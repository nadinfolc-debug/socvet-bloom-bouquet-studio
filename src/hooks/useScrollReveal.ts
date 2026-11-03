import { useEffect } from "react";

/**
 * Плавное появление блоков при прокрутке.
 *
 * Элементы с атрибутом [data-reveal] скрыты (см. styles.css) и поднимаются,
 * когда попадают в поле зрения. Контент, загруженный позже (каталог, карточка
 * товара), подхватывается автоматически.
 */
export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;

    if (!("IntersectionObserver" in window)) {
      root.classList.remove("js-reveal");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    let scheduled = false;
    const scan = () => {
      scheduled = false;
      document
        .querySelectorAll("[data-reveal]:not(.is-revealed)")
        .forEach((el) => observer.observe(el));
    };

    scan();

    const mutation = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(scan);
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);
}
