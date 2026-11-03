import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getRouter } from "@/router";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function Page() {
  useScrollReveal();
  return (
    <div>
      <section data-reveal data-delay="1">Первый блок</section>
      <section data-reveal>Второй блок</section>
    </div>
  );
}

describe("Плавное появление блоков", () => {
  it("показывает блок, когда он въезжает в поле зрения", async () => {
    const { container } = render(<Page />);
    const block = container.querySelector<HTMLElement>("[data-reveal]");
    expect(block).not.toBeNull();

    // Блок под сгибом экрана — показывать рано.
    block!.getBoundingClientRect = () =>
      ({ top: 5000, height: 200, bottom: 5200, left: 0, right: 800, width: 800 }) as DOMRect;
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => requestAnimationFrame(r));
    expect(block!.hasAttribute("data-shown")).toBe(false);

    // Блок поднялся в поле зрения — скрипт его показывает.
    block!.getBoundingClientRect = () =>
      ({ top: 100, height: 200, bottom: 300, left: 0, right: 800, width: 800 }) as DOMRect;
    window.dispatchEvent(new Event("scroll"));
    await waitFor(() => expect(block!.hasAttribute("data-shown")).toBe(true));
  });

  it("показывает все блоки, уже видимые при открытии страницы", () => {
    const { container } = render(<Page />);
    const blocks = container.querySelectorAll("[data-reveal]");
    expect(blocks.length).toBe(2);
    blocks.forEach((b) => expect(b.hasAttribute("data-shown")).toBe(true));
  });
});

describe("Передача серверных данных в браузер", () => {
  it("переносит загруженные на сервере данные в клиентский кэш", async () => {
    const server = getRouter();
    server.options.context.queryClient.setQueryData(["products", 6], [{ title: "Утро в саду" }]);

    const transferred = await server.options.dehydrate!();

    const browser = getRouter();
    await browser.options.hydrate!(transferred);
    expect(browser.options.context.queryClient.getQueryData(["products", 6])).toEqual([
      { title: "Утро в саду" },
    ]);
  });
});
