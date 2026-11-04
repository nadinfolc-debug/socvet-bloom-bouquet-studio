import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";

const nav = [
  { to: "/catalog", label: "Каталог" },
  { to: "/delivery", label: "Доставка" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between h-14 px-3 md:h-auto md:px-10 md:py-5">
        <nav aria-label="Основное меню" className="hidden flex-1 gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="eyebrow hover:text-primary" activeProps={{ className: "text-primary", "aria-current": "page" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button
          ref={btn}
          type="button"
          className="grid h-11 w-11 place-items-center md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
        <Logo />
        <div className="flex flex-1 items-center justify-end gap-8">
          <span className="eyebrow hidden text-muted-foreground lg:inline">Москва</span>
          <CartDrawer />
        </div>
      </div>
      {open && (
        <nav ref={menu} id="mobile-menu" aria-label="Мобильное меню" className="flex flex-col gap-1 border-t px-6 py-4 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 font-display text-3xl" activeProps={{ "aria-current": "page" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/demo" onClick={() => setOpen(false)} className="eyebrow mt-2 border-t py-4 text-primary">
            Демо панели управления →
          </Link>
        </nav>
      )}
    </header>
  );
}
