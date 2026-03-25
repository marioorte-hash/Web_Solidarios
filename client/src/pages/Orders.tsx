import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, ArrowLeft, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { Order } from "@shared/schema";

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-50 text-yellow-700" },
  paid: { label: "Pagado", color: "bg-blue-50 text-blue-700" },
  shipped: { label: "Enviado", color: "bg-purple-50 text-purple-700" },
  delivered: { label: "Entregado", color: "bg-green-50 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700" },
};

export default function Orders() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (authLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-display font-bold mb-2">Inicia sesión</h2>
        <p className="text-muted-foreground mb-6">Debes iniciar sesión para ver tus pedidos.</p>
        <Link href="/auth" className="btn-primary">Iniciar sesión</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
        <h1 className="text-3xl font-display font-bold mb-8">Mis pedidos</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">No tienes pedidos aún</h2>
            <p className="text-muted-foreground mb-6">Visita nuestra tienda y realiza tu primera compra solidaria.</p>
            <Link href="/tienda" className="btn-primary">Ver tienda</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusLabel[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-600" };
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid={`order-${order.id}`}
                  className="bg-white rounded-2xl border border-border/20 p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold">Pedido #{order.id}</p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.createdAt as unknown as string).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{parseFloat(order.total as string).toFixed(2)}€</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
