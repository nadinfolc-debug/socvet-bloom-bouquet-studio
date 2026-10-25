import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { listBouquets, saveBouquet, deleteBouquet, type AdminBouquet } from '@/lib/bouquets.functions';
import { formatPrice } from '@/lib/shopify';

async function compress(file: File): Promise<{ data: string; mime: 'image/jpeg'; preview: string }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL('image/jpeg', 0.86);
  return { data: url.split(',')[1] ?? '', mime: 'image/jpeg', preview: url };
}

export function BouquetManager() {
  const client = useQueryClient();
  const list = useServerFn(listBouquets);
  const remove = useServerFn(deleteBouquet);
  const bouquets = useQuery({ queryKey: ['admin-bouquets'], queryFn: () => list() });
  const [editing, setEditing] = useState<AdminBouquet | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AdminBouquet | null>(null);
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: ['admin-bouquets'] }), client.invalidateQueries({ queryKey: ['products'] })]);

  return <>
    <div className="mb-8"><Button onClick={() => setEditing('new')}><Plus />Добавить букет</Button></div>
    {bouquets.isPending ? <p>Загружаем букеты…</p> : bouquets.isError ? <p role="alert">Не удалось загрузить букеты. Обновите страницу.</p> : !bouquets.data.length ? <p className="border-y py-16 text-muted-foreground">Букетов пока нет — добавьте первый.</p> :
      <div className="divide-y border-y">{bouquets.data.map(b => <article key={b.id} className="flex flex-wrap items-center gap-5 py-5">
        {b.image ? <img className="h-24 w-20 shrink-0 object-cover" src={b.image} alt={b.title} /> : <div className="grid h-24 w-20 shrink-0 place-items-center bg-muted text-muted-foreground"><ImagePlus className="size-5" /></div>}
        <div className="min-w-0 flex-1"><h2 className="font-display text-3xl break-words">{b.title}</h2><p className="text-sm">{formatPrice(b.price, b.currency)}{b.status !== 'ACTIVE' && <span className="ml-3 text-muted-foreground">· скрыт с сайта</span>}</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={() => setEditing(b)}><Pencil />Изменить</Button><Button variant="ghost" size="icon" aria-label={`Удалить ${b.title}`} onClick={() => setDeleting(b)}><Trash2 /></Button></div>
      </article>)}</div>}

    <Dialog open={editing !== null} onOpenChange={o => !o && setEditing(null)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {editing !== null && <BouquetForm key={editing === 'new' ? 'new' : editing.id} bouquet={editing === 'new' ? null : editing} onDone={async () => { setEditing(null); await refresh(); }} />}
      </DialogContent>
    </Dialog>

    <AlertDialog open={deleting !== null} onOpenChange={o => !o && setDeleting(null)}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Удалить «{deleting?.title}»?</AlertDialogTitle><AlertDialogDescription>Букет исчезнет с сайта. Это нельзя отменить — если нужно убрать на время, лучше выключите «Показывать на сайте».</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={async () => {
          if (!deleting) return;
          try { await remove({ data: { id: deleting.id } }); toast.success('Букет удалён'); await refresh(); } catch { toast.error('Не удалось удалить букет'); }
        }}>Удалить</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}

function BouquetForm({ bouquet, onDone }: { bouquet: AdminBouquet | null; onDone: () => Promise<void> }) {
  const save = useServerFn(saveBouquet);
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<{ data: string; mime: 'image/jpeg'; preview: string } | null>(null);
  const [visible, setVisible] = useState(bouquet ? bouquet.status === 'ACTIVE' : true);
  const preview = image?.preview ?? bouquet?.image;

  return <form className="space-y-5" onSubmit={async e => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!bouquet && !image) { toast.error('Добавьте фото букета'); return; }
    setBusy(true);
    try {
      await save({ data: { id: bouquet?.id, title: String(f.get('title')), description: String(f.get('description') ?? ''), price: Number(String(f.get('price')).replace(',', '.')), visible, image: image ? { data: image.data, mime: image.mime } : undefined } });
      toast.success(bouquet ? 'Изменения сохранены' : 'Букет добавлен');
      await onDone();
    } catch (err) {
      toast.error('Не удалось сохранить', { description: err instanceof Error ? err.message : undefined });
    } finally { setBusy(false); }
  }}>
    <DialogHeader><DialogTitle className="font-display text-4xl font-normal">{bouquet ? 'Изменить букет' : 'Новый букет'}</DialogTitle><DialogDescription>Заполните поля — букет сразу появится в каталоге.</DialogDescription></DialogHeader>
    <label className="block cursor-pointer">
      <span className="mb-2 block text-sm font-medium">Фото</span>
      <div className="grid aspect-[4/5] w-40 place-items-center overflow-hidden border border-dashed bg-muted/50">
        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2 p-3 text-center text-xs text-muted-foreground"><ImagePlus className="size-6" />Выбрать фото</span>}
      </div>
      <input type="file" accept="image/*" className="sr-only" onChange={async e => { const file = e.target.files?.[0]; if (file) { try { setImage(await compress(file)); } catch { toast.error('Не удалось открыть фото'); } } }} />
      {preview && <span className="mt-2 block text-xs text-primary underline">Заменить фото</span>}
    </label>
    <div className="space-y-2"><Label htmlFor="b-title">Название</Label><Input id="b-title" name="title" required maxLength={120} defaultValue={bouquet?.title} placeholder="Например, «Утро в саду»" /></div>
    <div className="space-y-2"><Label htmlFor="b-price">Цена</Label><Input id="b-price" name="price" required inputMode="decimal" pattern="[0-9]+([.,][0-9]{1,2})?" defaultValue={bouquet ? Number(bouquet.price).toString() : ''} placeholder="4500" /></div>
    <div className="space-y-2"><Label htmlFor="b-desc">Описание</Label><Textarea id="b-desc" name="description" rows={5} maxLength={3000} defaultValue={bouquet?.description} placeholder="Состав, размер, настроение букета" /></div>
    <div className="flex items-center justify-between gap-4 border-y py-4"><Label htmlFor="b-visible">Показывать на сайте</Label><Switch id="b-visible" checked={visible} onCheckedChange={setVisible} /></div>
    <Button disabled={busy} className="w-full">{busy ? 'Сохраняем…' : 'Сохранить'}</Button>
  </form>;
}
