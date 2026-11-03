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
  return <section className="border-y border-foreground/10">
    <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-10 px-6 py-10 md:grid-cols-4 md:py-12 md:px-10">
      {stats.map(([n, t], i) => <div key={n} data-reveal data-delay={i % 4}>
        <p className="font-display text-5xl italic text-primary md:text-6xl">{n}</p>
        <p className="mt-2 max-w-[14rem] text-sm text-muted-foreground">{t}</p>
      </div>)}
    </div>
  </section>;
}

export function Florist() {
  return <section className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20">
    <img src={sculpture} alt="Авторская композиция: калла и ветви вишни в чёрной вазе" loading="lazy" width={1024} height={1280} className="w-full max-h-[70vh] object-cover shadow-soft md:col-span-5 md:max-h-[78vh]" data-reveal />
    <div className="md:col-span-6 md:col-start-7" data-reveal data-delay="1">
      <p className="eyebrow mb-6 text-primary">Флорист и основатель</p>
      <h2 className="display-lg">Надежда<br /><em className="text-primary">Фолц</em></h2>
      <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
        Я собираю букеты так, как пишут письма: с паузами, акцентами и воздухом между строк. Каждая композиция — свободный силуэт, живой свет и один смелый цвет.
      </p>
      <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
        Училась в Москве и Амстердаме, работаю с сезонными цветами от проверенных поставщиков и небольших подмосковных ферм.
      </p>
      <p className="mt-10 font-display text-3xl italic">«Чувства обретают форму»</p>
    </div>
  </section>;
}

export function HowWeWork() {
  return <section className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
    <h2 className="display-lg mb-10 md:mb-12" data-reveal>Как мы<br /><em className="text-primary">работаем</em></h2>
    <div className="grid gap-12 md:grid-cols-3">{steps.map(([n, t, d], i) => <div key={n} className="border-t border-foreground/20 pt-6" data-reveal data-delay={i}>
      <p className="font-display text-5xl italic text-primary">{n}</p>
      <h3 className="mt-4 font-display text-3xl">{t}</h3>
      <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
    </div>)}</div>
  </section>;
}

export function Reviews() {
  return <section className="bg-secondary/40">
    <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
      <p className="eyebrow mb-6 text-primary">★★★★★ · 4,9 из 5 · Отзывы</p>
      <h2 className="display-lg mb-10 md:mb-12" data-reveal>Говорят<br /><em className="text-primary">наши гости</em></h2>
      <div className="grid gap-8 md:grid-cols-3">{reviews.map(([name, why, text], i) => <figure key={name} className="bg-background p-8 shadow-soft" data-reveal data-delay={i % 3}>
        <p className="mb-4 text-sm tracking-widest text-primary" aria-label="5 из 5">★★★★★</p>
        <blockquote className="font-display text-2xl italic leading-snug">«{text}»</blockquote>
        <figcaption className="mt-6 text-sm text-muted-foreground"><span className="text-foreground">{name}</span> · {why}</figcaption>
      </figure>)}</div>
    </div>
  </section>;
}

export function Faq() {
  return <section className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-12 md:px-10 md:py-20">
    <h2 className="display-lg md:col-span-5" data-reveal>Частые<br /><em className="text-primary">вопросы</em></h2>
    <Accordion type="single" collapsible className="md:col-span-7" data-reveal data-delay="1">
      {faq.map(([q, a]) => <AccordionItem key={q} value={q}>
        <AccordionTrigger className="text-left font-display text-2xl">{q}</AccordionTrigger>
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
  return <div className="fixed bottom-3 right-3 z-40 flex flex-col items-end gap-1.5 md:bottom-4 md:right-4 md:gap-2">
    <a href={MAX_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX" className="rounded-full bg-primary px-3 py-2 text-xs md:px-4 md:py-3 md:text-sm text-primary-foreground shadow-soft hover:opacity-90">MAX</a>
    <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать в Telegram" className="rounded-full bg-foreground px-3 py-2 text-xs md:px-4 md:py-3 md:text-sm text-background shadow-soft hover:opacity-90">Telegram</a>
    <a href={VK_URL} target="_blank" rel="noopener noreferrer" aria-label="Написать ВКонтакте" className="rounded-full bg-accent px-3 py-2 text-xs md:px-4 md:py-3 md:text-sm text-accent-foreground shadow-soft hover:opacity-90">ВКонтакте</a>
  </div>;
}
