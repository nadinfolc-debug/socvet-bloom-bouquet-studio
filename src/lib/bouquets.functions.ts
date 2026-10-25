import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bouquetSchema } from '@/lib/bouquet-schema';

const DOMAIN = 'lovable-project-w1m2q-awdnsxtb.myshopify.com';
const API = `https://${DOMAIN}/admin/api/2026-10/graphql.json`;
const DEFAULT_OPTION = 'Title';
const DEFAULT_VALUE = 'Default Title';

export type AdminVariant = { id: string; name: string; price: string; compareAtPrice: string | null };
export type AdminBouquet = {
  id: string; title: string; description: string; status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  price: string; currency: string; image: string | null; images: { id: string; url: string }[];
  composition: string; size: string; tags: string[]; collectionIds: string[];
  soldOut: boolean; optionName: string; variants: AdminVariant[]; updatedAt: string;
};
export type AdminCollection = { id: string; title: string; count: number };

async function shopify<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = process.env['SHOPIFY_ACCESS_TOKEN'];
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
export const toHtml = (text: string) => text.trim().split(/\n{2,}/).filter(Boolean).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');

async function publishEverywhere(id: string) {
  const pubs = await shopify(`{ publications(first: 20) { nodes { id } } }`);
  const r = await shopify(`mutation($id: ID!, $input: [PublicationInput!]!) { publishablePublish(id: $id, input: $input) { userErrors { message } } }`,
    { id, input: pubs.publications.nodes.map((p: any) => ({ publicationId: p.id })) });
  userErrors(r.publishablePublish.userErrors);
}

const PRODUCT_NODE = `id title description status updatedAt tags
  composition: metafield(namespace: "custom", key: "composition") { value }
  size: metafield(namespace: "custom", key: "size") { value }
  collections(first: 20) { nodes { id } }
  media(first: 20) { nodes { id ... on MediaImage { image { url } } } }
  options { name }
  variants(first: 20) { nodes { id title price compareAtPrice inventoryPolicy inventoryItem { tracked } } }`;

export const listBouquets = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const data = await shopify(`{ products(first: 100, sortKey: UPDATED_AT, reverse: true) { nodes { ${PRODUCT_NODE} } } shop { currencyCode } }`);
  return data.products.nodes.map((p: any): AdminBouquet => {
    const images = p.media.nodes.filter((m: any) => m.image?.url).map((m: any) => ({ id: m.id, url: m.image.url }));
    const optionName = p.options[0]?.name ?? DEFAULT_OPTION;
    const variants: AdminVariant[] = p.variants.nodes.map((v: any) => ({ id: v.id, name: v.title === DEFAULT_VALUE ? '' : v.title, price: v.price, compareAtPrice: v.compareAtPrice }));
    return {
      id: p.id, title: p.title, description: p.description, status: p.status, updatedAt: p.updatedAt,
      price: String(Math.min(...variants.map(v => Number(v.price)))), currency: data.shop.currencyCode,
      image: images[0]?.url ?? null, images, composition: p.composition?.value ?? '', size: p.size?.value ?? '',
      tags: p.tags, collectionIds: p.collections.nodes.map((c: any) => c.id),
      soldOut: p.variants.nodes.length > 0 && p.variants.nodes.every((v: any) => v.inventoryPolicy === 'DENY' && v.inventoryItem?.tracked),
      optionName: optionName === DEFAULT_OPTION ? 'Размер' : optionName, variants,
    };
  });
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
    const files = [];
    for (const img of data.images) {
      files.push(img.kind === 'existing' ? { id: img.id } : { originalSource: await uploadImage(img), contentType: 'IMAGE', alt: data.title });
    }
    const single = data.variants.length === 1 && !data.variants[0]!.name;
    const optionName = single ? DEFAULT_OPTION : (data.optionName || 'Размер');
    const loc = data.soldOut ? (await shopify(`{ locations(first: 1) { nodes { id } } }`)).locations.nodes[0]?.id : null;
    const variants = data.variants.map(v => ({
      ...(v.id ? { id: v.id } : {}),
      optionValues: [{ optionName, name: single ? DEFAULT_VALUE : v.name }],
      price: v.price.toFixed(2),
      compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toFixed(2) : null,
      inventoryPolicy: data.soldOut ? 'DENY' : 'CONTINUE',
      inventoryItem: { tracked: data.soldOut, requiresShipping: true },
      ...(data.soldOut && loc ? { inventoryQuantities: [{ locationId: loc, name: 'available', quantity: 0 }] } : {}),
    }));
    const input = {
      title: data.title, descriptionHtml: toHtml(data.description), status: data.visible ? 'ACTIVE' : 'DRAFT',
      productType: 'Букет', vendor: 'Соцвет', tags: data.tags, collections: data.collectionIds, files,
      metafields: [
        { namespace: 'custom', key: 'composition', type: 'multi_line_text_field', value: data.composition || ' ' },
        { namespace: 'custom', key: 'size', type: 'multi_line_text_field', value: data.size || ' ' },
      ],
      productOptions: [{ name: optionName, values: variants.map(v => ({ name: v.optionValues[0]!.name })) }],
      variants,
    };
    const r = await shopify(`mutation($input: ProductSetInput!, $identifier: ProductSetIdentifiers) { productSet(input: $input, identifier: $identifier, synchronous: true) { product { id } userErrors { field message } } }`,
      { input, identifier: data.id ? { id: data.id } : null });
    userErrors(r.productSet.userErrors);
    const productId = r.productSet.product.id as string;
    if (!data.id) await publishEverywhere(productId);
    return { id: productId };
  });

