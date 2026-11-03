import { buildDeliveryMessage } from './delivery-message';
import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { deliveryRequestSchema, deliveryLinesSchema } from '@/lib/delivery-schema';
import { storefrontApiRequest } from '@/lib/shopify';

export const submitDeliveryRequest = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => deliveryRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const ids = data.items.map(item => item.variantId);
    if (new Set(ids).size !== ids.length) throw new Error('Повторяющиеся позиции');
    const result = await storefrontApiRequest(`query DeliveryVariants($ids: [ID!]!) {
      nodes(ids: $ids) { ... on ProductVariant { id title availableForSale price { amount } product { title } } }
    }`, { ids });
    const nodes = result?.data?.nodes as Array<{ id: string; title: string; availableForSale: boolean; price: { amount: string }; product: { title: string } } | null> | undefined;
    const lines = deliveryLinesSchema.parse(data.items.map(item => {
      const variant = nodes?.find(node => node?.id === item.variantId);
      if (!variant?.availableForSale) throw new Error('Букет недоступен. Обновите корзину.');
      return { ...item, title: variant.product.title, variantTitle: variant.title, unitPrice: Number(variant.price.amount) };
    }));
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const url = process.env['SUPABASE_URL'];
    if (!key || !url) throw new Error('Не удалось отправить заявку');
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      } },
    });
    const id = crypto.randomUUID();
    const { error } = await client.from('florist_requests').insert({
      id, name: 'Заказ букета', phone: data.phone,
      message: buildDeliveryMessage(data), consent: true,
      delivery_address: data.address, desired_delivery_time: data.desiredTime, order_lines: lines,
    });
    if (error) throw new Error('Не удалось отправить заявку');
    return { id };
  });