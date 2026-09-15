"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import type { AuthCapabilities } from "@crypto-terminal/contracts";
import { getAuthCapabilities } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};
type AuthContextValue = {
  user: AuthUser | null;
  capabilities: AuthCapabilities;
  isPending: boolean;
  refreshSession: () => Promise<unknown>;
  signOut: () => Promise<void>;
};

const disabledCapabilities: AuthCapabilities = {
  enabled: false,
  emailPassword: false,
  google: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const capabilities = useQuery({
    queryKey: ["auth", "capabilities"],
    queryFn: getAuthCapabilities,
    staleTime: 5 * 60_000,
  });
  const session = useQuery({
    queryKey: ["auth", "session"],
    enabled: capabilities.data?.enabled === true,
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error) throw new Error(result.error.message);
      return (result.data?.user ?? null) as AuthUser | null;
    },
    staleTime: 30_000,
    retry: false,
  });

  async function refreshSession() {
    return queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
  }

  async function signOut() {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: ["workspace"] });
    await refreshSession();
  }

  return (
    <AuthContext.Provider
      value={{
        user: session.data ?? null,
        capabilities: capabilities.data ?? disabledCapabilities,
        isPending:
          capabilities.isPending ||
          (capabilities.data?.enabled === true && session.isPending),
        refreshSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
