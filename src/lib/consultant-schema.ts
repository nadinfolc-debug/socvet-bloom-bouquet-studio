import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1200),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export const consultantInputSchema = z
  .object({
    messages: z.array(chatMessageSchema).min(1).max(12),
    consent: z.literal(true),
  })
  .superRefine(({ messages }, context) => {
    if (messages.at(-1)?.role !== "user")
      context.addIssue({ code: "custom", message: "Ожидается вопрос посетителя" });
    if (messages.reduce((sum, m) => sum + m.content.length, 0) > 8000)
      context.addIssue({ code: "custom", message: "Диалог слишком длинный. Начните новый." });
    if (messages.some((m, i) => m.role !== (i % 2 === 0 ? "user" : "assistant")))
      context.addIssue({ code: "custom", message: "Неверный порядок сообщений" });
  });
export type ConsultantInput = z.infer<typeof consultantInputSchema>;
export const modelReplySchema = z.object({
  answer: z.string().trim().min(1).max(1200),
  productIds: z.array(z.string()).max(3),
  florist: z.boolean(),
});
export type ConsultantProduct = {
  id: string;
  title: string;
  handle: string;
  price: string;
  image: string | null;
  multipleVariants: boolean;
};
export type ConsultantReply = { answer: string; products: ConsultantProduct[]; florist: boolean };
export type ConsultantResult =
  { ok: true; reply: ConsultantReply } | { ok: false; message: string };

export function buildConsultantMessages(previous: ChatMessage[], question: string): ChatMessage[] {
  const history = previous.slice(-10).map(({ role, content }) => ({ role, content }));
  while (
    history.length &&
    history.reduce((sum, m) => sum + m.content.length, question.length) > 8000
  ) {
    history.splice(0, 2);
  }
  return [...history, { role: "user", content: question.trim() }];
}
