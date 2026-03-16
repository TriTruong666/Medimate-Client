/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";
import * as AuthService from "@/apis/auth.service";

// Derive Role directly from the backend User type
export type Role = User["role"];

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await AuthService.getMe();
      if (!res.success) throw new Error("Not authenticated");
      return res.data ?? null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const user = isError ? null : (data ?? null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