const idSchema = z.object({ id: z.string().startsWith('gid://shopify/Product/') });

export const setBouquetVisible = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.extend({ visible: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const r = await shopify(`mutation($product: ProductUpdateInput!) { productUpdate(product: $product) { userErrors { message } } }`, { product: { id: data.id, status: data.visible ? 'ACTIVE' : 'DRAFT' } });
    userErrors(r.productUpdate.userErrors);
    return { ok: true };
  });

export const duplicateBouquet = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.extend({ title: z.string().trim().min(1).max(120) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const r = await shopify(`mutation($id: ID!, $title: String!) { productDuplicate(productId: $id, newTitle: $title, newStatus: DRAFT, includeImages: true, synchronous: true) { newProduct { id } userErrors { message } } }`, { id: data.id, title: data.title });
    userErrors(r.productDuplicate.userErrors);
    await publishEverywhere(r.productDuplicate.newProduct.id);
    return { id: r.productDuplicate.newProduct.id as string };
  });

export const deleteBouquet = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const r = await shopify(`mutation($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { message } } }`, { input: { id: data.id } });
    userErrors(r.productDelete.userErrors);
    return { ok: true };
  });

export const listCollections = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const d = await shopify(`{ collections(first: 100, sortKey: TITLE) { nodes { id title productsCount { count } } } }`);
  return d.collections.nodes.map((c: any): AdminCollection => ({ id: c.id, title: c.title, count: c.productsCount?.count ?? 0 }));
});

export const saveCollection = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().startsWith('gid://shopify/Collection/').optional(), title: z.string().trim().min(1).max(80) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.id) {
      const r = await shopify(`mutation($c: CollectionUpdateInput!) { collectionUpdate(collection: $c) { userErrors { message } } }`, { c: { id: data.id, title: data.title } });
      userErrors(r.collectionUpdate.userErrors);
      return { id: data.id };
    }
    const r = await shopify(`mutation($c: CollectionCreateInput!) { collectionCreate(collection: $c) { collection { id } userErrors { message } } }`, { c: { title: data.title } });
    userErrors(r.collectionCreate.userErrors);
    await publishEverywhere(r.collectionCreate.collection.id);
    return { id: r.collectionCreate.collection.id as string };
  });

export const deleteCollection = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().startsWith('gid://shopify/Collection/') }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const r = await shopify(`mutation($i: CollectionDeleteInput!) { collectionDelete(input: $i) { userErrors { message } } }`, { i: { id: data.id } });
    userErrors(r.collectionDelete.userErrors);
    return { ok: true };
  });
