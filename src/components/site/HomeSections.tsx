import { useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MAX_URL, TELEGRAM_URL, VK_URL } from '@/lib/contacts';
import sculpture from '@/assets/sculpture.jpg';

const steps = [
  ['01', 'Выбор или совет', 'Выберите готовый букет в каталоге или напишите флористу — подберём под повод и бюджет.'],
  ['02', 'Фото перед отправкой', 'Пришлём фотографию собранного букета, чтобы вы увидели его до доставки.'],
  ['03', 'Бережная доставка', 'Курьер привезёт букет в аквабоксе к выбранному интервалу по Москве.'],
] as const;

const reviews = [
  ['Анна К.', 'День рождения мамы', 'Букет оказался ещё красивее, чем на фото. Мама сказала, что такого ей не дарили никогда.'],
  ['Михаил', 'Свидание', 'Посоветовался с флористом в Telegram, за час собрали что-то совершенно особенное. Спасибо!'],
  ['Елена В.', 'Юбилей коллеги', 'Привезли точно в интервал, прислали фото заранее. Цветы стояли больше недели.'],
  ['Дарья', 'Без повода', 'Заказываю здесь третий раз. Каждый раз — как маленькая выставка у меня на столе.'],
  ['Игорь С.', 'Годовщина', 'Попросил «что-то тёмное и смелое» — получил ровно то, что представлял. Жена в восторге.'],
  ['Ксения', 'Свадьба подруги', 'Помогли с бутоньерками и букетом невесты за два дня. Очень бережные и внимательные.'],
] as const;

const stats = [['4 года', 'собираем авторские букеты'], ['3 200+', 'букетов доставлено по Москве'], ['2 часа', 'от заказа до доставки'], ['7 дней', 'гарантия свежести']];

const faq = [
  ['Как быстро вы доставите букет?', 'В пределах МКАД — от 2 часов после подтверждения. Можно выбрать удобный интервал на любой день вперёд.'],
  ['Букет будет похож на фото?', 'Да. Перед отправкой мы присылаем фото именно вашего букета. Если какой-то цветок недоступен, заменим на равноценный и согласуем с вами.'],
  ['Можно сделать сюрприз?', 'Конечно. Укажите имя и телефон получателя — курьер позвонит ему, не раскрывая отправителя, и вручит букет с открыткой.'],
  ['Как оплатить?', 'После подтверждения заказа флорист пришлёт ссылку на оплату картой или СБП. Для компаний — по счёту.'],
  ['Сколько простоят цветы?', 'Мы работаем со свежими поставками и даём гарантию 7 дней. К каждому букету прикладываем памятку по уходу.'],
] as const;

export function Stats() {
  return <div className="mt-10 hidden grid-cols-2 gap-y-6 border-t md:grid border-foreground/10 pt-6 md:mt-6 md:grid-cols-4 md:pt-5">
      {stats.map(([n, t], i) => <div key={n} data-reveal data-delay={i % 4}>
        <p className="font-display text-4xl italic text-primary md:text-5xl">{n}</p>
        <p className="mt-1 max-w-[14rem] text-sm text-muted-foreground">{t}</p>
      </div>)}
  </div>;
}

export function Florist() {
  return <section className="screen-block mx-auto grid max-w-[1400px] content-center items-center gap-5 px-5 py-6 md:grid-cols-12 md:gap-16 md:px-10 md:py-10">
    <img src={sculpture} alt="Авторская композиция: калла и ветви вишни в чёрной вазе" loading="lazy" width={1024} height={1280} className="mx-auto aspect-[4/5] h-[30svh] w-auto max-w-full object-cover shadow-soft md:mx-0 md:w-full md:h-auto md:col-span-5 md:max-h-fit-screen" data-reveal />
    <div className="md:col-span-6 md:col-start-7" data-reveal data-delay="1">
      <p className="eyebrow mb-3 text-primary md:mb-5">Флорист и основатель</p>
      <h2 className="display-lg">Надежда<br /><em className="text-primary">Фолц</em></h2>
      <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed md:mt-6 md:text-lg text-muted-foreground">
        Я собираю букеты так, как пишут письма: с паузами, акцентами и воздухом между строк. Каждая композиция — свободный силуэт, живой свет и один смелый цвет.
      </p>
      <p className="mt-4 hidden max-w-lg leading-relaxed text-muted-foreground md:block">
        Училась в Москве и Амстердаме, работаю с сезонными цветами от проверенных поставщиков и небольших подмосковных ферм.
      </p>
      <p className="mt-4 font-display text-2xl italic md:mt-8 md:text-3xl">«Чувства обретают форму»</p>
    </div>
  </section>;
}

