import { z } from "zod";

const money = z.coerce.number().positive("Укажите цену").max(10_000_000);

export const variantSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().max(60).default(""),
    price: money,
    compareAtPrice: z.coerce.number().positive().max(10_000_000).nullable().optional(),
  })
  .refine((v) => v.compareAtPrice == null || v.compareAtPrice > v.price, {
    message: "Старая цена должна быть больше текущей",
    path: ["compareAtPrice"],
  });

export const imageInputSchema = z.union([
  z.object({ kind: z.literal("existing"), id: z.string().uuid() }),
  z.object({
    kind: z.literal("new"),
    data: z.string().max(8_000_000),
    mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  }),
]);

export const bouquetSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1, "Укажите название").max(120),
    description: z.string().trim().max(3000).default(""),
    composition: z.string().trim().max(1000).default(""),
    size: z.string().trim().max(200).default(""),
    visible: z.boolean(),
    soldOut: z.boolean().default(false),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    collectionIds: z.array(z.string().uuid()).max(20).default([]),
    optionName: z.string().trim().max(40).default("Размер"),
    variants: z.array(variantSchema).min(1, "Добавьте цену").max(10),
    images: z.array(imageInputSchema).min(1, "Добавьте хотя бы одно фото").max(10),
  })
  .superRefine((b, ctx) => {
    if (b.variants.length > 1) {
      const names = b.variants.map((v) => v.name.toLowerCase());
      if (names.some((n) => !n))
        ctx.addIssue({ code: "custom", message: "Назовите каждый вариант", path: ["variants"] });
      else if (new Set(names).size !== names.length)
        ctx.addIssue({
          code: "custom",
          message: "Названия вариантов повторяются",
          path: ["variants"],
        });
    }
  });
export type BouquetInput = z.infer<typeof bouquetSchema>;
