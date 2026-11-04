import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const portfolioOrderSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(3).max(120),
  message: z.string().trim().min(1).max(2000),
  consent: z.literal(true),
});

/**
 * Заявка на проект с кейса: форма на сайте → сервер → Telegram Bot API.
 * Ссылка на бота и личка на фронте не светятся; читаете только вы (chat_id из env).
 */
export const submitPortfolioOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => portfolioOrderSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (!token || !chatId) {
      throw new Error("Заявки временно недоступны. Напишите позже.");
    }

    const text = [
      "🆕 Заявка на проект (кейс Соцвет)",
      "",
      `Имя: ${data.name}`,
      `Контакт: ${data.contact}`,
      "",
      data.message,
    ].join("\n");

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const payload = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!res.ok || !payload?.ok) {
      console.error("Telegram sendMessage failed", payload?.description ?? res.status);
      throw new Error("Не удалось отправить заявку. Попробуйте ещё раз.");
    }

    return { ok: true as const };
  });
