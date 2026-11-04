import { buildDeliveryMessage } from "./delivery-message";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { deliveryRequestSchema, deliveryLinesSchema } from "@/lib/delivery-schema";
import { toCatalogProduct, resolveDeliveryLines } from "./catalog-model";

export const submitDeliveryRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => deliveryRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
    if (!key || !url) throw new Error("Не удалось отправить заявку");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
            headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data: bouquets, error: catalogError } = await client
      .from("bouquets")
      .select("*")
      .eq("status", "ACTIVE");
    if (catalogError) throw new Error("Не удалось проверить состав корзины");
    const lines = deliveryLinesSchema.parse(
      resolveDeliveryLines(
        (bouquets ?? []).map((row) => toCatalogProduct(row)),
        data.items,
      ),
    );
    const id = crypto.randomUUID();
    const { error } = await client.from("florist_requests").insert({
      id,
      name: "Заказ букета",
      phone: data.phone,
      message: buildDeliveryMessage(data),
      consent: true,
      delivery_address: data.address,
      desired_delivery_time: data.desiredTime,
      order_lines: lines,
    });
    if (error) throw new Error("Не удалось отправить заявку");
    return { id };
  });
