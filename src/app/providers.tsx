"use client";

import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/hooks/use-auth";

const theme = createTheme({
  primaryColor: "blue",
  fontFamily: "system-ui, -apple-system, sans-serif",
  defaultRadius: "md",
});

function AuthInitializer({ children }: { children: ReactNode }) {
  const { initialized, refreshAuth } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      refreshAuth();
    }
  }, [initialized, refreshAuth]);

  return <>{children}</>;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </MantineProvider>
  );
}
