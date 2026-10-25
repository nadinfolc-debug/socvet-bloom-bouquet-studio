import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
});
export const statuses = { new: 'Новая', processing: 'В работе', done: 'Завершена' } as const;
export type RequestStatus = keyof typeof statuses;
export async function submitRequest(input: unknown) {
  const data = requestSchema.parse(input);
  const { error } = await supabase.from('florist_requests').insert(data);
  if (error) throw error;
}
export const requestsQuery = {
  queryKey: ['florist-requests'],
  queryFn: async () => {
    const { data, error } = await supabase.from('florist_requests').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return data;
  },
};