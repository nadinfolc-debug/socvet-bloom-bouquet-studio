import { Link } from "@tanstack/react-router";

/** Wordmark «СОЦВЕТ»: the «О» is drawn as a single soft petal — the one plastic detail. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-baseline font-display text-3xl font-semibold tracking-[0.08em] ${className}`} aria-label="СОЦВЕТ — на главную">
      <span>С</span>
      <svg viewBox="0 0 40 52" className="mx-[0.06em] h-[0.78em] w-[0.6em] translate-y-[0.04em] text-primary transition-transform duration-700 group-hover:rotate-12" aria-hidden>
        <path d="M20 2 C34 14 38 30 30 44 C26 50 14 50 10 44 C2 30 6 14 20 2 Z" fill="currentColor" />
        <path d="M20 10 C22 24 22 36 19 46" stroke="var(--color-background)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      <span>ЦВЕТ</span>
    </Link>
  );
}
