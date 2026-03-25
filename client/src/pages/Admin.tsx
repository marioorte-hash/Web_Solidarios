import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, LayoutDashboard, Newspaper, Calendar, ShoppingBag, Tag, X, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { NewsItem, Activity, Product, PromoCode } from "@shared/schema";

// ── Helpers ──────────────────────────────────────────────────────────────────

function ConfirmDelete({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-red-600 font-medium">¿Seguro?</span>
      <button onClick={onConfirm} className="text-red-500 hover:text-red-700 p-1"><Check className="w-4 h-4" /></button>
      <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
    </div>
  );
}

function slugify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── News Section ─────────────────────────────────────────────────────────────

function NewsAdmin() {
  const { data: items, isLoading } = useQuery<NewsItem[]>({ queryKey: ["/api/news"] });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const upsert = useMutation({
    mutationFn: async (data: Partial<NewsItem>) => {
      if (data.id) {
        await apiRequest("PUT", `/api/news/${data.id}`, data);
      } else {
        await apiRequest("POST", "/api/news", { ...data, slug: slugify(data.title || "") });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/news"] });
      setEditing(null);
      toast({ title: "Guardado", description: "Noticia actualizada correctamente" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/news/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/news"] }); setDeletingId(null); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Noticias</h2>
        <button data-testid="button-new-news" onClick={() => setEditing({ title: "", summary: "", content: "", imageUrl: "" })} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva noticia
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">{editing.id ? "Editar noticia" : "Nueva noticia"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <input data-testid="input-news-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL Imagen</label>
              <input data-testid="input-news-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Resumen</label>
              <input data-testid="input-news-summary" value={editing.summary || ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Contenido</label>
              <textarea data-testid="input-news-content" rows={4} value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button data-testid="button-save-news" onClick={() => upsert.mutate(editing)} disabled={upsert.isPending} className="btn-primary py-2 px-6 text-sm disabled:opacity-50">{upsert.isPending ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-full border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <div key={item.id} data-testid={`admin-news-${item.id}`} className="bg-white rounded-xl border border-border/20 p-4 flex items-center gap-4">
              <img src={`${item.imageUrl}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <>
                    <button data-testid={`button-edit-news-${item.id}`} onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`button-delete-news-${item.id}`} onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activities Section ────────────────────────────────────────────────────────

function ActivitiesAdmin() {
  const { data: items, isLoading } = useQuery<Activity[]>({ queryKey: ["/api/activities"] });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Partial<Activity & { dateStr?: string }> | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const upsert = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, date: data.dateStr ? new Date(data.dateStr).toISOString() : data.date };
      if (data.id) await apiRequest("PUT", `/api/activities/${data.id}`, payload);
      else await apiRequest("POST", "/api/activities", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/activities"] });
      setEditing(null);
      toast({ title: "Guardado", description: "Actividad actualizada correctamente" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/activities/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/activities"] }); setDeletingId(null); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const startEdit = (item?: Activity) => {
    if (item) {
      const d = item.date ? new Date(item.date as unknown as string) : new Date();
      setEditing({ ...item, dateStr: d.toISOString().slice(0, 10) });
    } else {
      setEditing({ title: "", description: "", dateStr: "", location: "", imageUrl: "" });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Actividades y Eventos</h2>
        <button data-testid="button-new-activity" onClick={() => startEdit()} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva actividad
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">{editing.id ? "Editar actividad" : "Nueva actividad"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <input data-testid="input-activity-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha</label>
              <input data-testid="input-activity-date" type="date" value={editing.dateStr || ""} onChange={(e) => setEditing({ ...editing, dateStr: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ubicación</label>
              <input data-testid="input-activity-location" value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">URL Imagen</label>
              <input data-testid="input-activity-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <textarea data-testid="input-activity-desc" rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button data-testid="button-save-activity" onClick={() => upsert.mutate(editing)} disabled={upsert.isPending} className="btn-primary py-2 px-6 text-sm disabled:opacity-50">{upsert.isPending ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-full border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <div key={item.id} data-testid={`admin-activity-${item.id}`} className="bg-white rounded-xl border border-border/20 p-4 flex items-center gap-4">
              <img src={`${item.imageUrl}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.location} · {new Date(item.date as unknown as string).toLocaleDateString("es-ES")}</p>
              </div>
              <div className="flex items-center gap-2">
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <>
                    <button data-testid={`button-edit-activity-${item.id}`} onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`button-delete-activity-${item.id}`} onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Products Section ──────────────────────────────────────────────────────────

function ProductsAdmin() {
  const { data: items, isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  const upsert = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      if (data.id) await apiRequest("PUT", `/api/products/${data.id}`, data);
      else await apiRequest("POST", "/api/products", { ...data, isActive: true });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      setEditing(null);
      toast({ title: "Guardado", description: "Producto actualizado correctamente" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); setDeletingId(null); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const addImage = useMutation({
    mutationFn: async ({ productId, imageUrl }: { productId: number; imageUrl: string }) => {
      await apiRequest("POST", `/api/products/${productId}/images`, { imageUrl });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/products"] });
      setNewImageUrl("");
      toast({ title: "Imagen añadida" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Productos de la Tienda</h2>
        <button data-testid="button-new-product" onClick={() => setEditing({ title: "", description: "", price: "0", category: "", stock: 0, imageUrl: "" })} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">{editing.id ? "Editar producto" : "Nuevo producto"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título</label>
              <input data-testid="input-product-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              <input data-testid="input-product-category" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Precio (€)</label>
              <input data-testid="input-product-price" type="number" step="0.01" value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Stock</label>
              <input data-testid="input-product-stock" type="number" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">URL Imagen principal</label>
              <input data-testid="input-product-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <textarea data-testid="input-product-desc" rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
          {editing.id && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Añadir imagen adicional</label>
              <div className="flex gap-2">
                <input data-testid="input-extra-image" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="URL de imagen" className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button data-testid="button-add-image" onClick={() => editing.id && newImageUrl && addImage.mutate({ productId: editing.id, imageUrl: newImageUrl })} className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-sm font-bold transition-all">Añadir</button>
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button data-testid="button-save-product" onClick={() => upsert.mutate(editing)} disabled={upsert.isPending} className="btn-primary py-2 px-6 text-sm disabled:opacity-50">{upsert.isPending ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-full border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <div key={item.id} data-testid={`admin-product-${item.id}`} className="bg-white rounded-xl border border-border/20 p-4 flex items-center gap-4">
              <img src={`${item.imageUrl}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.category} · {parseFloat(item.price as string).toFixed(2)}€ · Stock: {item.stock}</p>
              </div>
              <div className="flex items-center gap-2">
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <>
                    <button data-testid={`button-edit-product-${item.id}`} onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`button-delete-product-${item.id}`} onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Promo Codes Section ───────────────────────────────────────────────────────

function PromoCodesAdmin() {
  const { data: items, isLoading } = useQuery<PromoCode[]>({ queryKey: ["/api/promo-codes"] });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState({ code: "", discount: 10 });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/promo-codes", newCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      setCreating(false);
      setNewCode({ code: "", discount: 10 });
      toast({ title: "Código creado" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/promo-codes/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/promo-codes"] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/promo-codes/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/promo-codes"] }); setDeletingId(null); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Códigos Promocionales</h2>
        <button data-testid="button-new-promo" onClick={() => setCreating(true)} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo código
        </button>
      </div>

      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">Nuevo código promocional</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Código</label>
              <input data-testid="input-promo-code-value" value={newCode.code} onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })} placeholder="VERANO25" className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descuento (%)</label>
              <input data-testid="input-promo-discount" type="number" min="1" max="100" value={newCode.discount} onChange={(e) => setNewCode({ ...newCode, discount: Number(e.target.value) })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button data-testid="button-save-promo" onClick={() => create.mutate()} disabled={create.isPending || !newCode.code} className="btn-primary py-2 px-6 text-sm disabled:opacity-50">{create.isPending ? "Creando..." : "Crear"}</button>
            <button onClick={() => setCreating(false)} className="px-6 py-2 rounded-full border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : items?.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay códigos promocionales aún.</p>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <div key={item.id} data-testid={`admin-promo-${item.id}`} className="bg-white rounded-xl border border-border/20 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm font-mono">{item.code}</p>
                <p className="text-xs text-muted-foreground">{item.discount}% de descuento</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  data-testid={`button-toggle-promo-${item.id}`}
                  onClick={() => toggle.mutate({ id: item.id, isActive: !item.isActive })}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${item.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {item.isActive ? "Activo" : "Inactivo"}
                </button>
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <button data-testid={`button-delete-promo-${item.id}`} onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

type Tab = "news" | "activities" | "products" | "promos";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "news", label: "Noticias", icon: <Newspaper className="w-5 h-5" /> },
  { id: "activities", label: "Actividades", icon: <Calendar className="w-5 h-5" /> },
  { id: "products", label: "Tienda", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "promos", label: "Códigos", icon: <Tag className="w-5 h-5" /> },
];

export default function Admin() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("news");

  if (authLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-2xl font-display font-bold mb-2">Acceso restringido</h2>
          <p className="text-muted-foreground mb-6">Solo los administradores pueden acceder a este panel.</p>
          <button onClick={() => navigate("/")} className="btn-primary">Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom">
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-3">Panel de Administración</span>
          <h1 className="text-3xl font-display font-bold">Gestión de contenidos</h1>
          <p className="text-muted-foreground mt-1">Administra noticias, actividades, productos y códigos promocionales.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl border border-border/20 p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-foreground/60 hover:text-foreground hover:bg-gray-50"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
          {activeTab === "news" && <NewsAdmin />}
          {activeTab === "activities" && <ActivitiesAdmin />}
          {activeTab === "products" && <ProductsAdmin />}
          {activeTab === "promos" && <PromoCodesAdmin />}
        </div>
      </div>
    </div>
  );
}
