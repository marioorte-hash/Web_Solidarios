import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Calendar, User, Plus, Trash2, ChevronDown, ChevronUp,
  MapPin, Clock, CheckCircle2, BookOpen, X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Activity, Sponsorship, ActivityRegistration } from "@shared/schema";

type UserActivityReg = ActivityRegistration & { activity: Activity };

// ── Sponsorship Tab ───────────────────────────────────────────────────────────

function SponsorshipForm({ onClose, onSaved, existing }: {
  onClose: () => void;
  onSaved: () => void;
  existing?: Sponsorship;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    childName: existing?.childName ?? "",
    childAge: existing?.childAge?.toString() ?? "",
    country: existing?.country ?? "",
    school: existing?.school ?? "",
    monthlyAmount: existing?.monthlyAmount?.toString() ?? "",
    startDate: existing?.startDate ?? "",
    notes: existing?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.childName.trim() || !form.country.trim()) {
      toast({ title: "Campos requeridos", description: "Nombre del niño y país son obligatorios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        childName: form.childName,
        country: form.country,
        childAge: form.childAge ? Number(form.childAge) : undefined,
        school: form.school || undefined,
        monthlyAmount: form.monthlyAmount || undefined,
        startDate: form.startDate || undefined,
        notes: form.notes || undefined,
      };
      if (existing) {
        await apiRequest("PUT", `/api/sponsorships/${existing.id}`, body);
        toast({ title: "Apadrinamiento actualizado" });
      } else {
        await apiRequest("POST", "/api/sponsorships", body);
        toast({ title: "¡Apadrinamiento registrado!" });
      }
      onSaved();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent/20 border border-primary/10 rounded-2xl p-6 mt-4"
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-display font-bold text-lg">
          {existing ? "Editar apadrinamiento" : "Nuevo apadrinamiento"}
        </h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Nombre del niño <span className="text-red-500">*</span></label>
          <input data-testid="input-child-name" value={form.childName} onChange={set("childName")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="María García" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">País <span className="text-red-500">*</span></label>
          <input data-testid="input-country" value={form.country} onChange={set("country")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Honduras" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Edad</label>
          <input data-testid="input-child-age" type="number" min="1" max="18" value={form.childAge} onChange={set("childAge")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="8" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Escuela</label>
          <input data-testid="input-school" value={form.school} onChange={set("school")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Escuela San Juan" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Cuota mensual (€)</label>
          <input data-testid="input-monthly-amount" type="number" step="0.01" min="0" value={form.monthlyAmount} onChange={set("monthlyAmount")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="30.00" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Fecha de inicio</label>
          <input data-testid="input-start-date" type="date" value={form.startDate} onChange={set("startDate")}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1.5">Notas adicionales</label>
          <textarea data-testid="input-notes" value={form.notes} onChange={set("notes")} rows={3}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Observaciones sobre el apadrinamiento..." />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button data-testid="button-save-sponsorship" onClick={handleSave} disabled={saving}
          className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
          {saving ? "Guardando..." : (existing ? "Actualizar" : "Registrar")}
        </button>
      </div>
    </motion.div>
  );
}

function SponsorshipsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: items, isLoading } = useQuery<Sponsorship[]>({ queryKey: ["/api/my-sponsorships"] });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sponsorship | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/sponsorships/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my-sponsorships"] });
      setDeletingId(null);
      toast({ title: "Apadrinamiento eliminado" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSaved = () => {
    qc.invalidateQueries({ queryKey: ["/api/my-sponsorships"] });
    setShowForm(false);
    setEditing(null);
  };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-display font-bold">Mis apadrinamientos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Niños que apoyas a través de Alumnos Solidarios</p>
        </div>
        {!showForm && !editing && (
          <button data-testid="button-add-sponsorship" onClick={() => setShowForm(true)}
            className="flex items-center gap-2 btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        )}
      </div>

      {(showForm && !editing) && (
        <SponsorshipForm onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}

      {!items || items.length === 0 ? (
        !showForm && (
          <div className="text-center py-16 border-2 border-dashed border-primary/20 rounded-2xl">
            <Heart className="w-12 h-12 mx-auto mb-3 text-primary/30" />
            <p className="font-display font-bold text-lg mb-1">Aún no tienes apadrinamientos</p>
            <p className="text-sm text-muted-foreground mb-5">Empieza apoyando a un niño hoy</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2" />Registrar apadrinamiento
            </button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} data-testid={`sponsorship-card-${item.id}`}
              className="bg-white rounded-2xl border border-border/20 p-5 shadow-sm">
              {editing?.id === item.id ? (
                <SponsorshipForm existing={item} onClose={() => setEditing(null)} onSaved={handleSaved} />
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Heart className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-display font-bold text-lg">{item.childName}</h3>
                        {item.childAge && <span className="text-sm text-muted-foreground">({item.childAge} años)</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.country}</span>
                        {item.school && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{item.school}</span>}
                        {item.monthlyAmount && <span className="font-semibold text-primary">{parseFloat(item.monthlyAmount).toFixed(2)}€/mes</span>}
                        {item.startDate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Desde {item.startDate}</span>}
                      </div>
                      {item.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{item.notes}"</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-50 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                        Editar
                      </button>
                      {deletingId === item.id ? (
                        <div className="flex gap-1.5">
                          <button onClick={() => del.mutate(item.id)} className="px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">Sí</button>
                          <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-xs font-bold text-muted-foreground hover:bg-gray-50 rounded-lg transition-colors">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activities Tab ────────────────────────────────────────────────────────────

function ActivitiesTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: myRegs, isLoading: loadingRegs } = useQuery<UserActivityReg[]>({ queryKey: ["/api/my-activities"] });
  const { data: allActivities, isLoading: loadingAll } = useQuery<Activity[]>({ queryKey: ["/api/activities"] });
  const [showJoin, setShowJoin] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | string>("");
  const [notes, setNotes] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const myActivityIds = new Set(myRegs?.map(r => r.activityId) ?? []);
  const availableActivities = allActivities?.filter(a => !myActivityIds.has(a.id)) ?? [];

  const join = useMutation({
    mutationFn: () => apiRequest("POST", "/api/activity-registrations", {
      activityId: Number(selectedActivityId),
      notes: notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my-activities"] });
      setShowJoin(false);
      setSelectedActivityId("");
      setNotes("");
      toast({ title: "¡Te has apuntado a la actividad!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const leave = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/activity-registrations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my-activities"] });
      setDeletingId(null);
      toast({ title: "Te has dado de baja de la actividad" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleJoin = () => {
    if (!selectedActivityId) {
      toast({ title: "Selecciona una actividad", variant: "destructive" });
      return;
    }
    join.mutate();
  };

  if (loadingRegs || loadingAll) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-display font-bold">Mis actividades</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Actividades en las que participas</p>
        </div>
        {!showJoin && availableActivities.length > 0 && (
          <button data-testid="button-join-activity" onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Apuntarme
          </button>
        )}
      </div>

      {showJoin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/20 border border-primary/10 rounded-2xl p-5 mb-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold">Apuntarme a una actividad</h3>
            <button onClick={() => setShowJoin(false)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Actividad <span className="text-red-500">*</span></label>
              <select data-testid="select-activity" value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="">Selecciona una actividad...</option>
                {availableActivities.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} — {new Date(a.date).toLocaleDateString("es-ES")} · {a.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Notas (opcional)</label>
              <textarea data-testid="input-activity-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Alergias, necesidades especiales..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowJoin(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button data-testid="button-confirm-join" onClick={handleJoin} disabled={join.isPending}
                className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
                {join.isPending ? "Apuntando..." : "Apuntarme"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {!myRegs || myRegs.length === 0 ? (
        !showJoin && (
          <div className="text-center py-16 border-2 border-dashed border-primary/20 rounded-2xl">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-primary/30" />
            <p className="font-display font-bold text-lg mb-1">Aún no estás apuntado a ninguna actividad</p>
            <p className="text-sm text-muted-foreground mb-5">Únete a una de nuestras actividades solidarias</p>
            {availableActivities.length > 0 && (
              <button onClick={() => setShowJoin(true)} className="btn-primary text-sm">
                <Plus className="w-4 h-4 mr-2" />Apuntarme a una actividad
              </button>
            )}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {myRegs.map((reg) => (
            <div key={reg.id} data-testid={`activity-reg-${reg.id}`}
              className="bg-white rounded-2xl border border-border/20 p-5 shadow-sm flex gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold">{reg.activity.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(reg.activity.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />{reg.activity.location}
                  </span>
                </div>
                {reg.notes && <p className="text-sm text-muted-foreground mt-1.5 italic">"{reg.notes}"</p>}
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Inscrito
                </span>
              </div>
              <div>
                {deletingId === reg.id ? (
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => leave.mutate(reg.id)} className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      Sí, baja
                    </button>
                    <button onClick={() => setDeletingId(null)} className="px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-gray-50 rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeletingId(reg.id)}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors font-medium whitespace-nowrap">
                    Darse de baja
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main User Panel ───────────────────────────────────────────────────────────

type Tab = "sponsorships" | "activities";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "sponsorships", label: "Apadrinamientos", icon: <Heart className="w-5 h-5" /> },
  { id: "activities", label: "Actividades", icon: <Calendar className="w-5 h-5" /> },
];

export default function UserPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("sponsorships");

  if (authLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-2xl font-display font-bold mb-2">Inicia sesión</h2>
          <p className="text-muted-foreground mb-6">Necesitas una cuenta para ver tu panel de socio.</p>
          <button onClick={() => navigate("/auth")} className="btn-primary">Iniciar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-3">Mi panel</span>
          <h1 className="text-3xl font-display font-bold">Bienvenido, {user.username}</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus apadrinamientos y actividades.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl border border-border/20 p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`panel-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-foreground/60 hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "sponsorships" && <SponsorshipsTab />}
              {activeTab === "activities" && <ActivitiesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
