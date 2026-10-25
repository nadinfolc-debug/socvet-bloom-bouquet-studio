import { Link } from "@tanstack/react-router";

/** Wordmark «Соцвет»: the lowercase «о» is drawn as a single soft petal — the one plastic detail. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-baseline font-display text-4xl font-semibold italic tracking-[0.02em] ${className}`} aria-label="Соцвет — на главную">
      <span>С</span>
      <svg viewBox="0 0 40 52" className="mx-[0.03em] h-[0.52em] w-[0.4em] text-primary transition-transform duration-700 group-hover:rotate-12" aria-hidden>
        <path d="M20 2 C34 14 38 30 30 44 C26 50 14 50 10 44 C2 30 6 14 20 2 Z" fill="currentColor" />
        <path d="M20 10 C22 24 22 36 19 46" stroke="var(--color-background)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      <span>цвет</span>
    </Link>
  );
}
