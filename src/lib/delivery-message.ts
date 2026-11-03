export const DELIVERY_SLOTS = ['09:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00', '21:00–23:00'];

export function buildDeliveryMessage(d: { comment?: string; recipientName?: string; recipientPhone?: string; cardText?: string }) {
  const parts: string[] = [];
  if (d.recipientName || d.recipientPhone) parts.push(`Получатель: ${[d.recipientName, d.recipientPhone].filter(Boolean).join(', ')}`);
  if (d.cardText) parts.push(`Открытка: «${d.cardText}»`);
  if (d.comment) parts.push(`Комментарий: ${d.comment}`);
  return parts.join('\n') || 'Без комментария';
}
