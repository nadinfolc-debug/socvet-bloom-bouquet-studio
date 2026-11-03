import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { deliveryRequestSchema } from '@/lib/delivery-schema';
import { submitDeliveryRequest } from '@/lib/delivery.functions';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/shopify';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DELIVERY_SLOTS } from '@/lib/delivery-message';
import { CalendarIcon } from 'lucide-react';
import { ru } from 'date-fns/locale';

export function DeliveryRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const items = useCartStore(state => state.items);
  const submit = useServerFn(submitDeliveryRequest);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState('');
  const [otherRecipient, setOtherRecipient] = useState(false);
  const [withCard, setWithCard] = useState(false);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dateLabel = date?.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  return <Dialog open={open} onOpenChange={value => {
    if (busy) return;
    onOpenChange(value);
    if (!value) { setSent(false); setError(''); }
  }}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto">
      <DialogTitle className="pr-6 font-display text-4xl font-medium">Доставка букета</DialogTitle>
      <DialogDescription>Соцвет · Заявка на заказ</DialogDescription>
      {sent ? <div className="space-y-5 py-4"><p role="status">Заявка получена. Мы свяжемся с вами, чтобы подтвердить доставку и согласовать оплату отдельно.</p><Button className="w-full" onClick={() => { onOpenChange(false); setSent(false); }}>Закрыть</Button></div> :
      <form className="space-y-4" onSubmit={async event => {
        event.preventDefault();
        if (busy) return;
        setError('');
        const form = new FormData(event.currentTarget);
        if (!date || !slot) { setError('Выберите дату и интервал доставки'); return; }
        if (otherRecipient && !String(form.get('recipientPhone') ?? '').trim()) { setError('Укажите телефон получателя'); return; }
        const parsed = deliveryRequestSchema.safeParse({
          address: form.get('address'), phone: form.get('phone'), desiredTime: `${dateLabel}, ${slot}`,
          recipientName: otherRecipient ? form.get('recipientName') ?? '' : '', recipientPhone: otherRecipient ? form.get('recipientPhone') ?? '' : '',
          cardText: withCard ? form.get('cardText') ?? '' : '',
          comment: form.get('comment'), consent: form.get('consent') === 'on',
          items: items.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
        });
        if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Проверьте данные'); return; }
        setBusy(true);
        try { await submit({ data: parsed.data }); setSent(true); useCartStore.getState().clearCart(); }
        catch { setError('Не удалось отправить заявку. Проверьте корзину и попробуйте ещё раз.'); }
        finally { setBusy(false); }
      }}>
        <ul className="space-y-2 border-y py-3 text-sm">{items.map(item => <li key={item.variantId} className="flex justify-between gap-4"><span className="break-words">{item.product.node.title} × {item.quantity}</span><span className="shrink-0">{formatPrice(Number(item.price.amount) * item.quantity)}</span></li>)}</ul>
        <div className="space-y-2"><Label htmlFor="delivery-address">Адрес доставки</Label><Textarea id="delivery-address" name="address" autoComplete="street-address" required maxLength={500} placeholder="Город, улица, дом, квартира, подъезд" disabled={busy} /></div>
        <div className="space-y-2"><Label htmlFor="delivery-phone">Номер телефона</Label><Input id="delivery-phone" name="phone" type="tel" autoComplete="tel" required minLength={5} maxLength={40} disabled={busy} /></div>
        <div className="space-y-2"><Label>Дата доставки</Label>
          <Popover><PopoverTrigger asChild><Button type="button" variant="outline" className="w-full justify-start font-normal" disabled={busy}><CalendarIcon className="mr-2 h-4 w-4" />{dateLabel ?? 'Выберите дату'}</Button></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar locale={ru} weekStartsOn={1} mode="single" selected={date} onSelect={setDate} disabled={d => d < today} initialFocus className="pointer-events-auto p-3" /></PopoverContent></Popover>
        </div>
        <div className="space-y-2"><Label>Интервал</Label>
          <div className="flex flex-wrap gap-2">{DELIVERY_SLOTS.map(s => <button type="button" key={s} disabled={busy} onClick={() => setSlot(s)} aria-pressed={slot === s} className={`rounded-full border px-3 py-1.5 text-sm transition ${slot === s ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary'}`}>{s}</button>)}</div>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={otherRecipient} onChange={e => setOtherRecipient(e.target.checked)} disabled={busy} />Получатель — другой человек</label>
        {otherRecipient && <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="recipient-name">Имя получателя</Label><Input id="recipient-name" name="recipientName" maxLength={100} disabled={busy} /></div>
          <div className="space-y-2"><Label htmlFor="recipient-phone">Телефон получателя</Label><Input id="recipient-phone" name="recipientPhone" type="tel" maxLength={40} disabled={busy} /></div>
        </div>}
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={withCard} onChange={e => setWithCard(e.target.checked)} disabled={busy} />Открытка к букету (бесплатно)</label>
        {withCard && <div className="space-y-2"><Label htmlFor="card-text">Текст открытки</Label><Textarea id="card-text" name="cardText" maxLength={500} placeholder="Ваши слова — флорист подпишет открытку от руки" disabled={busy} /></div>}
        <div className="space-y-2"><Label htmlFor="delivery-comment">Комментарий (необязательно)</Label><Textarea id="delivery-comment" name="comment" maxLength={2000} placeholder="Пожелания к букету или нюансы доставки" disabled={busy} /></div>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="consent" required disabled={busy} className="mt-1" /><span>Согласен с <Link to="/privacy" className="underline">политикой конфиденциальности</Link> и обработкой персональных данных</span></label>
        <p className="text-sm text-muted-foreground">Оплата — отдельно после подтверждения заказа.</p>
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <Button type="submit" variant="petal" className="w-full" disabled={busy || items.length === 0}>{busy ? 'Отправляем…' : 'Отправить заявку'}</Button>
      </form>}
    </DialogContent>
  </Dialog>;
}