export function HowWeWork() {
  return <section className="screen-block mx-auto flex max-w-[1400px] flex-col justify-center px-5 py-6 md:px-10 md:py-10">
    <h2 className="display-lg mb-5 md:mb-10" data-reveal>Как мы<br /><em className="text-primary">работаем</em></h2>
    <div className="grid gap-5 md:grid-cols-3 md:gap-12">{steps.map(([n, t, d], i) => <div key={n} className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-foreground/20 pt-4 md:block md:pt-6" data-reveal data-delay={i}>
      <p className="row-span-2 font-display text-4xl italic text-primary md:text-5xl">{n}</p>
      <h3 className="font-display text-2xl md:mt-4 md:text-3xl">{t}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:mt-3 md:text-base">{d}</p>
    </div>)}</div>
  </section>;
}

export function Reviews() {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };
  return <section className="screen-block flex flex-col justify-center bg-secondary/40">
    <div className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-10 md:py-10">
      <div className="mb-5 md:mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
        <div>
          <p className="eyebrow mb-4 text-primary">★★★★★ · 4,9 из 5 · Отзывы</p>
          <h2 className="display-lg">Говорят <em className="text-primary">наши гости</em></h2>
        </div>
        <div className="hidden gap-3 md:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Предыдущие отзывы" className="grid h-12 w-12 place-items-center rounded-full border border-foreground/30 transition hover:border-primary hover:text-primary">←</button>
          <button type="button" onClick={() => scroll(1)} aria-label="Следующие отзывы" className="grid h-12 w-12 place-items-center rounded-full border border-foreground/30 transition hover:border-primary hover:text-primary">→</button>
        </div>
      </div>
      <div ref={track} className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scroll-pl-6 px-6 pb-4 md:scroll-pl-10 [scrollbar-width:none] md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden" data-reveal data-delay="1">
        {reviews.map(([name, why, text]) => <figure key={name} className="flex w-full shrink-0 snap-start flex-col bg-background p-6 shadow-soft sm:w-[60%] md:w-[calc((100%-3rem)/3)]">
          <p className="mb-3 text-sm tracking-widest text-primary" aria-label="5 из 5">★★★★★</p>
          <blockquote className="font-display text-xl italic leading-snug">«{text}»</blockquote>
          <figcaption className="mt-auto pt-5 text-sm text-muted-foreground"><span className="text-foreground">{name}</span> · {why}</figcaption>
        </figure>)}
      </div>
      <p className="mt-2 text-xs text-muted-foreground md:hidden">Листайте вбок →</p>
    </div>
  </section>;
}

export function Faq() {
  return <section className="screen-block mx-auto grid max-w-[1400px] content-center gap-5 px-5 py-6 md:grid-cols-12 md:px-10 md:py-10">
    <h2 className="display-lg md:col-span-5" data-reveal>Частые<br /><em className="text-primary">вопросы</em></h2>
    <Accordion type="single" collapsible className="md:col-span-7" data-reveal data-delay="1">
      {faq.map(([q, a]) => <AccordionItem key={q} value={q}>
        <AccordionTrigger className="text-left font-display text-xl md:text-2xl">{q}</AccordionTrigger>
        <AccordionContent className="text-base leading-relaxed text-muted-foreground">{a}</AccordionContent>
      </AccordionItem>)}
    </Accordion>
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
  return <div className="fixed bottom-2 right-2 z-40 flex flex-row items-end gap-1 md:flex-col md:gap-1.5 md:bottom-4 md:right-4">
    <a href={MAX_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX" className="rounded-full bg-primary px-2.5 py-1 text-[0.7rem] md:px-3 md:py-1.5 md:text-xs xl:px-4 xl:py-2.5 xl:text-sm text-primary-foreground shadow-soft hover:opacity-90">MAX</a>
    <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" className="rounded-full bg-foreground px-2.5 py-1 text-[0.7rem] md:px-3 md:py-1.5 md:text-xs xl:px-4 xl:py-2.5 xl:text-sm text-background shadow-soft hover:opacity-90">Telegram</a>
    <a href={VK_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать ВКонтакте" className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] md:px-3 md:py-1.5 md:text-xs xl:px-4 xl:py-2.5 xl:text-sm text-accent-foreground shadow-soft hover:opacity-90">ВКонтакте</a>
  </div>;
}
