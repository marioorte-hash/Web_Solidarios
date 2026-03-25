import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: user ?? null,
    isLoading,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (user) => {
      qc.setQueryData(["/api/auth/me"], user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      qc.setQueryData(["/api/auth/me"], null);
      qc.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });
}
