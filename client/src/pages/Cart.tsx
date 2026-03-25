import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Package } from "lucide-react";
import { useCart, useUpdateCartItem, useRemoveFromCart, useCartTotal } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function Cart() {
  const { data: items, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const { subtotal, count } = useCartTotal(items);
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const discount = appliedPromo ? subtotal * (appliedPromo.discount / 100) : 0;
  const total = subtotal - discount;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setCheckingPromo(true);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        toast({ title: "Código inválido", description: err.message, variant: "destructive" });
        return;
      }
      const promo = await res.json();
      setAppliedPromo(promo);
      toast({ title: "¡Código aplicado!", description: `Descuento del ${promo.discount}%` });
    } catch {
      toast({ title: "Error", description: "No se pudo validar el código", variant: "destructive" });
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para completar tu compra", variant: "destructive" });
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await apiRequest("POST", "/api/orders", { promoCode: appliedPromo?.code });
      const order = await res.json();
      qc.invalidateQueries({ queryKey: ["/api/cart"] });
      setAppliedPromo(null);
      setPromoCode("");
      toast({ title: "¡Pedido realizado!", description: `Tu pedido #${order.id} ha sido creado. Te contactaremos pronto.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom">
        <h1 className="text-4xl font-display font-bold mb-8">Mi carrito</h1>

        {!items || items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8">Descubre nuestros productos solidarios</p>
            <Link href="/tienda" className="btn-primary">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-white rounded-2xl border border-border/20 p-4 flex items-center gap-4"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <Link href={`/tienda/${item.productId}`}>
                      <img
                        src={`${item.product.imageUrl}?w=100&h=100&fit=crop&auto=format`}
                        alt={item.product.title}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/tienda/${item.productId}`}>
                        <h3 className="font-display font-bold line-clamp-1 hover:text-primary transition-colors">{item.product.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.product.category}</p>
                      <p className="font-bold text-primary mt-1">{parseFloat(item.product.price).toFixed(2)}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`button-decrease-${item.id}`}
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span data-testid={`quantity-${item.id}`} className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        data-testid={`button-increase-${item.id}`}
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(parseFloat(item.product.price) * item.quantity).toFixed(2)}€</p>
                      <button
                        data-testid={`button-remove-${item.id}`}
                        onClick={() => removeItem.mutate(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-border/20 p-6 h-fit sticky top-24">
              <h2 className="font-display font-bold text-xl mb-6">Resumen del pedido</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({count} artículos)</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento ({appliedPromo.discount}%)</span>
                    <span>-{discount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="border-t border-border/20 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span data-testid="text-cart-total" className="text-primary">{total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Código promocional</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      data-testid="input-promo-code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="CÓDIGO"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    />
                  </div>
                  <button
                    data-testid="button-apply-promo"
                    onClick={handleApplyPromo}
                    disabled={checkingPromo || !promoCode.trim()}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {checkingPromo ? "..." : "Aplicar"}
                  </button>
                </div>
              </div>

              <button
                data-testid="button-place-order"
                onClick={handleOrder}
                disabled={placingOrder}
                className="btn-primary w-full flex items-center gap-2 justify-center"
              >
                {placingOrder ? "Procesando..." : (
                  <>Finalizar pedido <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Debes <Link href="/auth" className="text-primary font-semibold">iniciar sesión</Link> para finalizar
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
