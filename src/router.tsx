import { QueryClient, dehydrate, hydrate, type DehydratedState } from "@tanstack/react-query";
import { createRouter, type Serializable } from "@tanstack/react-router";
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
    dehydrate: () => ({ queryClient: dehydrate(queryClient) as unknown as Serializable }),
    hydrate: (dehydrated) => {
      hydrate(queryClient, dehydrated.queryClient as unknown as DehydratedState);
    },
  });

  return router;
};
