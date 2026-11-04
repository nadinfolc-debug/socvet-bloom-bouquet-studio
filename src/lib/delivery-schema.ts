import { z } from "zod";

export const deliveryRequestSchema = z.object({
  address: z.string().trim().min(1, "Укажите адрес доставки").max(500),
  phone: z
    .string()
    .trim()
    .min(5, "Укажите номер телефона")
    .max(40)
    .regex(/^\+?[\d\s()-]+$/, "Проверьте номер телефона"),
  desiredTime: z.string().trim().min(1, "Укажите дату и желаемое время").max(100),
  comment: z.string().trim().max(2000).default(""),
  recipientName: z.string().trim().max(100).default(""),
  recipientPhone: z.string().trim().max(40).default(""),
  cardText: z.string().trim().max(500).default(""),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Нужно согласие на обработку персональных данных" }),
  }),
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1, "Корзина пуста")
    .max(100),
});

export const deliveryLinesSchema = z.array(
  z.object({
    variantId: z.string(),
    title: z.string(),
    variantTitle: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().finite().nonnegative(),
  }),
);
