import { describe, expect, it } from 'vitest';
import { deliveryRequestSchema } from '@/lib/delivery-schema';

describe('Delivery request before separate payment', () => {
  const request = { address: 'Москва, улица Лесная, дом 1', phone: '+79991234567', desiredTime: '28 октября, 14:00–16:00', comment: '', consent: true, items: [{ variantId: 'gid://shopify/ProductVariant/123', quantity: 1 }] };
  it('requires a delivery address', () => { expect(deliveryRequestSchema.safeParse({ ...request, address: ' ' }).success).toBe(false); });
  it('requires a phone number', () => { expect(deliveryRequestSchema.safeParse({ ...request, phone: '' }).success).toBe(false); });
  it('requires desired reception time', () => { expect(deliveryRequestSchema.safeParse({ ...request, desiredTime: ' ' }).success).toBe(false); });
  it('accepts delivery without an optional comment or payment data', () => { expect(deliveryRequestSchema.parse(request).comment).toBe(''); });
  it('preserves delivery wishes', () => { expect(deliveryRequestSchema.parse({ ...request, comment: 'Позвонить у подъезда' }).comment).toBe('Позвонить у подъезда'); });
  it('requires consent', () => { expect(deliveryRequestSchema.safeParse({ ...request, consent: false }).success).toBe(false); });
  it('requires selected bouquets', () => { expect(deliveryRequestSchema.safeParse({ ...request, items: [] }).success).toBe(false); });
});