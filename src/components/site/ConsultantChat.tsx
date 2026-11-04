import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Flower2, Loader2, Send, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { askConsultant } from "@/lib/consultant.functions";
import {
  buildConsultantMessages,
  type ChatMessage,
  type ConsultantReply,
} from "@/lib/consultant-schema";
import { formatPrice } from "@/lib/catalog";

type DisplayMessage = ChatMessage & { products?: ConsultantReply["products"]; florist?: boolean };
const suggestions = [
  "Букет на день рождения до 5 000 ₽",
  "Как быстро доставите букет?",
  "Как ухаживать за букетом?",
];

export function ConsultantChat() {
  const ask = useServerFn(askConsultant);
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
  }, [messages, pending, error]);

  const send = async (text: string) => {
    if (inFlight.current || !consent || !text.trim()) return;
    inFlight.current = true;
    setPending(text.trim());
    setDraft(text.trim());
    setError("");
    const conversation = buildConsultantMessages(messages, text);
    try {
      const result = await ask({ data: { messages: conversation, consent: true } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setMessages((previous) => [
        ...previous,
        { role: "user", content: text.trim() },
        {
          role: "assistant",
          content: result.reply.answer,
          products: result.reply.products,
          florist: result.reply.florist,
        },
      ]);
      setDraft("");
    } catch {
      setError("Связь прервалась. Попробуйте ещё раз или оставьте заявку флористу.");
    } finally {
      setPending("");
      inFlight.current = false;
      input.current?.focus();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex min-h-12 items-center gap-2 rounded-full border border-primary/20 bg-background px-4 text-sm text-primary shadow-soft hover:bg-milk"
          aria-label="Открыть ИИ-консультанта"
        >
          <Flower2 className="size-5" />
          <span>Помочь с букетом?</span>
        </button>
      </SheetTrigger>
      <SheetContent className="flex h-[100dvh] w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b bg-milk px-5 pb-4 pt-6 text-left">
          <p className="eyebrow text-primary">Соцвет · ИИ-консультант</p>
          <SheetTitle className="font-display text-3xl font-normal">Найдём ваш букет</SheetTitle>
          <SheetDescription>Помогу выбрать цветы и расскажу о доставке и уходе.</SheetDescription>
        </SheetHeader>
        <div
          className="min-h-32 flex-1 overflow-y-auto p-5"
          role="log"
          aria-label="Переписка с ИИ-консультантом"
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="mb-5 rounded-2xl bg-milk p-4 text-sm leading-relaxed">
            Здравствуйте! Я ИИ-помощник Соцвета. Для кого выбираем букет и какой бюджет планируете?
          </div>
          {!messages.length && (
            <div className="mb-5 flex flex-col items-start gap-2">
              {suggestions.map((text) => (
                <button
                  type="button"
                  key={text}
                  disabled={!!pending}
                  onClick={() => {
                    setDraft(text);
                    input.current?.focus();
                  }}
                  className="rounded-2xl border px-3 py-2 text-left text-xs hover:border-primary disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === "user" ? "ml-8" : "mr-2"}`}>
              <p className="mb-1 text-xs text-muted-foreground">
                {message.role === "user" ? "Вы" : "ИИ-консультант"}
              </p>
              <p
                className={`whitespace-pre-wrap break-words rounded-2xl p-4 text-sm leading-relaxed ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-milk"}`}
              >
                {message.content}
              </p>
              {message.products?.map((product) => (
                <Link
                  key={product.id}
                  to="/product/$handle"
                  params={{ handle: product.handle }}
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-2xl border p-3 transition hover:border-primary"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt=""
                      loading="lazy"
                      className="h-20 w-16 rounded-xl object-contain"
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block font-display text-2xl">{product.title}</span>
                    <span className="block text-sm text-primary">
                      {product.multipleVariants ? "от " : ""}
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">Посмотреть букет →</span>
                  </span>
                </Link>
              ))}
              {message.florist && (
                <Link
                  to="/"
                  hash="individual-order"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-block text-sm text-primary underline"
                >
                  Оставить заявку флористу
                </Link>
              )}
            </div>
          ))}
          {pending && (
            <>
              <div className="mb-4 ml-8 rounded-2xl bg-primary p-4 text-sm text-primary-foreground">
                {pending}
              </div>
              <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Подбираю ответ…
              </p>
            </>
          )}
          {error && (
            <p role="alert" className="rounded-2xl border border-primary/20 p-4 text-sm">
              {error} Вопрос сохранён в поле ниже.
            </p>
          )}
          <div ref={end} />
        </div>
        <div className="shrink-0 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Это ИИ. Наличие и условия заказа подтверждает флорист. Не указывайте в чате телефон,
            адрес и платёжные данные.
          </p>
          <label className="mb-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              disabled={!!pending}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5"
            />
            <span>
              Согласен на передачу сообщений OpenAI для ответа.{" "}
              <Link to="/privacy" onClick={() => setOpen(false)} className="underline">
                Подробнее
              </Link>
            </span>
          </label>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <label htmlFor="consultant-question" className="sr-only">
              Ваш вопрос консультанту
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="consultant-question"
                ref={input}
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={1200}
                disabled={!!pending}
                placeholder="Повод, любимые цветы, бюджет…"
                className="min-w-0 flex-1 resize-none rounded-xl border bg-background p-3 text-base outline-none focus:border-primary disabled:opacity-60"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    void send(draft);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                aria-label={error ? "Повторить отправку вопроса" : "Отправить вопрос"}
                disabled={!consent || !draft.trim() || !!pending}
                className="size-11 shrink-0 rounded-full"
              >
                {pending ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </div>
          </form>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <Link
              to="/"
              hash="individual-order"
              onClick={() => setOpen(false)}
              className="text-primary underline"
            >
              Связаться с флористом
            </Link>
            <button
              type="button"
              disabled={!!pending || (!messages.length && !draft)}
              onClick={() => {
                setMessages([]);
                setDraft("");
                setError("");
              }}
              className="flex min-h-8 items-center gap-1 text-muted-foreground hover:text-primary disabled:opacity-40"
            >
              <Trash2 className="size-3" />
              Очистить чат
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
