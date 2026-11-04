import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { requestsQuery, historyQuery, statuses, statusTone, activeStatuses, type RequestStatus } from '@/lib/requests';
import { deliveryLinesSchema } from '@/lib/delivery-schema';
import { formatPrice } from '@/lib/shopify';

type Row = NonNullable<Awaited<ReturnType<typeof requestsQuery.queryFn>>>[number];
const periods = { all: 'За всё время', today: 'Сегодня', week: '7 дней', month: '30 дней' } as const;
const kinds = { all: 'Все обращения', orders: 'Заказы букетов', consult: 'Консультации' } as const;
const fmt = (d: string) => new Date(d).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const lines = (r: Row) => { const p = deliveryLinesSchema.safeParse(r.order_lines); return p.success ? p.data : null; };
const total = (r: Row) => lines(r)?.reduce((s, l) => s + l.unitPrice * l.quantity, 0) ?? 0;

export function StatusBadge({ status }: { status: string }) {
  const s = status as RequestStatus;
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-xs ${statusTone[s] ?? 'bg-muted'}`}>{statuses[s] ?? status}</span>;
}

export function OrdersPanel() {
  const requests = useQuery(requestsQuery);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [period, setPeriod] = useState<keyof typeof periods>('all');
  const [kind, setKind] = useState<keyof typeof kinds>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const all = requests.data ?? [];
  const since = period === 'all' ? 0 : period === 'today' ? new Date().setHours(0, 0, 0, 0) : Date.now() - (period === 'week' ? 7 : 30) * 864e5;
  const rows = all.filter(r =>
    (filter === 'all' || (filter === 'active' ? activeStatuses.includes(r.status as RequestStatus) : r.status === filter)) &&
    (kind === 'all' || (kind === 'orders') === !!r.order_lines) &&
    new Date(r.created_at).getTime() >= since &&
    `${r.name} ${r.phone} ${r.message} ${r.delivery_address ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  const count = (s: RequestStatus[]) => all.filter(r => s.includes(r.status as RequestStatus)).length;
  const open = all.find(r => r.id === openId) ?? null;

  const summary = [
    { label: 'Новые', value: count(['new']), f: 'new' },
    { label: 'В работе', value: count(['confirmed', 'paid', 'assembling']), f: 'active' },
    { label: 'В доставке', value: count(['shipping']), f: 'shipping' },
    { label: 'Доставлено', value: count(['delivered']), f: 'delivered' },
  ];

  return <>
    <div className="mb-8 grid grid-cols-2 gap-px border bg-border md:grid-cols-4">
      {summary.map(s => <button key={s.label} onClick={() => setFilter(s.f)} className={`bg-background p-5 text-left transition-colors hover:bg-muted/60 ${filter === s.f ? 'outline outline-2 -outline-offset-2 outline-primary' : ''}`}>
        <p className="eyebrow text-muted-foreground">{s.label}</p><p className="mt-2 font-display text-5xl">{s.value}</p>
      </button>)}
    </div>
    <div className="mb-6 flex flex-wrap gap-3">
      <Input aria-label="Поиск заказов" placeholder="Имя, телефон, адрес" className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
      <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-48" aria-label="Статус"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Активные</SelectItem><SelectItem value="all">Все статусы</SelectItem>{Object.entries(statuses).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <Select value={period} onValueChange={v => setPeriod(v as keyof typeof periods)}><SelectTrigger className="w-40" aria-label="Период"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(periods).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <Select value={kind} onValueChange={v => setKind(v as keyof typeof kinds)}><SelectTrigger className="w-48" aria-label="Тип обращения"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(kinds).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" size="icon" title="Обновить" aria-label="Обновить заказы" onClick={() => requests.refetch()}><RefreshCw /></Button>
    </div>
    {requests.isPending ? <p>Загружаем заказы…</p> : requests.isError ? <p role="alert">Не удалось загрузить заказы. Попробуйте обновить.</p> : rows.length === 0 ? <p className="border-y py-16 text-muted-foreground">{all.length ? 'По этим условиям ничего нет.' : 'Заказов пока нет.'}</p> :
      <div className="divide-y border-y">{rows.map(r => <button key={r.id} onClick={() => setOpenId(r.id)} className="grid w-full gap-2 py-5 text-left transition-colors hover:bg-muted/40 xl:grid-cols-[140px_minmax(0,1fr)_minmax(0,1.4fr)_120px_170px] md:items-center md:gap-5 md:px-2">
        <span className="text-xs text-muted-foreground">{fmt(r.created_at)}</span>
        <span><span className="font-display text-2xl">{r.name}</span><span className="block text-sm text-muted-foreground">{r.phone}</span></span>
        <span className="text-sm">{r.order_lines ? (lines(r)?.map(l => `${l.title} × ${l.quantity}`).join(', ') ?? 'Заказ') : <span className="text-muted-foreground">Консультация: {r.message}</span>}</span>
        <span className="text-sm font-semibold">{r.order_lines ? formatPrice(total(r)) : '—'}</span>
        <span><StatusBadge status={r.status} /></span>
      </button>)}</div>}

    <Dialog open={!!open} onOpenChange={o => !o && setOpenId(null)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">{open && <OrderDetails key={open.id} r={open} />}</DialogContent>
    </Dialog>
  </>;
}

function OrderDetails({ r }: { r: Row }) {
  const client = useQueryClient();
  const history = useQuery(historyQuery(r.id));
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(r.admin_note ?? '');
  const ls = lines(r);
  const update = async (patch: { status?: RequestStatus; admin_note?: string | null }, ok: string) => {
    setSaving(true);
    const { error } = await supabase.from('florist_requests').update(patch).eq('id', r.id);
    setSaving(false);
    if (error) { toast.error('Не удалось сохранить'); return; }
    toast.success(ok);
    await Promise.all([client.invalidateQueries({ queryKey: requestsQuery.queryKey }), client.invalidateQueries({ queryKey: ['request-history', r.id] })]);
  };
  return <div className="space-y-6 text-sm">
    <DialogHeader><DialogTitle className="font-display text-4xl font-normal">{r.order_lines ? 'Заказ' : 'Консультация'} · {r.name}</DialogTitle><DialogDescription>Поступил {fmt(r.created_at)}</DialogDescription></DialogHeader>
    <div className="flex flex-wrap items-center gap-3">
      <Select value={r.status} disabled={saving} onValueChange={v => update({ status: v as RequestStatus }, 'Статус изменён')}><SelectTrigger className="w-56" aria-label="Статус заказа"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statuses).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
      <Button variant="outline" asChild><a href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>Позвонить {r.phone}</a></Button>
    </div>
    {ls && <div className="border-y py-4"><ul className="space-y-1">{ls.map(l => <li key={l.variantId} className="flex justify-between gap-4"><span>{l.title}{l.variantTitle !== 'Default Title' ? ` · ${l.variantTitle}` : ''} × {l.quantity}</span><span>{formatPrice(l.unitPrice * l.quantity)}</span></li>)}</ul><p className="mt-3 flex justify-between font-semibold"><span>Итого за букеты</span><span>{formatPrice(total(r))}</span></p><p className="mt-1 text-xs text-primary">Оплата согласовывается отдельно</p></div>}
    {r.delivery_address && <dl className="grid gap-2 sm:grid-cols-[8rem_minmax(0,1fr)]"><dt className="text-muted-foreground">Адрес</dt><dd className="break-words">{r.delivery_address}</dd><dt className="text-muted-foreground">Желаемое время</dt><dd>{r.desired_delivery_time}</dd></dl>}
    {r.message && <div><p className="mb-1 text-muted-foreground">{r.order_lines ? 'Комментарий клиента' : 'Пожелания'}</p><p className="whitespace-pre-wrap break-words">{r.message}</p></div>}
    <div className="space-y-2"><p className="text-muted-foreground">Заметка для себя <span className="text-xs">(клиент её не видит)</span></p>
      <Textarea rows={3} maxLength={4000} value={note} onChange={e => setNote(e.target.value)} placeholder="Например: открытка «С днём рождения», позвонить за час" />
      <Button size="sm" variant="outline" disabled={saving || note === (r.admin_note ?? '')} onClick={() => update({ admin_note: note.trim() || null }, 'Заметка сохранена')}>Сохранить заметку</Button>
    </div>
    <div><p className="mb-2 text-muted-foreground">История</p>{history.isPending ? <p>…</p> : !history.data?.length ? <p className="text-muted-foreground">Пока без изменений.</p> :
      <ol className="space-y-1">{history.data.map((h, i) => <li key={i} className="flex items-center gap-3"><span className="w-32 text-xs text-muted-foreground">{fmt(h.changed_at)}</span><StatusBadge status={h.status} /></li>)}</ol>}</div>
  </div>;
}
