"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@heroui/react";

export interface ProvidersProps {
  children: React.ReactNode;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

/**
 * Note there is no theme provider here on purpose.
 *
 * HeroUI resolves themes purely from `[data-theme="..."]` CSS selectors, so the
 * only thing that has to set that attribute is the route itself — which
 * SiteShell already does on the server. See components/layout/page-theme.tsx
 * for why next-themes was removed: its `useTheme` reads localStorage inside a
 * `useState` initializer with no SSR guard, which throws during prerender and
 * was silently reducing both pages to client-side rendering.
 */
export function Providers({ children }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
