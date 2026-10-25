import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export const requestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(40),
  message: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
});
export const statuses = { new: 'Новый', confirmed: 'Подтверждён', paid: 'Оплачен', assembling: 'Собирается', shipping: 'Передан в доставку', delivered: 'Доставлен', cancelled: 'Отменён' } as const;
export const statusTone: Record<keyof typeof statuses, string> = {
  new: 'bg-primary text-primary-foreground', confirmed: 'bg-accent text-accent-foreground', paid: 'bg-secondary text-secondary-foreground',
  assembling: 'bg-muted text-foreground', shipping: 'border border-primary text-primary', delivered: 'bg-foreground text-background', cancelled: 'bg-muted text-muted-foreground line-through',
};
/** Orders still needing the florist's attention. */
export const activeStatuses: RequestStatus[] = ['new', 'confirmed', 'paid', 'assembling', 'shipping'];
export const isClosed = (s: RequestStatus) => s === 'delivered' || s === 'cancelled';
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
export const historyQuery = (requestId: string) => ({
  queryKey: ['request-history', requestId],
  queryFn: async () => {
    const { data, error } = await supabase.from('request_status_history').select('status, changed_at').eq('request_id', requestId).order('changed_at');
    if (error) throw error;
    return data;
  },
});
