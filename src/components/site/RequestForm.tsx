import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { submitRequest } from '@/lib/requests';

export function RequestForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  return <Dialog onOpenChange={() => { setSent(false); setError(''); }}>
    <DialogTrigger asChild><Button variant="petal" size="xl" className="mt-8 whitespace-normal">Посоветоваться с флористом</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogTitle className="font-display text-4xl">Ваш особенный букет</DialogTitle>
      <DialogDescription>Индивидуальный заказ · Соцвет</DialogDescription>
      {sent ? <p role="status" className="py-8">Спасибо! Ваша заявка получена. Флорист свяжется с вами.</p> :
      <form className="space-y-5" onSubmit={async e => {
        e.preventDefault(); setBusy(true); setError('');
        const form = new FormData(e.currentTarget);
        try { await submitRequest({ name: form.get('name'), phone: form.get('phone'), message: form.get('message'), consent: form.get('consent') === 'on' }); setSent(true); }
        catch { setError('Не удалось отправить заявку. Попробуйте ещё раз.'); }
        finally { setBusy(false); }
      }}>
        <div className="space-y-2"><Label htmlFor="request-name">Ваше имя</Label><Input id="request-name" name="name" autoComplete="name" required maxLength={100} /></div>
        <div className="space-y-2"><Label htmlFor="request-phone">Телефон</Label><Input id="request-phone" name="phone" type="tel" autoComplete="tel" required minLength={5} maxLength={40} /></div>
        <div className="space-y-2"><Label htmlFor="request-message">Пожелания к букету</Label><Textarea id="request-message" name="message" placeholder="Повод, любимые цветы, бюджет и дата" required maxLength={2000} /></div>
        <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" name="consent" required /> <span>Согласен с <Link to="/privacy" className="underline">политикой конфиденциальности</Link> и обработкой персональных данных</span></label>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Отправляем…' : 'Отправить заявку'}</Button>
      </form>}
    </DialogContent>
  </Dialog>;
}