import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

const DOMAIN = 'lovable-project-w1m2q-awdnsxtb.myshopify.com';
const API = `https://${DOMAIN}/admin/api/2026-10/graphql.json`;

export type AdminBouquet = {
  id: string; title: string; description: string; status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  price: string; currency: string; image: string | null; variantId: string | null;
};

async function shopify<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) throw new Error('Магазин не подключён');
  const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token }, body: JSON.stringify({ query, variables }) });
  if (!res.ok) throw new Error(`Shopify ${res.status}`);
  const json = await res.json() as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join(', '));
  return json.data as T;
}
function userErrors(list?: { message: string }[]) { if (list?.length) throw new Error(list.map(e => e.message).join(', ')); }

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (error || !data) throw new Error('Нет доступа');
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const toHtml = (text: string) => text.trim().split(/\n{2,}/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');

export const listBouquets = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const data = await shopify(`{ products(first: 100, sortKey: UPDATED_AT, reverse: true) { nodes { id title description status featuredMedia { preview { image { url } } } variants(first: 1) { nodes { id price } } } } shop { currencyCode } }`);
  return data.products.nodes.map((p: any): AdminBouquet => ({
    id: p.id, title: p.title, description: p.description, status: p.status,
    price: p.variants.nodes[0]?.price ?? '0', currency: data.shop.currencyCode,
    image: p.featuredMedia?.preview?.image?.url ?? null, variantId: p.variants.nodes[0]?.id ?? null,
  }));
});

export const bouquetSchema = z.object({
  id: z.string().startsWith('gid://shopify/Product/').optional(),
  title: z.string().trim().min(1, 'Укажите название').max(120),
  description: z.string().trim().max(3000).default(''),
  price: z.coerce.number().positive('Укажите цену').max(10_000_000),
  visible: z.boolean(),
  image: z.object({ data: z.string().max(8_000_000), mime: z.enum(['image/jpeg', 'image/png', 'image/webp']) }).optional(),
});

async function uploadImage(image: { data: string; mime: string }) {
  const ext = image.mime.split('/')[1];
  const staged = await shopify(`mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
    { input: [{ resource: 'IMAGE', filename: `bouquet.${ext}`, mimeType: image.mime, httpMethod: 'POST' }] });
  userErrors(staged.stagedUploadsCreate.userErrors);
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  const bytes = Uint8Array.from(atob(image.data), c => c.charCodeAt(0));
  form.append('file', new Blob([bytes], { type: image.mime }), `bouquet.${ext}`);
  const up = await fetch(target.url, { method: 'POST', body: form });
  if (!up.ok) throw new Error('Не удалось загрузить фото');
  return target.resourceUrl as string;
}

export const saveBouquet = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bouquetSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const status = data.visible ? 'ACTIVE' : 'DRAFT';
    const media = data.image ? [{ originalSource: await uploadImage(data.image), mediaContentType: 'IMAGE', alt: data.title }] : [];
    let productId = data.id;
    let oldMedia: string[] = [];
    if (productId) {
      if (media.length) {
        const cur = await shopify(`query($id: ID!) { product(id: $id) { media(first: 50) { nodes { id } } } }`, { id: productId });
        oldMedia = cur.product?.media.nodes.map((m: any) => m.id) ?? [];
      }
      const r = await shopify(`mutation($product: ProductUpdateInput!, $media: [CreateMediaInput!]) { productUpdate(product: $product, media: $media) { product { id } userErrors { message } } }`,
        { product: { id: productId, title: data.title, descriptionHtml: toHtml(data.description), status }, media });
      userErrors(r.productUpdate.userErrors);
      if (oldMedia.length) await shopify(`mutation($files: [FileUpdateInput!]!) { fileUpdate(files: $files) { userErrors { message } } }`, { files: oldMedia.map(id => ({ id, referencesToRemove: [productId] })) });
    } else {
      const r = await shopify(`mutation($product: ProductCreateInput!, $media: [CreateMediaInput!]) { productCreate(product: $product, media: $media) { product { id } userErrors { message } } }`,
        { product: { title: data.title, descriptionHtml: toHtml(data.description), status, productType: 'Букет', vendor: 'Соцвет' }, media });
      userErrors(r.productCreate.userErrors);
      productId = r.productCreate.product.id as string;
      const pubs = await shopify(`{ publications(first: 20) { nodes { id } } }`);
      await shopify(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
        { id: productId, input: pubs.publications.nodes.map((p: any) => ({ publicationId: p.id })) });
    }
    const v = await shopify(`query($id: ID!) { product(id: $id) { variants(first: 1) { nodes { id } } } }`, { id: productId });
    const variantId = v.product.variants.nodes[0].id;
    const pr = await shopify(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { userErrors { message } } }`,
      { productId, variants: [{ id: variantId, price: data.price.toFixed(2), inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: false, requiresShipping: true } }] });
    userErrors(pr.productVariantsBulkUpdate.userErrors);
    return { id: productId };
  });

export const deleteBouquet = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().startsWith('gid://shopify/Product/') }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const r = await shopify(`mutation($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { message } } }`, { input: { id: data.id } });
    userErrors(r.productDelete.userErrors);
    return { ok: true };
  });
