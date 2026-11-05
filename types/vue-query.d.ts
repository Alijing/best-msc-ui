import type { QueryClient } from "@tanstack/vue-query";

declare module "#app" {
  interface NuxtApp {
    $queryClient: QueryClient;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $queryClient: QueryClient;
  }
}

export {};
