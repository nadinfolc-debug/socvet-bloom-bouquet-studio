import { describe, expect, it } from 'vitest';
import { requestSchema } from '@/lib/requests';
describe('Florist requests', () => {
  const request = { name: 'Анна', phone: '+79991234567', message: 'Весенний букет', consent: true };
  it('accepts a request with consent', () => { expect(requestSchema.safeParse(request).success).toBe(true); });
  it('rejects a request without consent', () => { expect(requestSchema.safeParse({ ...request, consent: false }).success).toBe(false); });
});