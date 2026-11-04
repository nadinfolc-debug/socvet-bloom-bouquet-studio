import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bouquetSchema } from "@/lib/bouquet-schema";
import { toAdminBouquet, type AdminBouquet, type StoredBouquet } from "./catalog-model";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
export type { AdminBouquet, AdminVariant, AdminCollection } from "./catalog-model";

type Context = { supabase: SupabaseClient<Database>; userId: string };
async function assertAdmin(context: Context) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Нет доступа");
}
function check(error: { message: string } | null) {
  if (error) throw new Error("Не удалось сохранить каталог. Проверьте подключение к базе.");
}
async function getBouquet(context: Context, id: string) {
  const { data, error } = await context.supabase.from("bouquets").select("*").eq("id", id).single();
  check(error);
  if (!data) throw new Error("Букет не найден");
  return data;
}
export const listBouquets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bouquets")
      .select("*")
      .order("updated_at", { ascending: false });
    check(error);
    return (data ?? []).map(toAdminBouquet);
  });

export const saveBouquet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => bouquetSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const previous = data.id ? await getBouquet(context, data.id) : null;
    const id = previous?.id ?? crypto.randomUUID();
    const images: AdminBouquet["images"] = [];
    const uploaded: string[] = [];
    try {
      for (const image of data.images) {
        if (image.kind === "existing") {
          const existing = previous?.details.images.find((i) => i.id === image.id);
          if (!existing) throw new Error("Фото не найдено");
          images.push(existing);
        } else {
          const bytes = Uint8Array.from(atob(image.data), (c) => c.charCodeAt(0));
          if (!bytes.length || bytes.length > 6_000_000)
            throw new Error("Недопустимый размер фото");
          const imageId = crypto.randomUUID();
          const path = `${id}/${imageId}.${image.mime.split("/")[1]}`;
          const { error } = await context.supabase.storage
            .from("bouquet-images")
            .upload(path, bytes, { contentType: image.mime });
          if (error) throw new Error("Не удалось загрузить фото");
          uploaded.push(path);
          images.push({
            id: imageId,
            url: import.meta.env["VITE_SUPABASE_URL"]
              ? `${import.meta.env["VITE_SUPABASE_URL"].replace(/\/+$/, "")}/storage/v1/object/public/bouquet-images/${path}`
              : context.supabase.storage.from("bouquet-images").getPublicUrl(path).data.publicUrl,
          });
        }
      }
      const variants = data.variants.map((v) => {
        if (v.id && !previous?.details.variants.some((old) => old.id === v.id))
          throw new Error("Вариант не найден");
        return {
          id: v.id ?? crypto.randomUUID(),
          name: v.name,
          price: v.price.toFixed(2),
          compareAtPrice: v.compareAtPrice?.toFixed(2) ?? null,
        };
      });
      const row: StoredBouquet = {
        id,
        handle: previous?.handle ?? id,
        status: data.visible ? "ACTIVE" : "DRAFT",
        updated_at: new Date().toISOString(),
        details: {
          title: data.title,
          description: data.description,
          composition: data.composition,
          size: data.size,
          tags: data.tags,
          collectionIds: data.collectionIds,
          soldOut: data.soldOut,
          optionName: data.optionName,
          variants,
          images,
          image: images[0]?.url ?? null,
          price: String(Math.min(...variants.map((v) => Number(v.price)))),
          currency: "RUB",
        },
      };
      const { error } = previous
        ? await context.supabase.from("bouquets").update(row).eq("id", id)
        : await context.supabase.from("bouquets").insert(row);
      check(error);
      return { id };
    } catch (error) {
      if (uploaded.length) await context.supabase.storage.from("bouquet-images").remove(uploaded);
      throw error;
    }
  });

const idSchema = z.object({ id: z.string().uuid() });
export const setBouquetVisible = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => idSchema.extend({ visible: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await getBouquet(context, data.id);
    const { error } = await context.supabase
      .from("bouquets")
      .update({ status: data.visible ? "ACTIVE" : "DRAFT", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    check(error);
    return { ok: true };
  });
export const duplicateBouquet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    idSchema.extend({ title: z.string().trim().min(1).max(120) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const source = await getBouquet(context, data.id);
    const id = crypto.randomUUID();
    const { error } = await context.supabase.from("bouquets").insert({
      ...source,
      id,
      handle: id,
      status: "DRAFT",
      updated_at: new Date().toISOString(),
      details: {
        ...source.details,
        title: data.title,
        variants: source.details.variants.map((v) => ({ ...v, id: crypto.randomUUID() })),
      },
    });
    check(error);
    return { id };
  });
export const deleteBouquet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("bouquets").delete().eq("id", data.id);
    check(error);
    return { ok: true };
  });
export const listCollections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("bouquet_collections")
      .select("*")
      .order("title");
    check(error);
    const { data: bouquets, error: bouquetError } = await context.supabase
      .from("bouquets")
      .select("*");
    check(bouquetError);
    return (data ?? []).map((c) => ({
      ...c,
      count: (bouquets ?? []).filter((b) => b.details.collectionIds.includes(c.id)).length,
    }));
  });
export const saveCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({ id: z.string().uuid().optional(), title: z.string().trim().min(1).max(80) })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const id = data.id ?? crypto.randomUUID();
    const { error } = await context.supabase
      .from("bouquet_collections")
      .upsert({ id, title: data.title });
    check(error);
    return { id };
  });
export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => idSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("bouquet_collections").delete().eq("id", data.id);
    check(error);
    return { ok: true };
  });
