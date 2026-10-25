import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";

const nav = [
  { to: "/catalog", label: "Каталог" },
  { to: "/delivery", label: "Доставка" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <nav className="hidden flex-1 gap-8 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="eyebrow hover:text-primary" activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Меню">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Logo />
        <div className="flex flex-1 items-center justify-end gap-8">
          <span className="eyebrow hidden text-muted-foreground lg:inline">Москва</span>
          <CartDrawer />
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t px-6 py-6 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-display text-3xl">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
