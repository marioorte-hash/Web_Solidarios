import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight,
  Calendar, Clock, GraduationCap, Shield, CheckCircle2,
} from "lucide-react";
import { useCart, useUpdateCartItem, useRemoveFromCart, useCartTotal } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

// Available pickup times
const PICKUP_TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "16:00", "16:30", "17:00", "17:30", "18:00",
];

// Available school classes
const CLASSES = [
  "1º ESO A", "1º ESO B", "1º ESO C", "1º ESO D", "1º ESO E",
  "2º ESO A", "2º ESO B", "2º ESO C", "2º ESO D", "2º ESO E",
  "3º ESO A", "3º ESO B", "3º ESO C", "3º ESO D", "3º ESO E",
  "4º ESO A", "4º ESO B", "4º ESO C", "4º ESO D", "4º ESO E",
  "1º Bach A", "1º Bach B", "1º Bach C", "1º Bach D", "1º Bach E",
  "2º Bach A", "2º Bach B", "2º Bach C", "2º Bach D", "2º Bach E",
  "Otro",
];

// Get min date (today)
function getMinDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

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

  // Checkout fields
  const [userConsent, setUserConsent] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [studentClass, setStudentClass] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");

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
    if (!userConsent) {
      toast({ title: "Consentimiento requerido", description: "Debes aceptar el envío de tus datos", variant: "destructive" });
      return;
    }
    if (!isStudent && (!pickupDate || !pickupTime)) {
      toast({ title: "Faltan datos", description: "Selecciona fecha y hora de recogida", variant: "destructive" });
      return;
    }
    if (isStudent && !studentClass) {
      toast({ title: "Faltan datos", description: "Indica tu clase", variant: "destructive" });
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await apiRequest("POST", "/api/orders", {
        promoCode: appliedPromo?.code,
        isStudent,
        studentClass: isStudent ? studentClass : undefined,
        pickupDate: isStudent ? undefined : pickupDate,
        pickupTime: isStudent ? undefined : pickupTime,
        userConsent,
      });
      const order = await res.json();
      qc.invalidateQueries({ queryKey: ["/api/cart"] });
      qc.invalidateQueries({ queryKey: ["/api/orders"] });
      setAppliedPromo(null);
      setPromoCode("");
      setUserConsent(false);
      setPickupDate("");
      setPickupTime("");
      setStudentClass("");
      setIsStudent(false);
      toast({
        title: "¡Pedido realizado! 🎉",
        description: `Pedido #${order.id} confirmado. Nos pondremos en contacto contigo pronto.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message?.replace(/^\d+: /, ""), variant: "destructive" });
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

            {/* Summary + Checkout */}
            <div className="space-y-4">
              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl border border-border/20 p-6">
                <h2 className="font-display font-bold text-xl mb-5">Resumen del pedido</h2>
                <div className="space-y-3 mb-5">
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
                <div>
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
              </div>

              {/* Pickup / Student Card */}
              <div className="bg-white rounded-2xl border border-border/20 p-6 space-y-5">
                <h2 className="font-display font-bold text-lg">Recogida del pedido</h2>

                {/* Student toggle */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/30 border border-primary/10">
                  <GraduationCap className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Soy estudiante del centro</p>
                    <p className="text-xs text-muted-foreground">Recojo en mi clase durante el horario escolar</p>
                  </div>
                  <button
                    data-testid="button-toggle-student"
                    onClick={() => { setIsStudent(!isStudent); setPickupDate(""); setPickupTime(""); setStudentClass(""); }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isStudent ? "bg-primary" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isStudent ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                {isStudent ? (
                  /* Student: choose class */
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Clase <span className="text-red-500">*</span>
                    </label>
                    <select
                      data-testid="select-student-class"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                      <option value="">Selecciona tu clase...</option>
                      {CLASSES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      Recibirás el pedido en tu clase durante el recreo
                    </p>
                  </div>
                ) : (
                  /* Non-student: choose date + time */
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        Fecha de recogida <span className="text-red-500">*</span>
                      </label>
                      <input
                        data-testid="input-pickup-date"
                        type="date"
                        value={pickupDate}
                        min={getMinDate()}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Hora de recogida <span className="text-red-500">*</span>
                      </label>
                      <select
                        data-testid="select-pickup-time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                      >
                        <option value="">Selecciona una hora...</option>
                        {PICKUP_TIMES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Consent + Finalize */}
              <div className="bg-white rounded-2xl border border-border/20 p-6 space-y-4">
                {/* Consent checkbox */}
                <label
                  data-testid="label-consent"
                  className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-colors ${
                    userConsent ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      data-testid="checkbox-consent"
                      type="checkbox"
                      checked={userConsent}
                      onChange={(e) => setUserConsent(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      userConsent ? "bg-primary border-primary" : "border-gray-300"
                    }`}>
                      {userConsent && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-primary" />
                      Acepto el envío de mis datos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Consiento que mis datos de sesión (nombre de usuario y email: <span className="font-medium text-foreground">{user?.email ?? "tu email"}</span>) sean enviados a Alumnos Solidarios para gestionar este pedido.
                    </p>
                  </div>
                </label>

                <button
                  data-testid="button-place-order"
                  onClick={handleOrder}
                  disabled={placingOrder || !userConsent}
                  className="btn-primary w-full flex items-center gap-2 justify-center disabled:opacity-50"
                >
                  {placingOrder ? "Procesando..." : (
                    <>Finalizar pedido <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    Debes <Link href="/auth" className="text-primary font-semibold">iniciar sesión</Link> para finalizar
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
