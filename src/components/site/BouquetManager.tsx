import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, ArrowRight, Copy, Eye, EyeOff, ImagePlus, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { listBouquets, saveBouquet, deleteBouquet, setBouquetVisible, duplicateBouquet, listCollections, saveCollection, deleteCollection, type AdminBouquet, type AdminCollection } from '@/lib/bouquets.functions';
import { bouquetSchema } from '@/lib/bouquet-schema';
import { formatPrice } from '@/lib/catalog';

type Photo = { kind: 'existing'; id: string; url: string } | { kind: 'new'; data: string; mime: 'image/jpeg'; url: string; key: string };

async function compress(file: File): Promise<Photo> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL('image/jpeg', 0.86);
  return { kind: 'new', data: url.split(',')[1] ?? '', mime: 'image/jpeg', url, key: crypto.randomUUID() };
}

const sorts = { updated: 'Недавно изменённые', title: 'По названию', priceAsc: 'Сначала дешевле', priceDesc: 'Сначала дороже' } as const;

export function BouquetManager() {
  const client = useQueryClient();
  const list = useServerFn(listBouquets);
  const listCols = useServerFn(listCollections);
  const remove = useServerFn(deleteBouquet);
  const toggle = useServerFn(setBouquetVisible);
  const duplicate = useServerFn(duplicateBouquet);
  const bouquets = useQuery({ queryKey: ['admin-bouquets'], queryFn: () => list() });
  const collections = useQuery({ queryKey: ['admin-collections'], queryFn: () => listCols() });
  const [editing, setEditing] = useState<AdminBouquet | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AdminBouquet | null>(null);
  const [colsOpen, setColsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<keyof typeof sorts>('updated');
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = () => Promise.all(['admin-bouquets', 'admin-collections', 'products', 'product'].map(k => client.invalidateQueries({ queryKey: [k] })));

  const rows = useMemo(() => {
    const arr = (bouquets.data ?? []).filter(b => `${b.title} ${b.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'title') arr.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    if (sort === 'priceAsc') arr.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'priceDesc') arr.sort((a, b) => Number(b.price) - Number(a.price));
    return arr;
  }, [bouquets.data, search, sort]);

  const act = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(id);
    try { await fn(); toast.success(ok); await refresh(); } catch (e) { toast.error('Не получилось', { description: e instanceof Error ? e.message : undefined }); } finally { setBusy(null); }
  };

  return <>
    <div className="mb-6 flex flex-wrap gap-3">
      <Button onClick={() => setEditing('new')}><Plus />Добавить букет</Button>
      <Button variant="outline" onClick={() => setColsOpen(true)}>Подборки{collections.data ? ` · ${collections.data.length}` : ''}</Button>
      <Input aria-label="Поиск букетов" placeholder="Название или метка" className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
      <Select value={sort} onValueChange={v => setSort(v as keyof typeof sorts)}><SelectTrigger className="w-52" aria-label="Сортировка"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(sorts).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent></Select>
    </div>
    {bouquets.isPending ? <p>Загружаем букеты…</p> : bouquets.isError ? <p role="alert">Не удалось загрузить букеты. Обновите страницу.</p> : !rows.length ? <p className="border-y py-16 text-muted-foreground">{search ? 'Ничего не найдено.' : 'Букетов пока нет — добавьте первый.'}</p> :
      <div className="divide-y border-y">{rows.map(b => <article key={b.id} className="flex flex-wrap items-center gap-5 py-5">
        {b.image ? <img className="h-24 w-20 shrink-0 object-contain" src={b.image} alt={b.title} /> : <div className="grid h-24 w-20 shrink-0 place-items-center bg-muted text-muted-foreground"><ImagePlus className="size-5" /></div>}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-3xl break-words">{b.title}</h2>
          <p className="text-sm">{b.variants.length > 1 ? 'от ' : ''}{formatPrice(b.price)}
            {b.variants[0]?.compareAtPrice && <s className="ml-2 text-muted-foreground">{formatPrice(b.variants[0].compareAtPrice)}</s>}
            {b.variants.length > 1 && <span className="ml-2 text-muted-foreground">· {b.variants.length} варианта</span>}
            {b.status !== 'ACTIVE' && <span className="ml-2 text-muted-foreground">· скрыт с сайта</span>}
            {b.soldOut && <span className="ml-2 text-primary">· нет в наличии</span>}
          </p>
          {(b.collectionIds.length > 0) && <p className="mt-1 text-xs text-muted-foreground">{b.collectionIds.map(id => collections.data?.find(c => c.id === id)?.title).filter(Boolean).join(', ')}</p>}
        </div>
        <div className="flex flex-wrap gap-1">
          <Button variant="outline" onClick={() => setEditing(b)}><Pencil />Изменить</Button>
          <Button variant="ghost" size="icon" disabled={busy === b.id} title={b.status === 'ACTIVE' ? 'Скрыть с сайта' : 'Показать на сайте'} aria-label={b.status === 'ACTIVE' ? `Скрыть ${b.title}` : `Показать ${b.title}`} onClick={() => act(b.id, () => toggle({ data: { id: b.id, visible: b.status !== 'ACTIVE' } }), b.status === 'ACTIVE' ? 'Букет скрыт' : 'Букет на сайте')}>{b.status === 'ACTIVE' ? <Eye /> : <EyeOff />}</Button>
          <Button variant="ghost" size="icon" disabled={busy === b.id} title="Дублировать" aria-label={`Дублировать ${b.title}`} onClick={() => act(b.id, () => duplicate({ data: { id: b.id, title: `${b.title} (копия)` } }), 'Копия создана — она скрыта, пока вы её не включите')}><Copy /></Button>
          <Button variant="ghost" size="icon" title="Удалить" aria-label={`Удалить ${b.title}`} onClick={() => setDeleting(b)}><Trash2 /></Button>
        </div>
      </article>)}</div>}

    <Dialog open={editing !== null} onOpenChange={o => !o && setEditing(null)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {editing !== null && <BouquetForm key={editing === 'new' ? 'new' : editing.id} bouquet={editing === 'new' ? null : editing} collections={collections.data ?? []} onDone={async () => { setEditing(null); await refresh(); }} />}
      </DialogContent>
    </Dialog>

    <Dialog open={colsOpen} onOpenChange={setColsOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg"><CollectionsEditor collections={collections.data ?? []} onChange={refresh} /></DialogContent>
    </Dialog>

    <AlertDialog open={deleting !== null} onOpenChange={o => !o && setDeleting(null)}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Удалить «{deleting?.title}»?</AlertDialogTitle><AlertDialogDescription>Букет исчезнет с сайта. Это нельзя отменить — если нужно убрать на время, лучше скройте его.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => deleting && act(deleting.id, () => remove({ data: { id: deleting.id } }), 'Букет удалён')}>Удалить</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}

type VariantRow = { id?: string; name: string; price: string; compareAtPrice: string };

function BouquetForm({ bouquet, collections, onDone }: { bouquet: AdminBouquet | null; collections: AdminCollection[]; onDone: () => Promise<void> }) {
  const save = useServerFn(saveBouquet);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(bouquet?.images.map(i => ({ kind: 'existing' as const, ...i })) ?? []);
  const [visible, setVisible] = useState(bouquet ? bouquet.status === 'ACTIVE' : true);
  const [soldOut, setSoldOut] = useState(bouquet?.soldOut ?? false);
  const [cols, setCols] = useState<string[]>(bouquet?.collectionIds ?? []);
  const [optionName, setOptionName] = useState(bouquet?.optionName ?? 'Размер');
  const [variants, setVariants] = useState<VariantRow[]>(bouquet?.variants.map(v => ({ id: v.id, name: v.name, price: Number(v.price).toString(), compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice).toString() : '' })) ?? [{ name: '', price: '', compareAtPrice: '' }]);
  const setVar = (i: number, patch: Partial<VariantRow>) => setVariants(vs => vs.map((v, j) => j === i ? { ...v, ...patch } : v));
  const move = (i: number, d: number) => setPhotos(ps => { const a = [...ps]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j]!, a[i]!]; return a; });
  const num = (s: string) => Number(s.replace(',', '.').replace(/\s/g, ''));

  return <form className="space-y-6" onSubmit={async e => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = bouquetSchema.safeParse({
      id: bouquet?.id, title: String(f.get('title')), description: String(f.get('description') ?? ''),
      composition: String(f.get('composition') ?? ''), size: String(f.get('size') ?? ''), visible, soldOut,
      tags: String(f.get('tags') ?? '').split(',').map(t => t.trim()).filter(Boolean), collectionIds: cols, optionName,
      variants: variants.map(v => ({ id: v.id, name: variants.length > 1 ? v.name : '', price: num(v.price), compareAtPrice: v.compareAtPrice ? num(v.compareAtPrice) : null })),
      images: photos.map(p => p.kind === 'existing' ? { kind: 'existing', id: p.id } : { kind: 'new', data: p.data, mime: p.mime }),
    });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? 'Проверьте поля'); return; }
    setBusy(true);
    try {
      await save({ data: parsed.data });
      toast.success(bouquet ? 'Изменения сохранены' : 'Букет добавлен');
      await onDone();
    } catch (err) {
      toast.error('Не удалось сохранить', { description: err instanceof Error ? err.message : undefined });
    } finally { setBusy(false); }
  }}>
    <DialogHeader><DialogTitle className="font-display text-4xl font-normal">{bouquet ? 'Изменить букет' : 'Новый букет'}</DialogTitle><DialogDescription>Все изменения сразу появятся в каталоге.</DialogDescription></DialogHeader>

    <div>
      <p className="mb-2 text-sm font-medium">Фото <span className="font-normal text-muted-foreground">— первое будет главным</span></p>
      <div className="flex flex-wrap gap-3">
        {photos.map((p, i) => <div key={p.kind === 'existing' ? p.id : p.key} className="relative w-28">
          <img src={p.url} alt="" className={`aspect-[4/5] w-full object-contain ${i === 0 ? 'ring-2 ring-primary' : ''}`} />
          {i === 0 && <span className="absolute left-1 top-1 bg-primary px-1.5 text-[10px] text-primary-foreground">Главное</span>}
          <button type="button" aria-label="Убрать фото" className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90" onClick={() => setPhotos(ps => ps.filter((_, j) => j !== i))}><X className="size-3.5" /></button>
          <div className="mt-1 flex justify-between">
            <button type="button" aria-label="Левее" disabled={i === 0} className="p-1 disabled:opacity-30" onClick={() => move(i, -1)}><ArrowLeft className="size-4" /></button>
            {i !== 0 && <button type="button" aria-label="Сделать главным" title="Сделать главным" className="p-1" onClick={() => setPhotos(ps => [ps[i]!, ...ps.filter((_, j) => j !== i)])}><Star className="size-4" /></button>}
            <button type="button" aria-label="Правее" disabled={i === photos.length - 1} className="p-1 disabled:opacity-30" onClick={() => move(i, 1)}><ArrowRight className="size-4" /></button>
          </div>
        </div>)}
        {photos.length < 10 && <label className="grid aspect-[4/5] w-28 cursor-pointer place-items-center border border-dashed bg-muted/50 text-center text-xs text-muted-foreground">
          <span className="flex flex-col items-center gap-2 p-2"><ImagePlus className="size-6" />Добавить фото</span>
          <input type="file" accept="image/*" multiple className="sr-only" onChange={async e => {
            const files = Array.from(e.target.files ?? []).slice(0, 10 - photos.length); e.target.value = '';
            for (const file of files) { try { const p = await compress(file); setPhotos(ps => [...ps, p]); } catch { toast.error(`Не удалось открыть ${file.name}`); } }
          }} />
        </label>}
      </div>
    </div>

    <div className="space-y-2"><Label htmlFor="b-title">Название</Label><Input id="b-title" name="title" required maxLength={120} defaultValue={bouquet?.title} placeholder="Например, «Утро в саду»" /></div>

    <fieldset className="space-y-3 border-y py-4">
      <legend className="text-sm font-medium">Цена и варианты</legend>
      {variants.length > 1 && <div className="space-y-2"><Label htmlFor="b-opt">Чем отличаются варианты</Label><Input id="b-opt" value={optionName} onChange={e => setOptionName(e.target.value)} maxLength={40} placeholder="Размер" /></div>}
      {variants.map((v, i) => <div key={v.id ?? i} className="grid grid-cols-[1fr_1fr_auto] gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto] items-end">
        {variants.length > 1 && <div className="col-span-3 sm:col-span-1"><Label className="text-xs">Вариант</Label><Input aria-label={`Название варианта ${i + 1}`} value={v.name} onChange={e => setVar(i, { name: e.target.value })} placeholder="S, M, L…" maxLength={60} /></div>}
        <div><Label className="text-xs">Цена, ₽</Label><Input aria-label={`Цена ${i + 1}`} inputMode="decimal" required value={v.price} onChange={e => setVar(i, { price: e.target.value })} placeholder="4500" /></div>
        <div><Label className="text-xs">Старая цена, ₽</Label><Input aria-label={`Старая цена ${i + 1}`} inputMode="decimal" value={v.compareAtPrice} onChange={e => setVar(i, { compareAtPrice: e.target.value })} placeholder="необязательно" /></div>
        {variants.length > 1 ? <Button type="button" variant="ghost" size="icon" aria-label="Убрать вариант" onClick={() => setVariants(vs => vs.filter((_, j) => j !== i))}><X /></Button> : <span />}
      </div>)}
      {variants.length < 10 && <Button type="button" variant="outline" size="sm" onClick={() => setVariants(vs => [...vs, { name: '', price: vs[vs.length - 1]?.price ?? '', compareAtPrice: '' }])}><Plus />Добавить вариант (размер)</Button>}
      <p className="text-xs text-muted-foreground">Старая цена показывается зачёркнутой рядом с новой — для скидки.</p>
    </fieldset>

    <div className="space-y-2"><Label htmlFor="b-desc">Описание</Label><Textarea id="b-desc" name="description" rows={4} maxLength={3000} defaultValue={bouquet?.description} placeholder="Настроение, повод, история букета" /></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="b-comp">Состав</Label><Textarea id="b-comp" name="composition" rows={3} maxLength={1000} defaultValue={bouquet?.composition.trim()} placeholder="Пионы, ранункулюсы, эвкалипт" /></div>
      <div className="space-y-2"><Label htmlFor="b-size">Размер</Label><Textarea id="b-size" name="size" rows={3} maxLength={200} defaultValue={bouquet?.size.trim()} placeholder="Высота 45 см, диаметр 35 см" /></div>
    </div>

    {collections.length > 0 && <div><p className="mb-2 text-sm font-medium">Подборки</p><div className="flex flex-wrap gap-2">{collections.map(c => {
      const on = cols.includes(c.id);
      return <button type="button" key={c.id} aria-pressed={on} onClick={() => setCols(cs => on ? cs.filter(x => x !== c.id) : [...cs, c.id])} className={`rounded-full border px-4 py-1.5 text-sm ${on ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary'}`}>{c.title}</button>;
    })}</div></div>}
    <div className="space-y-2"><Label htmlFor="b-tags">Метки</Label><Input id="b-tags" name="tags" defaultValue={bouquet?.tags.join(', ')} placeholder="весна, хит, к 8 марта — через запятую" /></div>

    <div className="divide-y border-y">
      <div className="flex items-center justify-between gap-4 py-4"><Label htmlFor="b-visible">Показывать на сайте</Label><Switch id="b-visible" checked={visible} onCheckedChange={setVisible} /></div>
      <div className="flex items-center justify-between gap-4 py-4"><Label htmlFor="b-sold">Нет в наличии <span className="block text-xs font-normal text-muted-foreground">Букет виден, но заказать его нельзя</span></Label><Switch id="b-sold" checked={soldOut} onCheckedChange={setSoldOut} /></div>
    </div>
    <Button disabled={busy} className="w-full">{busy ? 'Сохраняем…' : 'Сохранить'}</Button>
  </form>;
}

function CollectionsEditor({ collections, onChange }: { collections: AdminCollection[]; onChange: () => Promise<unknown> }) {
  const save = useServerFn(saveCollection);
  const remove = useServerFn(deleteCollection);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await fn(); toast.success(ok); await onChange(); } catch (e) { toast.error('Не получилось', { description: e instanceof Error ? e.message : undefined }); } finally { setBusy(false); }
  };
  return <div className="space-y-5">
    <DialogHeader><DialogTitle className="font-display text-4xl font-normal">Подборки</DialogTitle><DialogDescription>Например «Розы», «Пионы», «Свадебные». По ним покупатели фильтруют каталог.</DialogDescription></DialogHeader>
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (name.trim()) run(() => save({ data: { title: name } }).then(() => setName('')), 'Подборка создана'); }}>
      <Input aria-label="Новая подборка" value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Название подборки" /><Button disabled={busy}><Plus />Создать</Button>
    </form>
    {collections.length === 0 ? <p className="text-sm text-muted-foreground">Подборок пока нет.</p> : <ul className="divide-y border-y">{collections.map(c => <li key={c.id} className="flex items-center gap-2 py-2">
      <Input aria-label={`Название подборки ${c.title}`} defaultValue={c.title} maxLength={80} onBlur={e => { const t = e.target.value.trim(); if (t && t !== c.title) run(() => save({ data: { id: c.id, title: t } }), 'Название сохранено'); }} />
      <span className="whitespace-nowrap text-xs text-muted-foreground">{c.count} шт.</span>
      <Button variant="ghost" size="icon" disabled={busy} aria-label={`Удалить подборку ${c.title}`} onClick={() => { if (confirm(`Удалить подборку «${c.title}»? Букеты останутся.`)) run(() => remove({ data: { id: c.id } }), 'Подборка удалена'); }}><Trash2 /></Button>
    </li>)}</ul>}
  </div>;
}
