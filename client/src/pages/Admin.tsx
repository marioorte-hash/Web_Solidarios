import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, LayoutDashboard, Newspaper, Calendar, ShoppingBag, Tag, X, Check, Package, GraduationCap, Clock, User, Heart, MessageSquare, Upload, Paperclip, Reply, Users, KeyRound, Shield, UserPlus, Settings, GripVertical, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, ListChecks, Type, Gift, Baby } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRef } from "react";
import type { NewsItem, Activity, Product, PromoCode, SponsorshipFormField } from "@shared/schema";

interface AdminSponsorship {
  id: number;
  userId: number;
  childName: string;
  childAge: number | null;
  country: string;
  school: string | null;
  monthlyAmount: string | null;
  startDate: string | null;
  notes: string | null;
  createdAt: string | null;
  userEmail: string | null;
  username: string | null;
}

interface AdminActivityReg {
  id: number;
  userId: number;
  activityId: number;
  notes: string | null;
  registeredAt: string | null;
  userEmail: string | null;
  username: string | null;
  activityTitle: string;
  activityDate: string;
  activityLocation: string;
}

interface AdminMessageItem {
  id: number;
  userId: number;
  subject: string;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isRead: boolean;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string | null;
  userEmail: string | null;
  username: string | null;
}

interface AdminOrderItem {
  productId: number;
  productTitle: string;
  quantity: number;
  price: string;
}
interface AdminOrder {
  id: number;
  createdAt: string | null;
  status: string;
  total: string;
  userEmail: string | null;
  username: string | null;
  isStudent: boolean;
  studentClass: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  userConsent: boolean;
  items: AdminOrderItem[];
}

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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      setEditing(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: "Imagen subida" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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
              <label className="text-sm font-medium mb-1 block">Imagen</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex gap-2">
                <input data-testid="input-news-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="URL o sube un archivo" className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />{uploading ? "..." : "Subir"}
                </button>
              </div>
              {editing.imageUrl && (
                <img src={editing.imageUrl} alt="" className="mt-2 h-16 w-24 object-cover rounded-lg border border-border/20" />
              )}
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
              <img src={item.imageUrl.startsWith("/") ? item.imageUrl : `${item.imageUrl}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
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
  const [actLang, setActLang] = useState<"ES" | "EN" | "DE">("ES");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      setEditing(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: "Imagen subida" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

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
    setActLang("ES");
  };

  const LANG_TABS = [
    { id: "ES" as const, flag: "🇪🇸", label: "Español" },
    { id: "EN" as const, flag: "🇬🇧", label: "English" },
    { id: "DE" as const, flag: "🇩🇪", label: "Deutsch" },
  ];

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

          {/* Language tabs */}
          <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-border/30 w-fit">
            {LANG_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActLang(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${actLang === tab.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-gray-50"}`}>
                <span>{tab.flag}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {actLang === "ES" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Título (ES)</label>
                  <input data-testid="input-activity-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </>
            )}
            {actLang === "EN" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Title (EN)</label>
                <input value={editing.titleEn || ""} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
            {actLang === "DE" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Titel (DE)</label>
                <input value={editing.titleDe || ""} onChange={(e) => setEditing({ ...editing, titleDe: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1 block">Fecha</label>
              <input data-testid="input-activity-date" type="date" value={editing.dateStr || ""} onChange={(e) => setEditing({ ...editing, dateStr: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ubicación</label>
              <input data-testid="input-activity-location" value={editing.location || ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Imagen</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex gap-2">
                <input data-testid="input-activity-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="URL o sube un archivo" className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />{uploading ? "..." : "Subir"}
                </button>
              </div>
              {editing.imageUrl && (
                <img src={editing.imageUrl} alt="" className="mt-2 h-16 w-24 object-cover rounded-lg border border-border/20" />
              )}
            </div>

            <div className="md:col-span-2">
              {actLang === "ES" && (
                <>
                  <label className="text-sm font-medium mb-1 block">Descripción (ES)</label>
                  <textarea data-testid="input-activity-desc" rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </>
              )}
              {actLang === "EN" && (
                <>
                  <label className="text-sm font-medium mb-1 block">Description (EN)</label>
                  <textarea rows={3} value={editing.descriptionEn || ""} onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </>
              )}
              {actLang === "DE" && (
                <>
                  <label className="text-sm font-medium mb-1 block">Beschreibung (DE)</label>
                  <textarea rows={3} value={editing.descriptionDe || ""} onChange={(e) => setEditing({ ...editing, descriptionDe: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </>
              )}
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
              {item.imageUrl && <img src={item.imageUrl.startsWith("/") ? item.imageUrl : `${item.imageUrl}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
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
  const [prodLang, setProdLang] = useState<"ES" | "EN" | "DE">("ES");
  const [uploadingProd, setUploadingProd] = useState(false);
  const fileRefProd = useRef<HTMLInputElement>(null);

  const handleImageUploadProd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingProd(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      setEditing(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: "Imagen subida" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingProd(false);
      if (fileRefProd.current) fileRefProd.current.value = "";
    }
  };

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

  const LANG_TABS = [
    { id: "ES" as const, flag: "🇪🇸", label: "Español" },
    { id: "EN" as const, flag: "🇬🇧", label: "English" },
    { id: "DE" as const, flag: "🇩🇪", label: "Deutsch" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Productos de la Tienda</h2>
        <button data-testid="button-new-product" onClick={() => { setEditing({ title: "", description: "", price: "0", category: "", stock: 0, imageUrl: "" }); setProdLang("ES"); }} className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">{editing.id ? "Editar producto" : "Nuevo producto"}</h3>

          {/* Language tabs */}
          <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-border/30 w-fit">
            {LANG_TABS.map(tab => (
              <button key={tab.id} onClick={() => setProdLang(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${prodLang === tab.id ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:bg-gray-50"}`}>
                <span>{tab.flag}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {prodLang === "ES" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Título (ES)</label>
                <input data-testid="input-product-title" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
            {prodLang === "EN" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Title (EN)</label>
                <input value={editing.titleEn || ""} onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
            {prodLang === "DE" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Titel (DE)</label>
                <input value={editing.titleDe || ""} onChange={(e) => setEditing({ ...editing, titleDe: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
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
              <label className="text-sm font-medium mb-1 block">Imagen principal</label>
              <input ref={fileRefProd} type="file" accept="image/*" className="hidden" onChange={handleImageUploadProd} />
              <div className="flex gap-2">
                <input data-testid="input-product-image" value={editing.imageUrl || ""} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })} placeholder="URL o sube un archivo" className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => fileRefProd.current?.click()} disabled={uploadingProd}
                  className="px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />{uploadingProd ? "..." : "Subir"}
                </button>
              </div>
              {editing.imageUrl && (
                <img src={editing.imageUrl.startsWith("/") ? editing.imageUrl : `${editing.imageUrl}?w=120&h=80&fit=crop&auto=format`} alt="" className="mt-2 h-16 w-24 object-cover rounded-lg border border-border/20" />
              )}
            </div>
            <div className="md:col-span-2">
              {prodLang === "ES" && (
                <>
                  <label className="text-sm font-medium mb-1 block">Descripción (ES)</label>
                  <textarea data-testid="input-product-desc" rows={3} value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </>
              )}
              {prodLang === "EN" && (
                <>
                  <label className="text-sm font-medium mb-1 block">Description (EN)</label>
                  <textarea rows={3} value={editing.descriptionEn || ""} onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </>
              )}
              {prodLang === "DE" && (
                <>
                  <label className="text-sm font-medium mb-1 block">Beschreibung (DE)</label>
                  <textarea rows={3} value={editing.descriptionDe || ""} onChange={(e) => setEditing({ ...editing, descriptionDe: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </>
              )}
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
              <img src={item.imageUrl.startsWith("/") ? item.imageUrl : `${item.imageUrl}?w=60&h=60&fit=crop&auto=format`} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.category} · {parseFloat(item.price as string).toFixed(2)}€ · Stock: {item.stock}</p>
              </div>
              <div className="flex items-center gap-2">
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <>
                    <button data-testid={`button-edit-product-${item.id}`} onClick={() => { setEditing(item); setProdLang("ES"); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
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

// ── Orders Section ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Pagado", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
};

function OrdersAdmin() {
  const { data: orders, isLoading } = useQuery<AdminOrder[]>({ queryKey: ["/api/admin/orders"] });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PUT", `/api/admin/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Estado actualizado" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Cargando pedidos…</div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground">Aún no hay pedidos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{orders.length} pedido{orders.length !== 1 ? "s" : ""} en total</p>
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-gray-100 text-gray-700" };
        return (
          <div key={order.id} data-testid={`order-card-${order.id}`} className="border border-border/20 rounded-xl overflow-hidden">
            {/* Header row */}
            <div
              className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-bold text-sm">Pedido #{order.id}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{order.userEmail ?? "Invitado"}</span>
              </div>

              {order.isStudent ? (
                <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {order.studentClass ?? "Estudiante"}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {order.pickupDate ? `${order.pickupDate} ${order.pickupTime ?? ""}` : "Sin hora"}
                </div>
              )}

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="font-bold text-primary">{parseFloat(order.total).toFixed(2)}€</span>

              <select
                data-testid={`select-order-status-${order.id}`}
                value={order.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Expanded items */}
            {isExpanded && (
              <div className="border-t border-border/20 bg-gray-50 p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Usuario</p>
                    <p className="font-medium">{order.username ?? "—"}</p>
                    <p className="text-muted-foreground">{order.userEmail ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Recogida</p>
                    {order.isStudent ? (
                      <p className="font-medium flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Clase: {order.studentClass}</p>
                    ) : (
                      <p className="font-medium">{order.pickupDate} a las {order.pickupTime}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Artículos del pedido</p>
                  <div className="space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm bg-white rounded-lg px-3 py-2 border border-border/10">
                        <span>{item.productTitle} <span className="text-muted-foreground">×{item.quantity}</span></span>
                        <span className="font-medium">{(parseFloat(item.price) * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm pt-1 border-t border-border/20">
                  <span>Total</span>
                  <span className="text-primary">{parseFloat(order.total).toFixed(2)}€</span>
                </div>
                {order.createdAt && (
                  <p className="text-xs text-muted-foreground">Realizado: {new Date(order.createdAt).toLocaleString("es-ES")}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sponsorship Form Builder ───────────────────────────────────────────────────

function FormFieldEditor({ field, onSaved, onClose }: {
  field?: SponsorshipFormField; onSaved: () => void; onClose: () => void;
}) {
  const { toast } = useToast();
  const [label, setLabel] = useState(field?.label ?? "");
  const [fieldType, setFieldType] = useState<"short_answer" | "multiple_choice">(
    (field?.fieldType as any) ?? "short_answer"
  );
  const [optionsText, setOptionsText] = useState(field?.options?.join("\n") ?? "");
  const [required, setRequired] = useState(field?.required ?? false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) { toast({ title: "El enunciado es obligatorio", variant: "destructive" }); return; }
    if (fieldType === "multiple_choice" && !optionsText.trim()) {
      toast({ title: "Añade al menos una opción", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const options = fieldType === "multiple_choice"
        ? optionsText.split("\n").map(o => o.trim()).filter(Boolean)
        : null;
      const body = { label: label.trim(), fieldType, options, required, sortOrder: field?.sortOrder ?? 0 };
      if (field) {
        await apiRequest("PUT", `/api/admin/sponsorship-form-fields/${field.id}`, body);
        toast({ title: "Pregunta actualizada" });
      } else {
        await apiRequest("POST", "/api/admin/sponsorship-form-fields", body);
        toast({ title: "Pregunta añadida" });
      }
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-accent/20 border border-primary/15 rounded-2xl p-5 mt-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-display font-bold">{field ? "Editar pregunta" : "Nueva pregunta"}</h4>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Enunciado de la pregunta <span className="text-red-500">*</span></label>
          <input data-testid="input-field-label" value={label} onChange={e => setLabel(e.target.value)} className={inputCls} placeholder="¿Cuál es tu motivación para apadrinar?" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Tipo de respuesta</label>
          <div className="flex gap-3">
            <button
              data-testid="btn-type-short"
              onClick={() => setFieldType("short_answer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${fieldType === "short_answer" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-gray-300"}`}>
              <Type className="w-4 h-4" /> Respuesta corta
            </button>
            <button
              data-testid="btn-type-multiple"
              onClick={() => setFieldType("multiple_choice")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${fieldType === "multiple_choice" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-gray-300"}`}>
              <ListChecks className="w-4 h-4" /> Opción múltiple
            </button>
          </div>
        </div>
        {fieldType === "multiple_choice" && (
          <div>
            <label className="text-sm font-medium block mb-1.5">Opciones <span className="text-xs text-muted-foreground">(una por línea)</span></label>
            <textarea data-testid="input-field-options" value={optionsText} onChange={e => setOptionsText(e.target.value)} rows={4}
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder={"Opción A\nOpción B\nOpción C"} />
          </div>
        )}
        <div className="flex items-center justify-between py-2 px-3 bg-white border border-border/30 rounded-xl">
          <div>
            <p className="text-sm font-semibold">Campo obligatorio</p>
            <p className="text-xs text-muted-foreground">El socio debe responder esta pregunta</p>
          </div>
          <button
            data-testid="toggle-required"
            onClick={() => setRequired(r => !r)}
            className={`transition-colors ${required ? "text-primary" : "text-muted-foreground"}`}>
            {required ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
          </button>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          <button data-testid="btn-save-field" onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
            {saving ? "Guardando..." : (field ? "Actualizar" : "Añadir pregunta")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FormBuilder() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: fields, isLoading } = useQuery<SponsorshipFormField[]>({ queryKey: ["/api/sponsorship-form-fields"] });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SponsorshipFormField | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/sponsorship-form-fields/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/sponsorship-form-fields"] }); setDeletingId(null); toast({ title: "Pregunta eliminada" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/admin/sponsorship-form-fields/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/sponsorship-form-fields"] }),
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const move = useMutation({
    mutationFn: ({ id, sortOrder }: { id: number; sortOrder: number }) =>
      apiRequest("PUT", `/api/admin/sponsorship-form-fields/${id}`, { sortOrder }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/sponsorship-form-fields"] }),
  });

  const handleSaved = () => { qc.invalidateQueries({ queryKey: ["/api/sponsorship-form-fields"] }); setShowForm(false); setEditing(null); };

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Cargando...</div>;

  const sorted = [...(fields ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="border border-border/20 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-border/20">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <p className="font-display font-bold">Configurar formulario de inscripción</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sorted.length} pregunta{sorted.length !== 1 ? "s" : ""} personalizada{sorted.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {!showForm && !editing && (
          <button data-testid="btn-add-field" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Añadir pregunta
          </button>
        )}
      </div>

      <div className="p-5 space-y-3">
        {showForm && !editing && (
          <FormFieldEditor onClose={() => setShowForm(false)} onSaved={handleSaved} />
        )}

        {sorted.length === 0 && !showForm ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <ListChecks className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p>No hay preguntas personalizadas aún.</p>
            <p className="text-xs mt-1">Añade preguntas que aparecerán en el formulario de apadrinamiento.</p>
          </div>
        ) : (
          sorted.map((f, i) => (
            <div key={f.id} data-testid={`form-field-${f.id}`}>
              {editing?.id === f.id ? (
                <FormFieldEditor field={f} onClose={() => setEditing(null)} onSaved={handleSaved} />
              ) : (
                <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${f.isActive ? "bg-white border-border/20" : "bg-gray-50 border-border/10 opacity-60"}`}>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <button onClick={() => i > 0 && move.mutate({ id: f.id, sortOrder: sorted[i - 1].sortOrder - 1 })}
                      disabled={i === 0} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => i < sorted.length - 1 && move.mutate({ id: f.id, sortOrder: sorted[i + 1].sortOrder + 1 })}
                      disabled={i === sorted.length - 1} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{f.label}</span>
                      {f.required && <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Obligatorio</span>}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${f.fieldType === "multiple_choice" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {f.fieldType === "multiple_choice" ? "Opción múltiple" : "Respuesta corta"}
                      </span>
                    </div>
                    {f.fieldType === "multiple_choice" && f.options && f.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {f.options.map((opt, oi) => (
                          <span key={oi} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{opt}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      data-testid={`toggle-field-${f.id}`}
                      onClick={() => toggle.mutate({ id: f.id, isActive: !f.isActive })}
                      title={f.isActive ? "Desactivar" : "Activar"}
                      className={`p-1.5 rounded-lg transition-colors ${f.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                      {f.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => setEditing(f)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    {deletingId === f.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => del.mutate(f.id)} className="px-2 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">Sí</button>
                        <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-gray-100 rounded-lg">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Sponsorships Admin ────────────────────────────────────────────────────────

function SponsorshipsAdmin() {
  const { data: items, isLoading } = useQuery<AdminSponsorship[]>({ queryKey: ["/api/admin/sponsorships"] });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-8">
      <FormBuilder />

      <div>
        <h2 className="text-xl font-display font-bold mb-2">Apadrinamientos registrados</h2>
        {!items || items.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-primary/15 rounded-2xl">
            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Aún no hay apadrinamientos registrados</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{items.length} apadrinamiento{items.length !== 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {items.map((item) => {
                const customResponses: Record<string, string> = item.customResponses
                  ? (() => { try { return JSON.parse(item.customResponses!); } catch { return {}; } })()
                  : {};
                return (
                  <div key={item.id} data-testid={`admin-sponsorship-${item.id}`}
                    className="bg-white border border-border/20 rounded-xl p-4 flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 items-baseline">
                        <span className="font-semibold">{item.childName}</span>
                        {item.childAge && <span className="text-sm text-muted-foreground">{item.childAge} años</span>}
                        <span className="text-sm text-muted-foreground">{item.country}</span>
                        {item.monthlyAmount && <span className="text-sm font-semibold text-primary">{parseFloat(item.monthlyAmount).toFixed(2)}€/mes</span>}
                      </div>
                      {item.school && <p className="text-xs text-muted-foreground mt-0.5">Escuela: {item.school}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Socio: <span className="font-medium">{item.username ?? "—"}</span> · {item.userEmail ?? "—"}
                      </p>
                      {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{item.notes}"</p>}
                      {Object.keys(customResponses).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(customResponses).map(([fieldId, resp]) => (
                            <p key={fieldId} className="text-xs text-muted-foreground">
                              <span className="font-medium">Campo {fieldId}:</span> {resp}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    {item.startDate && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">Desde {item.startDate}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Activity Registrations Admin ─────────────────────────────────────────────

function ActivityRegsAdmin() {
  const { data: items, isLoading } = useQuery<AdminActivityReg[]>({ queryKey: ["/api/admin/activity-registrations"] });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground">Aún no hay inscripciones</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold mb-6">Inscripciones a actividades</h2>
      <p className="text-sm text-muted-foreground mb-4">{items.length} inscripción{items.length !== 1 ? "es" : ""}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} data-testid={`admin-activity-reg-${item.id}`}
            className="bg-white border border-border/20 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{item.activityTitle}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.activityDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} · {item.activityLocation}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Socio: <span className="font-medium">{item.username ?? "—"}</span> · {item.userEmail ?? "—"}
              </p>
              {item.notes && <p className="text-xs text-muted-foreground italic mt-0.5">Nota: "{item.notes}"</p>}
            </div>
            {item.registeredAt && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(item.registeredAt).toLocaleDateString("es-ES")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Messages Admin ────────────────────────────────────────────────────────────

function MessagesAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<AdminMessageItem[]>({ queryKey: ["/api/admin/messages"] });
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const reply = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      apiRequest("PUT", `/api/admin/messages/${id}/reply`, { reply: text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      setReplyingId(null);
      setReplyText("");
      toast({ title: "Respuesta enviada" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/admin/messages/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/messages"] }),
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground">Aún no hay mensajes</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold mb-6">Mensajes</h2>
      <p className="text-sm text-muted-foreground mb-4">{items.filter(m => !m.isRead).length} sin leer · {items.length} total</p>
      <div className="space-y-3">
        {items.map((msg) => {
          const isOpen = expandedId === msg.id;
          const isReplying = replyingId === msg.id;
          return (
            <div key={msg.id} data-testid={`admin-message-${msg.id}`}
              className={`border rounded-xl overflow-hidden ${!msg.isRead ? "border-primary/30 bg-primary/5" : "border-border/20 bg-white"}`}>
              <button
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => {
                  setExpandedId(isOpen ? null : msg.id);
                  if (!msg.isRead) markRead.mutate(msg.id);
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.adminReply ? "bg-green-100" : "bg-primary/10"}`}>
                  <MessageSquare className={`w-4 h-4 ${msg.adminReply ? "text-green-600" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{msg.subject}</span>
                    {!msg.isRead && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                    {msg.adminReply && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">Respondido</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{msg.username ?? "—"} · {msg.userEmail ?? "—"}</p>
                </div>
                {msg.createdAt && <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(msg.createdAt).toLocaleDateString("es-ES")}</span>}
              </button>

              {isOpen && (
                <div className="border-t border-border/20 p-4 space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  {msg.attachmentUrl && (
                    <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                      <Paperclip className="w-3.5 h-3.5" />{msg.attachmentName || "Ver adjunto"}
                    </a>
                  )}
                  {msg.adminReply && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                        <Reply className="w-3.5 h-3.5" /> Tu respuesta
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.adminReply}</p>
                    </div>
                  )}
                  {!msg.adminReply && (
                    isReplying ? (
                      <div className="space-y-2">
                        <textarea
                          data-testid={`textarea-reply-${msg.id}`}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                          placeholder="Escribe tu respuesta..."
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setReplyingId(null); setReplyText(""); }}
                            className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-gray-50 transition-colors">
                            Cancelar
                          </button>
                          <button
                            data-testid={`button-send-reply-${msg.id}`}
                            onClick={() => reply.mutate({ id: msg.id, text: replyText })}
                            disabled={reply.isPending || !replyText.trim()}
                            className="flex-1 btn-primary text-xs py-2 disabled:opacity-50">
                            {reply.isPending ? "Enviando..." : "Enviar respuesta"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        data-testid={`button-reply-${msg.id}`}
                        onClick={() => setReplyingId(msg.id)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                        <Reply className="w-4 h-4" /> Responder
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Users Admin Section ───────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  createdAt: string | null;
}

function UsersAdmin() {
  const { data: userList, isLoading } = useQuery<AdminUser[]>({ queryKey: ["/api/admin/users"] });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [changingPasswordId, setChangingPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" as "admin" | "user" });

  const changePasswordMut = useMutation({
    mutationFn: (data: { id: number; password: string }) =>
      apiRequest("PATCH", `/api/admin/users/${data.id}/password`, { password: data.password }),
    onSuccess: () => {
      toast({ title: "Contraseña actualizada" });
      setChangingPasswordId(null);
      setNewPassword("");
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeletingId(null);
      toast({ title: "Usuario eliminado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createMut = useMutation({
    mutationFn: (data: typeof newUser) => apiRequest("POST", "/api/admin/users", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddForm(false);
      setNewUser({ username: "", email: "", password: "", role: "user" });
      toast({ title: "Socio/usuario creado correctamente" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold">Socios / Usuarios</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{userList?.length ?? 0} usuarios registrados</p>
        </div>
        <button
          data-testid="button-add-user"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo socio
        </button>
      </div>

      {showAddForm && (
        <div className="border border-border/30 rounded-2xl p-5 bg-accent/20 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /> Añadir nuevo socio/usuario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nombre de usuario</label>
              <input
                data-testid="input-new-username"
                type="text"
                placeholder="nombreusuario"
                value={newUser.username}
                onChange={(e) => setNewUser(p => ({ ...p, username: e.target.value }))}
                className="w-full h-9 rounded-xl border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email</label>
              <input
                data-testid="input-new-email"
                type="text"
                placeholder="correo@ejemplo.com"
                value={newUser.email}
                onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                className="w-full h-9 rounded-xl border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Contraseña inicial</label>
              <input
                data-testid="input-new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUser.password}
                onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                className="w-full h-9 rounded-xl border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Rol</label>
              <select
                data-testid="select-new-role"
                value={newUser.role}
                onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value as "admin" | "user" }))}
                className="w-full h-9 rounded-xl border border-input bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="user">Socio / Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="button-save-new-user"
              onClick={() => createMut.mutate(newUser)}
              disabled={createMut.isPending}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMut.isPending ? "Guardando..." : "Crear usuario"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-100 text-foreground/60 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {userList?.map((u) => (
          <div key={u.id} data-testid={`user-card-${u.id}`} className="border border-border/20 rounded-2xl p-4 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${u.role === "admin" ? "bg-primary/10" : "bg-muted"}`}>
                  {u.role === "admin" ? <Shield className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <p data-testid={`text-username-${u.id}`} className="font-semibold text-sm truncate">{u.username}</p>
                  <p data-testid={`text-email-${u.id}`} className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {u.role === "admin" ? "Administrador" : "Socio"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {changingPasswordId === u.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      data-testid={`input-change-password-${u.id}`}
                      type="password"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-36 h-8 rounded-lg border border-input bg-white px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      data-testid={`button-confirm-password-${u.id}`}
                      onClick={() => changePasswordMut.mutate({ id: u.id, password: newPassword })}
                      disabled={changePasswordMut.isPending || newPassword.length < 6}
                      className="text-green-600 hover:text-green-800 p-1 disabled:opacity-40"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setChangingPasswordId(null); setNewPassword(""); }} className="text-gray-400 hover:text-gray-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    data-testid={`button-change-password-${u.id}`}
                    onClick={() => setChangingPasswordId(u.id)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 font-semibold transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Contraseña
                  </button>
                )}

                {deletingId === u.id ? (
                  <ConfirmDelete onConfirm={() => deleteMut.mutate(u.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <button
                    data-testid={`button-delete-user-${u.id}`}
                    onClick={() => setDeletingId(u.id)}
                    className="text-red-400 hover:text-red-600 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Benefits Admin ────────────────────────────────────────────────────────────

interface Benefit {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string | null;
}

interface BenefitAssignment {
  id: number;
  benefitId: number;
  userId: number;
  assignedAt: string | null;
}

function BenefitAssignModal({ benefit, users, onClose }: {
  benefit: Benefit;
  users: AdminUser[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: assignments, isLoading } = useQuery<BenefitAssignment[]>({
    queryKey: ["/api/admin/benefits", benefit.id, "assignments"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/benefits/${benefit.id}/assignments`, { credentials: "include" });
      return res.json();
    },
  });

  const assignedUserIds = new Set(assignments?.map(a => a.userId) ?? []);
  const socios = users.filter(u => u.role === "user");

  const assign = useMutation({
    mutationFn: (userId: number) => apiRequest("POST", `/api/admin/benefits/${benefit.id}/assign`, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/benefits", benefit.id, "assignments"] }); toast({ title: "Beneficio asignado" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const unassign = useMutation({
    mutationFn: (userId: number) => apiRequest("DELETE", `/api/admin/benefits/${benefit.id}/assign/${userId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/benefits", benefit.id, "assignments"] }); toast({ title: "Asignación eliminada" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border/20">
          <div>
            <h3 className="font-display font-bold">Asignar beneficio</h3>
            <p className="text-sm text-muted-foreground">{benefit.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
          ) : socios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No hay socios registrados.</div>
          ) : (
            socios.map(u => {
              const isAssigned = assignedUserIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-border/20 hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-sm">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <button
                    data-testid={`toggle-benefit-${benefit.id}-user-${u.id}`}
                    onClick={() => isAssigned ? unassign.mutate(u.id) : assign.mutate(u.id)}
                    disabled={assign.isPending || unassign.isPending}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
                      isAssigned ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}>
                    {isAssigned ? "Quitar" : "Asignar"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitsAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<Benefit[]>({ queryKey: ["/api/admin/benefits"] });
  const { data: allUsers } = useQuery<AdminUser[]>({ queryKey: ["/api/admin/users"] });
  const [editing, setEditing] = useState<Partial<Benefit> | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [assigningBenefit, setAssigningBenefit] = useState<Benefit | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Error al subir imagen");
      const data = await res.json();
      setEditing(prev => ({ ...prev, imageUrl: data.url }));
      toast({ title: "Imagen subida" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const upsert = useMutation({
    mutationFn: async (data: Partial<Benefit>) => {
      if (data.id) await apiRequest("PUT", `/api/admin/benefits/${data.id}`, data);
      else await apiRequest("POST", "/api/admin/benefits", { ...data, isActive: true });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/benefits"] }); setEditing(null); toast({ title: "Guardado" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/benefits/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/benefits"] }); setDeletingId(null); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div>
      {assigningBenefit && allUsers && (
        <BenefitAssignModal benefit={assigningBenefit} users={allUsers} onClose={() => setAssigningBenefit(null)} />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Beneficios</h2>
        <button data-testid="button-new-benefit"
          onClick={() => setEditing({ title: "", description: "", imageUrl: "", isActive: true })}
          className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo beneficio
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">{editing.id ? "Editar beneficio" : "Nuevo beneficio"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Título <span className="text-red-500">*</span></label>
              <input data-testid="input-benefit-title" value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Imagen</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex gap-2">
                <input data-testid="input-benefit-image" value={editing.imageUrl || ""}
                  onChange={e => setEditing({ ...editing, imageUrl: e.target.value })}
                  placeholder="URL o sube una imagen"
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />{uploading ? "..." : "Subir"}
                </button>
              </div>
              {editing.imageUrl && (
                <img src={editing.imageUrl} alt="" className="mt-2 h-16 w-24 object-cover rounded-lg border border-border/20" />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Descripción <span className="text-red-500">*</span></label>
              <textarea data-testid="input-benefit-desc" rows={3} value={editing.description || ""}
                onChange={e => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button data-testid="button-save-benefit" onClick={() => upsert.mutate(editing)} disabled={upsert.isPending}
              className="btn-primary py-2 px-6 text-sm disabled:opacity-50">{upsert.isPending ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-full border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : !items || items.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-primary/20 rounded-2xl">
          <Gift className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Aún no hay beneficios creados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} data-testid={`admin-benefit-${item.id}`} className="bg-white rounded-xl border border-border/20 p-4 flex items-center gap-4">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {item.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid={`button-assign-benefit-${item.id}`}
                  onClick={() => setAssigningBenefit(item)}
                  className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors">
                  Asignar socios
                </button>
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <>
                    <button data-testid={`button-edit-benefit-${item.id}`} onClick={() => setEditing(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`button-delete-benefit-${item.id}`} onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

// ── Sponsored Children Admin ───────────────────────────────────────────────────

interface SponsoredChild {
  id: number;
  name: string;
  age: string | null;
  country: string;
  school: string | null;
  photoUrl: string | null;
  monthlyAmount: string | null;
  coverageDetails: string | null;
  notes: string | null;
  createdAt: string | null;
}

interface ChildAssignment {
  id: number;
  childId: number;
  userId: number;
  assignedAt: string | null;
}

function ChildAssignModal({ child, users, onClose }: {
  child: SponsoredChild;
  users: AdminUser[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: assignments, isLoading } = useQuery<ChildAssignment[]>({
    queryKey: ["/api/admin/sponsored-children", child.id, "assignments"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/sponsored-children/${child.id}/assignments`, { credentials: "include" });
      return res.json();
    },
  });

  const assignedUserIds = new Set(assignments?.map(a => a.userId) ?? []);
  const socios = users.filter(u => u.role === "user");

  const assign = useMutation({
    mutationFn: (userId: number) => apiRequest("POST", `/api/admin/sponsored-children/${child.id}/assign`, { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sponsored-children", child.id, "assignments"] }); toast({ title: "Niño asignado al socio" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const unassign = useMutation({
    mutationFn: (userId: number) => apiRequest("DELETE", `/api/admin/sponsored-children/${child.id}/assign/${userId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sponsored-children", child.id, "assignments"] }); toast({ title: "Asignación eliminada" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border/20">
          <div>
            <h3 className="font-display font-bold">Asignar niño a socios</h3>
            <p className="text-sm text-muted-foreground">{child.name} · {child.country}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Cargando...</div>
          ) : socios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No hay socios registrados.</div>
          ) : (
            socios.map(u => {
              const isAssigned = assignedUserIds.has(u.id);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-border/20 hover:bg-gray-50">
                  <div>
                    <p className="font-semibold text-sm">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <button
                    data-testid={`toggle-child-${child.id}-user-${u.id}`}
                    onClick={() => isAssigned ? unassign.mutate(u.id) : assign.mutate(u.id)}
                    disabled={assign.isPending || unassign.isPending}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
                      isAssigned ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}>
                    {isAssigned ? "Quitar" : "Asignar"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SponsoredChildrenAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<SponsoredChild[]>({ queryKey: ["/api/admin/sponsored-children"] });
  const { data: allUsers } = useQuery<AdminUser[]>({ queryKey: ["/api/admin/users"] });
  const [editing, setEditing] = useState<Partial<SponsoredChild> | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [assigningChild, setAssigningChild] = useState<SponsoredChild | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Error al subir foto");
      const data = await res.json();
      setEditing(prev => ({ ...prev, photoUrl: data.url }));
      toast({ title: "Foto subida" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const upsert = useMutation({
    mutationFn: async (data: Partial<SponsoredChild>) => {
      if (data.id) await apiRequest("PUT", `/api/admin/sponsored-children/${data.id}`, data);
      else await apiRequest("POST", "/api/admin/sponsored-children", data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sponsored-children"] }); setEditing(null); toast({ title: "Guardado" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/sponsored-children/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sponsored-children"] }); setDeletingId(null); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div>
      {assigningChild && allUsers && (
        <ChildAssignModal child={assigningChild} users={allUsers} onClose={() => setAssigningChild(null)} />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold">Niños apadrinados</h2>
        <button data-testid="button-new-child"
          onClick={() => setEditing({ name: "", country: "", age: "", school: "", photoUrl: "", monthlyAmount: "", coverageDetails: "", notes: "" })}
          className="btn-primary py-2 px-5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo niño
        </button>
      </div>

      {editing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 rounded-2xl p-6 mb-6 border border-primary/10">
          <h3 className="font-bold mb-4">{editing.id ? "Editar niño" : "Nuevo niño apadrinado"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre <span className="text-red-500">*</span></label>
              <input data-testid="input-child-name" value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">País <span className="text-red-500">*</span></label>
              <input data-testid="input-child-country" value={editing.country || ""} onChange={e => setEditing({ ...editing, country: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Edad</label>
              <input data-testid="input-child-age" value={editing.age || ""} onChange={e => setEditing({ ...editing, age: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="8 años" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Escuela</label>
              <input data-testid="input-child-school" value={editing.school || ""} onChange={e => setEditing({ ...editing, school: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Aportación mensual (€)</label>
              <input data-testid="input-child-amount" type="number" step="0.01" value={editing.monthlyAmount || ""}
                onChange={e => setEditing({ ...editing, monthlyAmount: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="30.00" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Foto</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <div className="flex gap-2">
                <input data-testid="input-child-photo" value={editing.photoUrl || ""}
                  onChange={e => setEditing({ ...editing, photoUrl: e.target.value })}
                  placeholder="URL o sube una foto"
                  className="flex-1 px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-3 py-2 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5" />{uploading ? "..." : "Subir"}
                </button>
              </div>
              {editing.photoUrl && (
                <img src={editing.photoUrl} alt="" className="mt-2 h-16 w-12 object-cover rounded-lg border border-border/20" />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Detalles de lo que cubre la aportación</label>
              <textarea data-testid="input-child-coverage" rows={3} value={editing.coverageDetails || ""}
                onChange={e => setEditing({ ...editing, coverageDetails: e.target.value })}
                placeholder="Alimentación, educación, material escolar..."
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Notas internas</label>
              <textarea data-testid="input-child-notes" rows={2} value={editing.notes || ""}
                onChange={e => setEditing({ ...editing, notes: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button data-testid="button-save-child" onClick={() => upsert.mutate(editing)} disabled={upsert.isPending}
              className="btn-primary py-2 px-6 text-sm disabled:opacity-50">{upsert.isPending ? "Guardando..." : "Guardar"}</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2 rounded-full border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : !items || items.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-primary/20 rounded-2xl">
          <Baby className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">Aún no hay niños registrados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} data-testid={`admin-child-${item.id}`} className="bg-white rounded-xl border border-border/20 p-4 flex items-center gap-4">
              {item.photoUrl ? (
                <img src={item.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Baby className="w-5 h-5 text-primary/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.country}{item.age ? ` · ${item.age}` : ""}{item.school ? ` · ${item.school}` : ""}
                  {item.monthlyAmount ? ` · ${parseFloat(item.monthlyAmount).toFixed(2)}€/mes` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button data-testid={`button-assign-child-${item.id}`}
                  onClick={() => setAssigningChild(item)}
                  className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors">
                  Asignar socios
                </button>
                {deletingId === item.id ? (
                  <ConfirmDelete onConfirm={() => del.mutate(item.id)} onCancel={() => setDeletingId(null)} />
                ) : (
                  <>
                    <button data-testid={`button-edit-child-${item.id}`} onClick={() => setEditing(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button data-testid={`button-delete-child-${item.id}`} onClick={() => setDeletingId(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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

// ── Main Admin Page ───────────────────────────────────────────────────────────

type Tab = "news" | "activities" | "products" | "promos" | "orders" | "sponsorships" | "activity-regs" | "messages" | "users" | "benefits" | "children";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "news", label: "Noticias", icon: <Newspaper className="w-5 h-5" /> },
  { id: "activities", label: "Actividades", icon: <Calendar className="w-5 h-5" /> },
  { id: "products", label: "Tienda", icon: <ShoppingBag className="w-5 h-5" /> },
  { id: "promos", label: "Códigos", icon: <Tag className="w-5 h-5" /> },
  { id: "orders", label: "Pedidos", icon: <Package className="w-5 h-5" /> },
  { id: "benefits", label: "Beneficios", icon: <Gift className="w-5 h-5" /> },
  { id: "children", label: "Niños", icon: <Baby className="w-5 h-5" /> },
  { id: "sponsorships", label: "Apadrinamientos", icon: <Heart className="w-5 h-5" /> },
  { id: "activity-regs", label: "Inscripciones", icon: <User className="w-5 h-5" /> },
  { id: "messages", label: "Mensajes", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "users", label: "Socios", icon: <Users className="w-5 h-5" /> },
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
          {activeTab === "orders" && <OrdersAdmin />}
          {activeTab === "benefits" && <BenefitsAdmin />}
          {activeTab === "children" && <SponsoredChildrenAdmin />}
          {activeTab === "sponsorships" && <SponsorshipsAdmin />}
          {activeTab === "activity-regs" && <ActivityRegsAdmin />}
          {activeTab === "messages" && <MessagesAdmin />}
          {activeTab === "users" && <UsersAdmin />}
        </div>
      </div>
    </div>
  );
}
