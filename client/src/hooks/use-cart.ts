import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface CartItemWithProduct {
  id: number;
  sessionId: string;
  productId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: string;
    imageUrl: string;
    stock: number;
    category: string;
  };
}

export function useCart() {
  return useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    staleTime: 0,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { productId: number; quantity?: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId: data.productId, quantity: data.quantity ?? 1 });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cart"] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cart"] }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cart"] }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/cart"] }),
  });
}

export function useCartTotal(items: CartItemWithProduct[] | undefined) {
  if (!items) return { subtotal: 0, count: 0 };
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, count };
}
