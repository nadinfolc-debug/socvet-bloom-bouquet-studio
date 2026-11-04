import { describe, expect, it } from 'vitest';
import { bouquetSchema } from '@/lib/bouquet-schema';
import { statuses, activeStatuses, isClosed } from '@/lib/requests';

const base = { title: 'Утро', visible: true, variants: [{ name: '', price: 4500 }], images: [{ kind: 'existing', id: '11111111-1111-4111-8111-111111111111' }] };

describe('Order statuses', () => {
  it('has the seven agreed statuses', () => {
    expect(Object.keys(statuses)).toEqual(['new', 'confirmed', 'paid', 'assembling', 'shipping', 'delivered', 'cancelled']);
  });
  it('treats delivered and cancelled as closed, others as active', () => {
    expect(isClosed('delivered')).toBe(true);
    expect(isClosed('cancelled')).toBe(true);
    expect(activeStatuses).not.toContain('delivered');
    expect(activeStatuses).toContain('new');
  });
});

describe('Bouquet validation', () => {
  it('accepts a simple bouquet', () => { expect(bouquetSchema.safeParse(base).success).toBe(true); });
  it('rejects zero price', () => { expect(bouquetSchema.safeParse({ ...base, variants: [{ name: '', price: 0 }] }).success).toBe(false); });
  it('rejects old price not above the price', () => { expect(bouquetSchema.safeParse({ ...base, variants: [{ name: '', price: 5000, compareAtPrice: 4000 }] }).success).toBe(false); });
  it('accepts old price above the price', () => { expect(bouquetSchema.safeParse({ ...base, variants: [{ name: '', price: 5000, compareAtPrice: 6000 }] }).success).toBe(true); });
  it('requires at least one photo', () => { expect(bouquetSchema.safeParse({ ...base, images: [] }).success).toBe(false); });
  it('requires distinct names for several variants', () => {
    expect(bouquetSchema.safeParse({ ...base, variants: [{ name: 'M', price: 1 }, { name: 'm', price: 2 }] }).success).toBe(false);
    expect(bouquetSchema.safeParse({ ...base, variants: [{ name: 'M', price: 1 }, { name: 'L', price: 2 }] }).success).toBe(true);
  });
});
