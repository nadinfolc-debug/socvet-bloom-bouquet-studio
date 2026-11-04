import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

/** Full-bleed первый экран: бренд, одна фраза, один CTA, фото на весь viewport. */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const parts = el.querySelectorAll("[data-hero-enter]");
    const media = el.querySelector("[data-hero-media]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(parts, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(media, { scale: 1.08 }, { scale: 1, duration: 1.6, ease: "power2.out" });
      gsap.fromTo(
        parts,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.95, stagger: 0.12, ease: "power3.out", delay: 0.15 },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[calc(100svh-var(--header-h))] w-full flex-col justify-end overflow-hidden"
      aria-label="Главный экран"
    >
      <img
        data-hero-media
        src={hero}
        alt="Скульптурный букет с бордовыми ранункулюсами и сухими травами"
        width={1600}
        height={1104}
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />
      {/* Читаемость текста — мягкая тень снизу, без карточек и бейджей */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,oklch(0.2_0.025_270/0.72)_0%,oklch(0.2_0.025_270/0.28)_42%,transparent_72%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-10 pt-24 md:px-10 md:pb-14">
        <p
          data-hero-enter
          className="font-display text-[clamp(2.75rem,8vw,5.5rem)] font-semibold italic leading-none tracking-[0.02em] text-ink-foreground opacity-0"
        >
          С
          <svg
            viewBox="0 0 40 52"
            className="mx-[0.03em] inline-block h-[0.52em] w-[0.4em] text-blush align-baseline"
            aria-hidden
          >
            <path
              d="M20 2 C34 14 38 30 30 44 C26 50 14 50 10 44 C2 30 6 14 20 2 Z"
              fill="currentColor"
            />
            <path
              d="M20 10 C22 24 22 36 19 46"
              stroke="oklch(0.2 0.025 270)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          цвет
        </p>
        <h1
          data-hero-enter
          className="mt-4 max-w-xl font-display text-[clamp(1.85rem,4.5vw,3.25rem)] font-medium leading-[1.08] tracking-[-0.03em] text-ink-foreground opacity-0"
        >
          Чувства обретают форму
        </h1>
        <p
          data-hero-enter
          className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-foreground/85 opacity-0 md:text-base"
        >
          Авторская флористика в Москве — готовый букет или сборка с флористом.
        </p>
        <div data-hero-enter className="mt-6 opacity-0">
          <Button
            variant="petal"
            size="xl"
            className="min-h-12 bg-blush text-ink hover:bg-ink-foreground hover:text-ink"
            asChild
          >
            <Link to="/catalog">Смотреть букеты</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
