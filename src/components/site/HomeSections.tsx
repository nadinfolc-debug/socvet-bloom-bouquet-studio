import { MAX_URL, TELEGRAM_URL, VK_URL } from '@/lib/contacts';

const steps = [
  ['01', 'Выбор или совет', 'Выберите готовый букет в каталоге или напишите флористу — подберём под повод и бюджет.'],
  ['02', 'Фото перед отправкой', 'Пришлём фотографию собранного букета, чтобы вы увидели его до доставки.'],
  ['03', 'Бережная доставка', 'Курьер привезёт букет в аквабоксе к выбранному интервалу по Москве.'],
];

const reviews = [
  ['Анна', 'День рождения мамы', 'Букет оказался ещё красивее, чем на фото. Мама сказала, что такого ей не дарили никогда.'],
  ['Михаил', 'Свидание', 'Посоветовался с флористом в Telegram, за час собрали что-то совершенно особенное. Спасибо!'],
  ['Елена', 'Юбилей коллеги', 'Привезли точно в интервал, прислали фото заранее. Цветы стояли больше недели.'],
];

export function HowWeWork() {
  return <section className="mx-auto max-w-[1400px] px-6 py-28 md:px-10">
    <h2 className="display-lg mb-16" data-reveal>Как мы<br /><em className="text-primary">работаем</em></h2>
    <div className="grid gap-12 md:grid-cols-3">{steps.map(([n, t, d], i) => <div key={n} className="border-t border-foreground/20 pt-6" data-reveal data-delay={i}>
      <p className="font-display text-5xl italic text-primary">{n}</p>
      <h3 className="mt-4 font-display text-3xl">{t}</h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
    </div>)}</div>
  </section>;
}

export function Reviews() {
  return <section className="bg-secondary/40">
    <div className="mx-auto max-w-[1400px] px-6 py-28 md:px-10">
      <p className="eyebrow mb-6 text-primary">★★★★★ · Отзывы</p>
      <h2 className="display-lg mb-16" data-reveal>Говорят<br /><em className="text-primary">наши гости</em></h2>
      <div className="grid gap-10 md:grid-cols-3">{reviews.map(([name, why, text], i) => <figure key={name} className="bg-background p-8 shadow-soft" data-reveal data-delay={i}>
        <blockquote className="font-display text-2xl italic leading-snug">«{text}»</blockquote>
        <figcaption className="mt-6 text-sm text-muted-foreground"><span className="text-foreground">{name}</span> · {why}</figcaption>
      </figure>)}</div>
    </div>
  </section>;
}

export function MessengerButtons({ className = '' }: { className?: string }) {
  return <div className={`flex flex-wrap gap-3 ${className}`}>
    <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-current px-5 py-2 text-sm hover:opacity-70">MAX</a>
    <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-current px-5 py-2 text-sm hover:opacity-70">Telegram</a>
    <a href={VK_URL} target="_blank" rel="noopener noreferrer" className="rounded-full border border-current px-5 py-2 text-sm hover:opacity-70">ВКонтакте</a>
  </div>;
}

export function FloatingContact() {
  return <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
    <a href={MAX_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX" className="rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground shadow-soft hover:opacity-90">MAX</a>
    <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" className="rounded-full bg-foreground px-4 py-3 text-sm text-background shadow-soft hover:opacity-90">Telegram</a>
    <a href={VK_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать ВКонтакте" className="rounded-full bg-accent px-4 py-3 text-sm text-accent-foreground shadow-soft hover:opacity-90">ВКонтакте</a>
  </div>;
}
