import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LogOut, Plus, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { requestsQuery, statuses, type RequestStatus } from '@/lib/requests';
import { SHOPIFY_ADMIN_URL, formatPrice } from '@/lib/shopify';
import { productsQuery } from '@/lib/queries';

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [
    { title: 'Панель мастерской — Соцвет' }, { name: 'description', content: 'Заявки и каталог мастерской Соцвет.' },
    { property: 'og:title', content: 'Мастерская — Соцвет' }, { property: 'og:description', content: 'Закрытая панель заявок и товаров.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' },
  ] }), component: Admin,
});
function Admin() {
  const { user } = Route.useRouteContext();
  const role = useQuery({ queryKey: ['admin-role', user.id], queryFn: async () => {
    const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (error) throw error;
    return data;
  } });
  return <section className="mx-auto max-w-[1200px] px-6 py-14 md:px-10">
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3 text-primary">Соцвет · Для команды</p><h1 className="font-display text-6xl">Мастерская</h1></div><Button variant="outline" onClick={async () => { await supabase.auth.signOut(); }}><LogOut />Выйти</Button></div>
    {role.isPending ? <p>Проверяем доступ…</p> : role.isError ? <p role="alert">Не удалось проверить доступ. Обновите страницу.</p> : !role.data ? <p>Доступ к заявкам есть только у владельца мастерской. Войдите в разрешённый аккаунт.</p> : <Workshop />}
  </section>;
}
function Workshop() {
  const client = useQueryClient();
  const requests = useQuery(requestsQuery);
  const products = useQuery(productsQuery(100));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const rows = requests.data?.filter(r => (filter === 'all' || r.status === filter) && `${r.name} ${r.phone} ${r.message}`.toLowerCase().includes(search.toLowerCase())) ?? [];
  return <Tabs defaultValue="requests">
    <TabsList className="mb-8"><TabsTrigger value="requests">Заявки{requests.data ? ` · ${requests.data.filter(r => r.status === 'new').length}` : ''}</TabsTrigger><TabsTrigger value="products">Букеты</TabsTrigger></TabsList>
    <TabsContent value="requests">
      <div className="mb-6 flex flex-wrap gap-3"><Input aria-label="Поиск заявок" placeholder="Имя, телефон или пожелания" className="max-w-sm" value={search} onChange={e => setSearch(e.target.value)} /><Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-44" aria-label="Фильтр заявок"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все заявки</SelectItem>{Object.entries(statuses).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select><Button variant="outline" size="icon" title="Обновить заявки" aria-label="Обновить заявки" onClick={() => requests.refetch()}><RefreshCw /></Button></div>
      {requests.isPending ? <p>Загружаем заявки…</p> : requests.isError ? <p role="alert">Не удалось загрузить заявки. Попробуйте обновить.</p> : rows.length === 0 ? <p className="border-y py-16 text-muted-foreground">{search || filter !== 'all' ? 'По вашему запросу ничего не найдено.' : 'Заявок пока нет.'}</p> : <div className="divide-y border-y">{rows.map(r => <article key={r.id} className="grid gap-5 py-7 md:grid-cols-[1fr_2fr_170px]">
        <div><h2 className="font-display text-3xl">{r.name}</h2><a href={`tel:${r.phone.replace(/[^+\d]/g, '')}`} className="text-sm text-primary underline">{r.phone}</a><p className="mt-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}</p></div>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{r.message}</p>
        <Select value={r.status} disabled={updating === r.id} onValueChange={async value => {
          setUpdating(r.id);
          const { error } = await supabase.from('florist_requests').update({ status: value as RequestStatus }).eq('id', r.id);
          if (error) toast.error('Не удалось изменить статус'); else await client.invalidateQueries({ queryKey: requestsQuery.queryKey });
          setUpdating(null);
        }}><SelectTrigger aria-label={`Статус заявки ${r.name}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(statuses).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select>
      </article>)}</div>}
    </TabsContent>
    <TabsContent value="products">
      <div className="mb-8 flex flex-wrap gap-3"><Button asChild><a href={`${SHOPIFY_ADMIN_URL}/products/new`} target="_blank" rel="noopener noreferrer"><Plus />Добавить букет</a></Button><Button variant="outline" asChild><a href={`${SHOPIFY_ADMIN_URL}/products`} target="_blank" rel="noopener noreferrer"><ExternalLink />Все товары в Shopify</a></Button><Button variant="outline" asChild><a href={`${SHOPIFY_ADMIN_URL}/orders`} target="_blank" rel="noopener noreferrer">Заказы Shopify</a></Button></div>
      {products.isPending ? <p>Загружаем букеты…</p> : products.isError ? <p role="alert">Не удалось загрузить каталог.</p> : !products.data?.length ? <p className="border-y py-16 text-muted-foreground">В каталоге пока нет букетов.</p> : <div className="divide-y border-y">{products.data.map(({ node: p }) => <article className="flex flex-wrap items-center gap-5 py-5" key={p.id}>{p.images.edges[0] && <img className="h-20 w-16 shrink-0 object-cover" src={p.images.edges[0].node.url} alt={p.title} />}<div className="min-w-0 flex-1"><h2 className="font-display text-3xl break-words">{p.title}</h2><p className="text-sm">{formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}</p></div><Button variant="outline" asChild><a href={`${SHOPIFY_ADMIN_URL}/products/${p.id.split('/').at(-1)}`} target="_blank" rel="noopener noreferrer">Редактировать<ExternalLink /></a></Button></article>)}</div>}
    </TabsContent>
  </Tabs>;
}
