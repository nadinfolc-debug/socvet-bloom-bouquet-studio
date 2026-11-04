import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
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
  return <div className="mt-6 grid grid-cols-2 gap-y-6 border-t md:grid border-foreground/10 pt-6 md:mt-6 md:grid-cols-4 md:pt-5">
      {stats.map(([n, t], i) => <div key={n} data-reveal data-delay={i % 4}>
        <p className="font-display text-4xl italic text-primary md:text-5xl">{n}</p>
        <p className="mt-1 max-w-[14rem] text-sm text-muted-foreground">{t}</p>
      </div>)}
  </div>;
}

export function Florist() {
  return <section className="screen-block mx-auto grid max-w-[1400px] content-center items-center gap-5 px-5 py-6 md:grid-cols-12 md:gap-16 md:px-10 md:py-10">
    <img src={sculpture} alt="Авторская композиция: калла и ветви вишни в чёрной вазе" loading="lazy" width={1024} height={1280} className="editorial-photo mx-auto shadow-soft md:col-span-5" data-reveal />
    <div className="md:col-span-6 md:col-start-7" data-reveal data-delay="1">
      <p className="eyebrow mb-3 text-primary md:mb-5">Флорист и основатель</p>
      <h2 className="display-lg">Надежда<br /><em className="text-primary">Фолц</em></h2>
      <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed md:mt-6 md:text-lg text-muted-foreground">
        Я собираю букеты так, как пишут письма: с паузами, акцентами и воздухом между строк. Каждая композиция — свободный силуэт, живой свет и один смелый цвет.
      </p>
      <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
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
  return <section className="screen-block flex flex-col justify-center bg-secondary/40">
    <div className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-10 md:py-10">
      <div className="mb-5 md:mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
        <div>
          <p className="eyebrow mb-4 text-primary">★★★★★ · 4,9 из 5 · Отзывы</p>
          <h2 className="display-lg">Говорят <em className="text-primary">наши гости</em></h2>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-reveal data-delay="1">
        {reviews.map(([name, why, text]) => <figure key={name} className="flex min-w-0 flex-col bg-background p-6 shadow-soft">
          <p className="mb-3 text-sm tracking-widest text-primary" aria-label="5 из 5">★★★★★</p>
          <blockquote className="font-display text-xl italic leading-snug">«{text}»</blockquote>
          <figcaption className="mt-auto pt-5 text-sm text-muted-foreground"><span className="text-foreground">{name}</span> · {why}</figcaption>
        </figure>)}
      </div>
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
  const [open, setOpen] = useState(false);
  const pill = "rounded-full px-4 py-2 text-sm shadow-soft hover:opacity-90 md:px-3 md:py-1.5 md:text-xs xl:px-4 xl:py-2.5 xl:text-sm";
  return <div className="ml-auto flex flex-col items-end gap-2">
    <div className={`${open ? "flex" : "hidden"} flex-col items-end gap-2 md:gap-1.5`}>
      <a href={MAX_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX" className={`${pill} bg-primary text-primary-foreground`}>MAX</a>
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" className={`${pill} bg-foreground text-background`}>Telegram</a>
      <a href={VK_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать ВКонтакте" className={`${pill} bg-accent text-accent-foreground`}>ВКонтакте</a>
    </div>
    <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Скрыть мессенджеры" : "Написать флористу"} className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
      {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
    </button>
  </div>;
}
