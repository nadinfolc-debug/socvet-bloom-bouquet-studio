import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConsultantChat } from "@/components/site/ConsultantChat";
import { askConsultant } from "@/lib/consultant.functions";

vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/consultant.functions", () => ({ askConsultant: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    params,
    hash,
    children,
    onClick,
    className,
  }: {
    to: string;
    params?: { handle: string };
    hash?: string;
    children: ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a
      href={to.replace("$handle", params?.handle ?? "") + (hash ? `#${hash}` : "")}
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  ),
}));
const ask = vi.mocked(askConsultant);
const open = () => {
  render(<ConsultantChat />);
  fireEvent.click(screen.getByRole("button", { name: "Открыть ИИ-консультанта" }));
};
beforeEach(() => ask.mockReset());
afterEach(cleanup);

describe("Consultant chat", () => {
  it("requires consent and sends only chat text, then opens a real product card", async () => {
    ask.mockResolvedValue({
      ok: true,
      reply: {
        answer: "Вот нежный букет.",
        florist: false,
        products: [
          {
            id: "one",
            title: "Утро",
            handle: "utro",
            price: "4500",
            image: null,
            multipleVariants: false,
          },
        ],
      },
    });
    open();
    fireEvent.change(screen.getByLabelText("Ваш вопрос консультанту"), {
      target: { value: "Для мамы" },
    });
    expect(screen.getByRole("button", { name: "Отправить вопрос" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить вопрос" }));
    expect(await screen.findByText("Вот нежный букет.")).toBeInTheDocument();
    expect(ask).toHaveBeenCalledWith({
      data: { consent: true, messages: [{ role: "user", content: "Для мамы" }] },
    });
    expect(screen.getByRole("link", { name: /Утро/ })).toHaveAttribute("href", "/product/utro");
    fireEvent.click(screen.getByRole("button", { name: "Очистить чат" }));
    expect(screen.queryByText("Вот нежный букет.")).not.toBeInTheDocument();
  });
  it("preserves the question on an outage and lets the visitor retry", async () => {
    ask.mockResolvedValueOnce({ ok: false, message: "Сервис недоступен." }).mockResolvedValueOnce({
      ok: true,
      reply: { answer: "Попробуем подобрать.", products: [], florist: true },
    });
    open();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("Ваш вопрос консультанту"), {
      target: { value: "Нужен букет" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Отправить вопрос" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Сервис недоступен.");
    expect(screen.getByLabelText("Ваш вопрос консультанту")).toHaveValue("Нужен букет");
    fireEvent.click(screen.getByRole("button", { name: "Повторить отправку вопроса" }));
    await waitFor(() => expect(screen.getByText("Попробуем подобрать.")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Оставить заявку флористу" })).toHaveAttribute(
      "href",
      "/#individual-order",
    );
    expect(ask).toHaveBeenCalledTimes(2);
  });
  it("renders model output as text instead of executable markup", async () => {
    ask.mockResolvedValue({
      ok: true,
      reply: { answer: "<img src=x onerror=alert(1)>", products: [], florist: false },
    });
    open();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByLabelText("Ваш вопрос консультанту"), {
      target: { value: "Привет" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Отправить вопрос" }));
    expect(await screen.findByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
