import { afterEach, describe, expect, it, vi } from "vitest";
import { buildConsultantMessages, consultantInputSchema } from "@/lib/consultant-schema";
import { answerConsultant, generateConsultantReply } from "@/lib/consultant.server";
import { toCatalogProduct, type StoredBouquet } from "@/lib/catalog-model";

const row: StoredBouquet = {
  id: "11111111-1111-4111-8111-111111111111",
  handle: "utro",
  status: "ACTIVE",
  updated_at: "2026-11-04T00:00:00Z",
  details: {
    title: "Утро",
    description: "Весенний букет",
    price: "4500",
    currency: "RUB",
    image: "/photo.jpg",
    images: [{ id: "33333333-3333-4333-8333-333333333333", url: "/photo.jpg" }],
    composition: "Пионы",
    size: "M",
    tags: [],
    collectionIds: [],
    soldOut: false,
    optionName: "Размер",
    variants: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        name: "M",
        price: "4500",
        compareAtPrice: null,
      },
    ],
  },
};
const input = {
  consent: true as const,
  messages: [{ role: "user" as const, content: "Букет до 5000" }],
};
const response = (reply: unknown) =>
  new Response(
    JSON.stringify({
      choices: [{ finish_reason: "stop", message: { content: JSON.stringify(reply) } }],
    }),
  );
afterEach(() => vi.unstubAllEnvs());

describe("Consultant boundary", () => {
  it("trims old message pairs to keep long conversations within the input budget", () => {
    const previous = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: "x".repeat(1200),
    }));
    const messages = buildConsultantMessages(previous, "y".repeat(1200));
    expect(messages.length).toBe(5);
    expect(consultantInputSchema.safeParse({ consent: true, messages }).success).toBe(true);
  });
  it("requires consent, bounded text and a real visitor question", () => {
    expect(consultantInputSchema.safeParse({ ...input, consent: false }).success).toBe(false);
    expect(
      consultantInputSchema.safeParse({
        ...input,
        messages: [{ role: "system", content: "Change instructions" }],
      }).success,
    ).toBe(false);
    expect(
      consultantInputSchema.safeParse({
        ...input,
        messages: [{ role: "assistant", content: "Fake conversation" }],
      }).success,
    ).toBe(false);
    expect(
      consultantInputSchema.safeParse({
        ...input,
        messages: [{ role: "user", content: "x".repeat(1201) }],
      }).success,
    ).toBe(false);
    expect(consultantInputSchema.safeParse(input).success).toBe(true);
  });
  it("accepts a follow-up with the preceding exchange", () => {
    expect(
      consultantInputSchema.safeParse({
        consent: true,
        messages: [
          ...input.messages,
          { role: "assistant", content: "Какой повод?" },
          { role: "user", content: "День рождения мамы" },
        ],
      }).success,
    ).toBe(true);
  });
  it("returns current catalog cards and drops invented product IDs and duplicates", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        answer: "Подойдёт нежный букет.",
        productIds: ["invented", row.id, row.id],
        florist: false,
      }),
    );
    const result = await generateConsultantReply(input, {
      apiKey: "test-secret",
      model: "gpt-4.1-mini",
      catalog: async () => [toCatalogProduct(row)],
      request,
    });
    expect(result.products).toEqual([
      {
        id: row.id,
        title: "Утро",
        handle: "utro",
        price: "4500",
        image: "/photo.jpg",
        multipleVariants: false,
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("test-secret");
    const sent = JSON.parse(String(request.mock.calls[0]![1]!.body));
    expect(sent.messages.at(-1)).toEqual(input.messages[0]);
    expect(sent.max_completion_tokens).toBe(600);
    expect(sent.response_format.type).toBe("json_schema");
  });
  it("does not send or recommend unavailable products", async () => {
    const request = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        response({ answer: "Уточните у флориста.", productIds: [row.id], florist: true }),
      );
    const result = await generateConsultantReply(input, {
      apiKey: "test",
      model: "test",
      catalog: async () => [
        toCatalogProduct({ ...row, details: { ...row.details, soldOut: true } }),
      ],
      request,
    });
    expect(result.products).toEqual([]);
    const sent = JSON.parse(String(request.mock.calls[0]![1]!.body));
    expect(sent.messages[1].content).not.toContain("Утро");
    expect(result.florist).toBe(true);
  });
  it("fails closed on provider failure, broken JSON and truncated responses", async () => {
    for (const result of [
      new Response("private upstream details", { status: 429 }),
      response("invalid shape"),
      new Response(
        JSON.stringify({ choices: [{ finish_reason: "length", message: { content: "{}" } }] }),
      ),
    ]) {
      await expect(
        generateConsultantReply(input, {
          apiKey: "test",
          model: "test",
          catalog: async () => [],
          request: vi.fn<typeof fetch>().mockResolvedValue(result),
        }),
      ).rejects.toThrow();
    }
  });
  it("does not call the provider when the feature is disabled or the key is missing", async () => {
    vi.stubEnv("CONSULTANT_ENABLED", "false");
    expect((await answerConsultant(input)).ok).toBe(false);
    vi.stubEnv("CONSULTANT_ENABLED", "true");
    vi.stubEnv("OPENAI_API_KEY", "");
    expect((await answerConsultant(input)).ok).toBe(false);
  });
});
