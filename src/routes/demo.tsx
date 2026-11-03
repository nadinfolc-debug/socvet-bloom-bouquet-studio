import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/site/OrdersPanel';
import { statuses, type RequestStatus } from '@/lib/requests';
import vs from '@/assets/bouquets/vecherniy-sad.jpg';
import pion from '@/assets/bouquets/pion.jpg';
import sakura from '@/assets/bouquets/sakura.jpg';
import hero from '@/assets/hero.jpg';

export const Route = createFileRoute('/demo')({
  head: () => ({ meta: [
    { title: 'Демо панели управления — Соцвет' },
    { name: 'description', content: 'Посмотрите, как владелец мастерской Соцвет принимает заказы и управляет букетами.' },
    { property: 'og:title', content: 'Демо панели управления — Соцвет' },
    { property: 'og:description', content: 'Заказы, статусы и ассортимент в одной удобной панели.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Demo,
});

type Order = { id: string; name: string; phone: string; when: string; slot: string; address: string; items: string; total: number; status: RequestStatus; note?: string };
const orders: Order[] = [
  { id: 'A-1042', name: 'Анна Ковалёва', phone: '+7 (916) ***-**-12', when: 'Сегодня', slot: '10:00–13:00', address: 'Пречистенка, 22', items: 'Вечерний сад ×1', total: 8900, status: 'new', note: 'Открытка: «С днём рождения, мама!»' },
  { id: 'A-1041', name: 'Михаил Орлов', phone: '+7 (903) ***-**-48', when: 'Сегодня', slot: '18:00–21:00', address: 'Патриаршие, 5', items: 'Сакура ×1', total: 12500, status: 'assembling', note: 'Сюрприз, не звонить получателю до 18:00' },
  { id: 'A-1040', name: 'Елена Воронина', phone: '+7 (926) ***-**-07', when: 'Сегодня', slot: '13:00–16:00', address: 'Новый Арбат, 15', items: 'Белый пион ×2', total: 14800, status: 'shipping' },
  { id: 'A-1039', name: 'Дарья Ли', phone: '+7 (999) ***-**-30', when: 'Завтра', slot: '10:00–13:00', address: 'Ленинский пр., 64', items: 'Индивидуальный заказ', total: 9500, status: 'confirmed' },
  { id: 'A-1038', name: 'Игорь Сафонов', phone: '+7 (915) ***-**-91', when: 'Вчера', slot: '16:00–19:00', address: 'Хамовнический вал, 8', items: 'Вечерний сад ×1', total: 8900, status: 'delivered' },
  { id: 'A-1037', name: 'Ксения Белова', phone: '+7 (985) ***-**-55', when: 'Вчера', slot: '10:00–13:00', address: 'Тверская, 12', items: 'Букет невесты', total: 15000, status: 'paid' },
];
const bouquets = [
  { title: 'Вечерний сад', price: 8900, img: vs, visible: true }, { title: 'Белый пион', price: 7400, img: pion, visible: true },
  { title: 'Сакура', price: 12500, img: sakura, visible: true }, { title: 'Бордо', price: 9800, img: hero, visible: false },
];
const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const readOnly = () => toast('Это демо-режим: изменения не сохраняются');

function Demo() {
  useScrollReveal();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Order | null>(null);
  const rows = orders.filter(o => `${o.name} ${o.address} ${o.items}`.toLowerCase().includes(q.toLowerCase()));
  const count = (s: RequestStatus[]) => orders.filter(o => s.includes(o.status)).length;
  return <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-10">
    <div className="mb-8 flex flex-wrap items-center gap-3 border border-primary/30 bg-primary/5 px-5 py-3 text-sm"><Eye className="size-4 text-primary" />Демо-режим: только просмотр, данные вымышлены. <Link to="/" className="ml-auto underline">На сайт</Link></div>
    <p className="eyebrow mb-3 text-primary">Соцвет · Для команды</p><h1 className="mb-10 font-display text-6xl">Мастерская</h1>
    <Tabs defaultValue="orders">
      <TabsList className="mb-8"><TabsTrigger value="orders">Заказы · {count(['new'])} новых</TabsTrigger><TabsTrigger value="products">Ассортимент</TabsTrigger></TabsList>
      <TabsContent value="orders">
        <div className="mb-8 grid grid-cols-2 gap-px border bg-border md:grid-cols-4">
          {[['Новые', ['new']], ['В работе', ['confirmed', 'paid', 'assembling']], ['В доставке', ['shipping']], ['Доставлено', ['delivered']]].map(([l, s]) =>
            <div key={l as string} className="bg-background p-5"><p className="eyebrow text-muted-foreground">{l as string}</p><p className="mt-2 font-display text-5xl">{count(s as RequestStatus[])}</p></div>)}
        </div>
        <Input placeholder="Поиск по имени, адресу, букету" value={q} onChange={e => setQ(e.target.value)} className="mb-6 max-w-sm" />
        <div className="divide-y border">
          {rows.map(o => <button key={o.id} onClick={() => setOpen(open?.id === o.id ? null : o)} className="grid w-full gap-2 p-5 text-left hover:bg-muted/50 md:grid-cols-[90px_1fr_1fr_120px_160px] md:items-center">
            <span className="text-sm text-muted-foreground">{o.id}</span>
            <span><span className="block">{o.name}</span><span className="text-sm text-muted-foreground">{o.items}</span></span>
            <span className="text-sm">{o.when}, {o.slot}<span className="block text-muted-foreground">{o.address}</span></span>
            <span className="font-display text-xl">{rub(o.total)}</span>
            <StatusBadge status={o.status} />
            {open?.id === o.id && <span className="col-span-full mt-3 grid gap-3 border-t pt-4 text-sm md:grid-cols-2">
              <span>Телефон: {o.phone}<br />{o.note ?? 'Без комментария'}</span>
              <span className="flex flex-wrap gap-2">{(Object.keys(statuses) as RequestStatus[]).slice(0, 6).map(s => <span key={s} role="button" tabIndex={0} onClick={e => { e.stopPropagation(); readOnly(); }} className="cursor-pointer rounded-full border px-3 py-1 text-xs hover:bg-muted">{statuses[s]}</span>)}</span>
            </span>}
          </button>)}
        </div>
      </TabsContent>
      <TabsContent value="products">
        <div className="mb-6 flex justify-end"><Button variant="petal" onClick={readOnly}>Добавить букет</Button></div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {bouquets.map(b => <div key={b.title} className="border">
            <img src={b.img} alt={b.title} loading="lazy" className={`aspect-[4/5] w-full object-cover ${b.visible ? '' : 'opacity-40'}`} />
            <div className="p-4"><p className="font-display text-2xl">{b.title}</p><p className="text-sm text-muted-foreground">{rub(b.price)} · {b.visible ? 'на сайте' : 'скрыт'}</p>
              <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={readOnly}>Изменить</Button><Button size="sm" variant="ghost" onClick={readOnly}>{b.visible ? 'Скрыть' : 'Показать'}</Button></div></div>
          </div>)}
        </div>
      </TabsContent>
    </Tabs>
  </section>;
}
