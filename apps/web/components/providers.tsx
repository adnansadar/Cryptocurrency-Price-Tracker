"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { clearLegacyWorkspaceStorage } from "@/lib/theme";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 45_000, retry: 2, refetchOnWindowFocus: true },
        },
      }),
  );
  useEffect(() => clearLegacyWorkspaceStorage(), []);
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
