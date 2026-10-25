import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated')({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw redirect({ to: '/auth' });
    return { user };
  },
  pendingMs: 0,
  pendingComponent: CabinetPending,
  component: Outlet,
});

function CabinetPending() {
  return (
    <section className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="eyebrow mb-4 text-primary">Соцвет · Для команды</p>
      <p className="font-display text-4xl">Открываем мастерскую…</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Если страница не открылась, <Link to="/auth" className="text-primary underline">войдите здесь</Link>.
      </p>
    </section>
  );
}
