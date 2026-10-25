import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { requestsQuery } from '@/lib/requests';
import { OrdersPanel } from '@/components/site/OrdersPanel';
import { BouquetManager } from '@/components/site/BouquetManager';

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
  const requests = useQuery(requestsQuery);
  return <Tabs defaultValue="requests">
    <TabsList className="mb-8"><TabsTrigger value="requests">Заказы{requests.data ? ` · ${requests.data.filter(r => r.status === 'new').length} новых` : ''}</TabsTrigger><TabsTrigger value="products">Ассортимент</TabsTrigger></TabsList>
    <TabsContent value="requests"><OrdersPanel /></TabsContent>
    <TabsContent value="products"><BouquetManager /></TabsContent>
  </Tabs>;
}
