import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Новый клиент на каждый запрос: на сервере общий кэш утекал бы между визитами.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Данные, загруженные на сервере, передаются в браузер: страница не
    // перерисовывается и не показывает загрузку второй раз.
    dehydrate: () => ({ queryClient: dehydrate(queryClient) }),
    hydrate: (dehydrated) => {
      hydrate(queryClient, dehydrated.queryClient);
    },
  });

  return router;
};
