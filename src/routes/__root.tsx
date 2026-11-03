import { FloatingContact } from '@/components/site/HomeSections';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { useCartSync } from "@/hooks/useCartSync";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { supabase } from '@/integrations/supabase/client';

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="display-xl text-primary">404</h1>
        <p className="mt-4 font-display text-2xl italic">Этот лепесток унёс ветер</p>
        <Link to="/" className="eyebrow mt-8 inline-block rounded-full bg-primary px-8 py-4 text-primary-foreground">
          На главную
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-4xl">Страница не загрузилась</h1>
        <p className="mt-2 text-sm text-muted-foreground">Попробуйте обновить или вернитесь на главную.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="eyebrow rounded-full bg-primary px-6 py-3 text-primary-foreground"
          >
            Ещё раз
          </button>
          <a href="/" className="eyebrow rounded-full border px-6 py-3">
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Соцвет — авторская флористика в Москве" },
      { name: "description", content: "Цветы как искусство: скульптурные букеты и необычные сочетания. Чувства обретают форму." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
        {/* Блоки скрыты до появления в поле зрения; при выключенном JS остаются видимыми */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-reveal')" }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) return;
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
      else queryClient.removeQueries({ queryKey: ['florist-requests'] });
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  useCartSync();
  useScrollReveal();

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
