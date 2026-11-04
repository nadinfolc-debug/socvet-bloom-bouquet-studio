import { Link } from "@tanstack/react-router";
import { ADDRESS, EMAIL, HOURS, PHONE, PHONE_HREF } from "@/lib/contacts";

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1400px] px-6 pb-24 pt-16 md:px-10">
        <p className="display-lg max-w-4xl italic" data-reveal>Чувства обретают форму.</p>
        <div className="mt-20 grid gap-10 text-sm sm:grid-cols-2 lg:grid-cols-4" data-reveal data-delay="1">
          <div>
            <p className="eyebrow mb-4 opacity-60">Мастерская</p>
            <p className="leading-relaxed opacity-80">{ADDRESS}<br />{HOURS}</p>
          </div>
          <div>
            <p className="eyebrow mb-4 opacity-60">Связь</p>
            <p className="leading-relaxed opacity-80"><a href={PHONE_HREF} className="hover:opacity-100">{PHONE}</a><br /><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="eyebrow mb-2 opacity-60">Покупателям</p>
            <Link to="/catalog" className="opacity-80 hover:opacity-100">Каталог</Link>
            <Link to="/delivery" className="opacity-80 hover:opacity-100">Доставка и оплата</Link>
            <Link to="/cart" className="opacity-80 hover:opacity-100">Корзина</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="eyebrow mb-2 opacity-60">Документы</p>
            <Link to="/privacy" className="opacity-80 hover:opacity-100">Политика конфиденциальности</Link>
            <Link to="/offer" className="opacity-80 hover:opacity-100">Публичная оферта</Link>
            <Link to="/demo" className="opacity-80 hover:opacity-100">Демо панели управления</Link>
            <Link to="/admin" className="opacity-50 hover:opacity-100">Вход для команды</Link>
          </div>
        </div>
        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-ink-foreground/15 pt-6 text-xs opacity-60 md:flex-row" data-reveal>
          <span>© {new Date().getFullYear()} Соцвет — созвучие цветов и оттенков</span>
          <span>Концепт-проект для портфолио · данные и отзывы вымышлены</span>
        </div>
      </div>
    </footer>
  );
}
