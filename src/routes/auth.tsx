import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import '@lovable.dev/cloud-auth-js/styles.css';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Вход в мастерскую — Соцвет' }, { name: 'description', content: 'Закрытая панель команды Соцвет.' },
    { property: 'og:title', content: 'Вход — Соцвет' }, { property: 'og:description', content: 'Вход в панель мастерской.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' },
  ] }), component: Auth,
});
function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'password'>('login');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) { setMode('password'); return; }
    void supabase.auth.getUser().then(({ data }) => { if (data.user) void navigate({ to: '/admin' }); });
  }, [navigate]);
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setNotice('');
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
    if (result.error) { setNotice('Не удалось войти. Попробуйте ещё раз.'); setBusy(false); return; }
    if (!result.redirected) { setBusy(false); await navigate({ to: '/admin' }); }
  }
  return <section className="mx-auto max-w-md px-6 py-20">
    <p className="eyebrow mb-4 text-primary">Соцвет · Для команды</p>
    <h1 className="font-display text-5xl">{mode === 'signup' ? 'Создать аккаунт' : mode === 'reset' ? 'Восстановить доступ' : mode === 'password' ? 'Новый пароль' : 'Вход в мастерскую'}</h1>
    <form className="mt-8 space-y-5" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setNotice(''); const form = new FormData(e.currentTarget);
      const email = String(form.get('email') ?? ''); const password = String(form.get('password') ?? '');
      try {
        const result = mode === 'signup' ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } }) : mode === 'reset' ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` }) : mode === 'password' ? await supabase.auth.updateUser({ password }) : await supabase.auth.signInWithPassword({ email, password });
        if (result.error) { setNotice(mode === 'login' ? 'Проверьте email и пароль или подтвердите email.' : 'Не удалось выполнить запрос. Попробуйте ещё раз.'); return; }
        if (mode === 'signup' || mode === 'reset') setNotice('Проверьте почту: отправлено письмо со ссылкой.');
        else await navigate({ to: '/admin' });
      } finally { setBusy(false); }
    }}>
      {mode !== 'password' && <div className="space-y-2"><Label htmlFor="auth-email">Email</Label><Input id="auth-email" name="email" type="email" required autoComplete="email" /></div>}
      {mode !== 'reset' && <div className="space-y-2"><Label htmlFor="auth-password">Пароль</Label><Input id="auth-password" name="password" type="password" minLength={8} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div>}
      {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
      <Button disabled={busy} className="w-full">{busy ? 'Подождите…' : mode === 'login' ? 'Войти' : mode === 'signup' ? 'Создать аккаунт' : mode === 'reset' ? 'Отправить ссылку' : 'Сохранить пароль'}</Button>
    </form>
    <div className="mt-4 flex flex-wrap gap-2"><Button variant="link" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setNotice(''); }}>{mode === 'signup' ? 'Уже есть аккаунт' : 'Создать аккаунт'}</Button><Button variant="link" onClick={() => { setMode('reset'); setNotice(''); }}>Забыли пароль?</Button></div>
    <div className="mt-6 space-y-3"><Button variant="outline" className="w-full" disabled={busy} onClick={() => social('google')}>Войти через Google</Button><Button type="button" className="lovable-auth-button w-full" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button></div>
  </section>;
}