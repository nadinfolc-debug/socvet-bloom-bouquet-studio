import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitPortfolioOrder } from "@/lib/portfolio-order.functions";

/** CTA портфолио: форма на сайте, без публичной ссылки на бота и без лички. */
export function PortfolioOrderDialog() {
  const submit = useServerFn(submitPortfolioOrder);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  return (
    <Dialog
      onOpenChange={() => {
        setSent(false);
        setError("");
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="eyebrow inline-flex min-h-12 items-center justify-center rounded-full bg-blush px-7 py-3 text-ink hover:bg-ink-foreground"
        >
          Заказать проект →
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle className="font-display text-4xl">Заказать проект</DialogTitle>
        <DialogDescription>
          Кейс «Соцвет» · заявка придёт только мне, без перехода в Telegram
        </DialogDescription>
        {sent ? (
          <p role="status" className="py-8">
            Спасибо! Заявка отправлена — отвечу в ближайшее время.
          </p>
        ) : (
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const form = new FormData(e.currentTarget);
              if (form.get("consent") !== "on") {
                setError("Нужно согласие на обработку данных");
                setBusy(false);
                return;
              }
              try {
                await submit({
                  data: {
                    name: String(form.get("name") ?? ""),
                    contact: String(form.get("contact") ?? ""),
                    message: String(form.get("message") ?? ""),
                    consent: true,
                  },
                });
                setSent(true);
              } catch {
                setError("Не удалось отправить заявку. Попробуйте ещё раз чуть позже.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="portfolio-name">Ваше имя</Label>
              <Input id="portfolio-name" name="name" autoComplete="name" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-contact">Телефон или Telegram</Label>
              <Input
                id="portfolio-contact"
                name="contact"
                autoComplete="tel"
                required
                minLength={3}
                maxLength={120}
                placeholder="@username или +7…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-message">О проекте</Label>
              <Textarea
                id="portfolio-message"
                name="message"
                required
                maxLength={2000}
                placeholder="Ниша, что нужно сделать, срок и бюджет — если есть ориентир"
              />
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input className="mt-1" type="checkbox" name="consent" required />
              <span>
                Согласен с{" "}
                <Link to="/privacy" className="underline">
                  политикой конфиденциальности
                </Link>{" "}
                и обработкой персональных данных
              </span>
            </label>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Отправляем…" : "Отправить заявку"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
