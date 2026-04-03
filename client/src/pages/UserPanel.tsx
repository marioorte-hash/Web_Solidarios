import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Calendar, User, Plus, Trash2, Clock,
  MapPin, CheckCircle2, BookOpen, X, MessageSquare,
  Send, Paperclip, FileText, Reply, ChevronRight,
  Users, Inbox,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Activity, Sponsorship, ActivityRegistration, InternalMessage, SponsorshipFormField } from "@shared/schema";

type UserActivityReg = ActivityRegistration & { activity: Activity };

interface AdminInfo { id: number; username: string; email: string; }

function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Sponsorship Tab ────────────────────────────────────────────────────────────

function SponsorshipForm({ onClose, onSaved, existing }: {
  onClose: () => void; onSaved: () => void; existing?: Sponsorship;
}) {
  const { toast } = useToast();
  const { data: customFields } = useQuery<SponsorshipFormField[]>({ queryKey: ["/api/sponsorship-form-fields"] });
  const activeFields = (customFields ?? []).filter(f => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  const existingResponses: Record<string, string> = existing?.customResponses
    ? (() => { try { return JSON.parse(existing.customResponses!); } catch { return {}; } })()
    : {};

  const [form, setForm] = useState({
    childName: existing?.childName ?? "",
    childAge: existing?.childAge?.toString() ?? "",
    country: existing?.country ?? "",
    school: existing?.school ?? "",
    monthlyAmount: existing?.monthlyAmount?.toString() ?? "",
    startDate: existing?.startDate ?? "",
    notes: existing?.notes ?? "",
  });
  const [customResponses, setCustomResponses] = useState<Record<string, string>>(existingResponses);
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const setCustom = (fieldId: number, value: string) =>
    setCustomResponses(r => ({ ...r, [fieldId]: value }));

  const handleSave = async () => {
    if (!form.childName.trim() || !form.country.trim()) {
      toast({ title: "Campos requeridos", description: "Nombre del niño y país son obligatorios", variant: "destructive" });
      return;
    }
    for (const field of activeFields) {
      if (field.required && !customResponses[field.id]?.trim()) {
        toast({ title: "Campo obligatorio", description: `"${field.label}" es obligatorio`, variant: "destructive" });
        return;
      }
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
        customResponses: Object.keys(customResponses).length > 0 ? JSON.stringify(customResponses) : undefined,
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

  const inputCls = "w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-accent/20 border border-primary/10 rounded-2xl p-6 mt-4">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-display font-bold text-lg">{existing ? "Editar apadrinamiento" : "Nuevo apadrinamiento"}</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">Nombre del niño <span className="text-red-500">*</span></label>
          <input data-testid="input-child-name" value={form.childName} onChange={set("childName")} className={inputCls} placeholder="María García" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">País <span className="text-red-500">*</span></label>
          <input data-testid="input-country" value={form.country} onChange={set("country")} className={inputCls} placeholder="Honduras" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Edad</label>
          <input data-testid="input-child-age" type="number" min="1" max="18" value={form.childAge} onChange={set("childAge")} className={inputCls} placeholder="8" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Escuela</label>
          <input data-testid="input-school" value={form.school} onChange={set("school")} className={inputCls} placeholder="Escuela San Juan" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Cuota mensual (€)</label>
          <input data-testid="input-monthly-amount" type="number" step="0.01" min="0" value={form.monthlyAmount} onChange={set("monthlyAmount")} className={inputCls} placeholder="30.00" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Fecha de inicio</label>
          <input data-testid="input-start-date" type="date" value={form.startDate} onChange={set("startDate")} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1.5">Notas adicionales</label>
          <textarea data-testid="input-notes" value={form.notes} onChange={set("notes")} rows={3}
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Observaciones sobre el apadrinamiento..." />
        </div>

        {/* Dynamic custom fields */}
        {activeFields.length > 0 && (
          <div className="sm:col-span-2">
            <div className="border-t border-primary/10 pt-4 mt-1">
              <p className="text-xs font-bold text-primary/70 uppercase tracking-wide mb-4">Preguntas adicionales</p>
              <div className="space-y-4">
                {activeFields.map((field) => (
                  <div key={field.id}>
                    <label className="text-sm font-medium block mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.fieldType === "short_answer" ? (
                      <input
                        data-testid={`custom-field-${field.id}`}
                        value={customResponses[field.id] ?? ""}
                        onChange={e => setCustom(field.id, e.target.value)}
                        className={inputCls}
                        placeholder="Tu respuesta..."
                      />
                    ) : (
                      <div className="space-y-2">
                        {(field.options ?? []).map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name={`custom-field-${field.id}`}
                              data-testid={`custom-field-${field.id}-opt-${oi}`}
                              checked={customResponses[field.id] === opt}
                              onChange={() => setCustom(field.id, opt)}
                              className="w-4 h-4 text-primary accent-primary"
                            />
                            <span className="text-sm group-hover:text-primary transition-colors">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
        <button data-testid="button-save-sponsorship" onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my-sponsorships"] }); setDeletingId(null); toast({ title: "Apadrinamiento eliminado" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSaved = () => { qc.invalidateQueries({ queryKey: ["/api/my-sponsorships"] }); setShowForm(false); setEditing(null); };

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-display font-bold">Mis apadrinamientos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Niños que apoyas a través de Alumnos Solidarios</p>
        </div>
        {!showForm && !editing && (
          <button data-testid="button-add-sponsorship" onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        )}
      </div>
      {showForm && !editing && <SponsorshipForm onClose={() => setShowForm(false)} onSaved={handleSaved} />}
      {!items || items.length === 0 ? (
        !showForm && (
          <div className="text-center py-16 border-2 border-dashed border-primary/20 rounded-2xl">
            <Heart className="w-12 h-12 mx-auto mb-3 text-primary/30" />
            <p className="font-display font-bold text-lg mb-1">Aún no tienes apadrinamientos</p>
            <p className="text-sm text-muted-foreground mb-5">Empieza apoyando a un niño hoy</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><Plus className="w-4 h-4 mr-2" />Registrar apadrinamiento</button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} data-testid={`sponsorship-card-${item.id}`} className="bg-white rounded-2xl border border-border/20 p-5 shadow-sm">
              {editing?.id === item.id ? (
                <SponsorshipForm existing={item} onClose={() => setEditing(null)} onSaved={handleSaved} />
              ) : (
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
                    <button onClick={() => setEditing(item)} className="p-2 rounded-lg hover:bg-gray-50 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Editar</button>
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Activities Tab ─────────────────────────────────────────────────────────────

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
    mutationFn: () => apiRequest("POST", "/api/activity-registrations", { activityId: Number(selectedActivityId), notes: notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my-activities"] }); setShowJoin(false); setSelectedActivityId(""); setNotes(""); toast({ title: "¡Te has apuntado a la actividad!" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const leave = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/activity-registrations/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my-activities"] }); setDeletingId(null); toast({ title: "Te has dado de baja de la actividad" }); },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (loadingRegs || loadingAll) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-display font-bold">Mis actividades</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Actividades en las que participas</p>
        </div>
        {!showJoin && availableActivities.length > 0 && (
          <button data-testid="button-join-activity" onClick={() => setShowJoin(true)} className="flex items-center gap-2 btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Apuntarme
          </button>
        )}
      </div>
      {showJoin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/20 border border-primary/10 rounded-2xl p-5 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold">Apuntarme a una actividad</h3>
            <button onClick={() => setShowJoin(false)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Actividad <span className="text-red-500">*</span></label>
              <select data-testid="select-activity" value={selectedActivityId} onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="">Selecciona una actividad...</option>
                {availableActivities.map(a => (
                  <option key={a.id} value={a.id}>{a.title} — {new Date(a.date).toLocaleDateString("es-ES")} · {a.location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Notas (opcional)</label>
              <textarea data-testid="input-activity-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-white"
                placeholder="Alergias, necesidades especiales..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowJoin(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
              <button data-testid="button-confirm-join" onClick={() => join.mutate()} disabled={join.isPending} className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60">
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
              <button onClick={() => setShowJoin(true)} className="btn-primary text-sm"><Plus className="w-4 h-4 mr-2" />Apuntarme a una actividad</button>
            )}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {myRegs.map((reg) => (
            <div key={reg.id} data-testid={`activity-reg-${reg.id}`} className="bg-white rounded-2xl border border-border/20 p-5 shadow-sm flex gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold">{reg.activity.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(reg.activity.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{reg.activity.location}</span>
                </div>
                {reg.notes && <p className="text-sm text-muted-foreground mt-1.5 italic">"{reg.notes}"</p>}
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Inscrito
                </span>
              </div>
              <div>
                {deletingId === reg.id ? (
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => leave.mutate(reg.id)} className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Sí, baja</button>
                    <button onClick={() => setDeletingId(null)} className="px-3 py-1 text-xs font-bold text-muted-foreground hover:bg-gray-50 rounded-lg transition-colors">Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setDeletingId(reg.id)} className="text-xs text-muted-foreground hover:text-red-500 transition-colors font-medium whitespace-nowrap">Darse de baja</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mensajes Tab ───────────────────────────────────────────────────────────────

function ChatWindow({ channel, recipientId, recipientName, messages, onBack }: {
  channel: "general" | "admin";
  recipientId?: number;
  recipientName: string;
  messages: InternalMessage[];
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openMsgId, setOpenMsgId] = useState<number | null>(null);

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, body, attachmentUrl: attachment?.url, attachmentName: attachment?.name, recipientId }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my-messages"] });
      setSubject(""); setBody(""); setAttachment(null); setShowForm(false);
      toast({ title: "¡Mensaje enviado!", description: "Te responderemos en breve." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/attachment", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error("Error al subir el archivo");
      const data = await res.json();
      setAttachment({ url: data.url, name: data.filename });
      toast({ title: "Archivo adjuntado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (!subject.trim()) { toast({ title: "Falta el asunto", variant: "destructive" }); return; }
    if (!body.trim()) { toast({ title: "Falta el mensaje", variant: "destructive" }); return; }
    send.mutate();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-muted-foreground hover:text-foreground">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${channel === "general" ? "bg-primary/10" : "bg-blue-100"}`}>
          {channel === "general" ? <Users className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-blue-600" />}
        </div>
        <div>
          <h3 className="font-display font-bold">{recipientName}</h3>
          <p className="text-xs text-muted-foreground">{channel === "general" ? "Visible por todos los administradores" : "Chat privado con este admin"}</p>
        </div>
        {!showForm && (
          <button data-testid="button-new-message" onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-2 btn-primary text-sm py-2 px-4">
            <Send className="w-3.5 h-3.5" /> Nuevo mensaje
          </button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-border/20 shadow-sm p-5 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-display font-bold">Nuevo mensaje a {recipientName}</h4>
            <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Asunto <span className="text-red-500">*</span></label>
              <input data-testid="input-message-subject" value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Consulta sobre apadrinamiento..." />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Mensaje <span className="text-red-500">*</span></label>
              <textarea data-testid="input-message-body" value={body} onChange={e => setBody(e.target.value)} rows={4}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Escribe tu mensaje..." />
            </div>
            <div>
              <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
              {attachment ? (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 truncate">{attachment.name}</span>
                  <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button data-testid="button-attach-file" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium disabled:opacity-50">
                  <Paperclip className="w-4 h-4" />{uploading ? "Subiendo..." : "Adjuntar imagen o PDF"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
              <button data-testid="button-send-message" onClick={handleSend} disabled={send.isPending}
                className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                <Send className="w-4 h-4" />{send.isPending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-2xl">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-primary/30" />
          <p className="font-display font-bold mb-1">Sin mensajes aún</p>
          <p className="text-sm text-muted-foreground">Pulsa "Nuevo mensaje" para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <div key={msg.id} data-testid={`message-card-${msg.id}`} className="bg-white rounded-2xl border border-border/20 shadow-sm overflow-hidden">
              <button onClick={() => setOpenMsgId(openMsgId === msg.id ? null : msg.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${msg.adminReply ? "bg-green-100" : "bg-primary/10"}`}>
                  <MessageSquare className={`w-4 h-4 ${msg.adminReply ? "text-green-600" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{msg.subject}</span>
                    {msg.adminReply && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">Respondido</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(msg.createdAt)}</p>
                </div>
                {openMsgId === msg.id ? <X className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <Reply className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>
              {openMsgId === msg.id && (
                <div className="border-t border-border/20 px-4 pb-4 pt-4 space-y-4">
                  <div className="bg-primary/5 rounded-xl p-4">
                    <p className="text-sm font-semibold mb-2 text-primary">Tu mensaje</p>
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                    {msg.attachmentUrl && (
                      <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary font-semibold hover:underline">
                        <Paperclip className="w-3.5 h-3.5" />{msg.attachmentName || "Ver adjunto"}
                      </a>
                    )}
                  </div>
                  {msg.adminReply ? (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-700">Respuesta de Alumnos Solidarios</p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.adminReply}</p>
                      {msg.repliedAt && <p className="text-xs text-muted-foreground mt-2">{formatDate(msg.repliedAt)}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Clock className="w-4 h-4" /> Pendiente de respuesta
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MensajesTab() {
  const { data: messages, isLoading } = useQuery<InternalMessage[]>({ queryKey: ["/api/my-messages"] });
  const { data: admins, isLoading: loadingAdmins } = useQuery<AdminInfo[]>({ queryKey: ["/api/admins"] });
  const [activeChannel, setActiveChannel] = useState<{ type: "general" | "admin"; id?: number; name: string } | null>(null);

  if (isLoading || loadingAdmins) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;

  const generalMessages = messages?.filter(m => !m.recipientId) ?? [];
  const getAdminMessages = (adminId: number) => messages?.filter(m => m.recipientId === adminId) ?? [];

  if (activeChannel) {
    const channelMessages = activeChannel.type === "general"
      ? generalMessages
      : getAdminMessages(activeChannel.id!);
    return (
      <ChatWindow
        channel={activeChannel.type}
        recipientId={activeChannel.id}
        recipientName={activeChannel.name}
        messages={channelMessages}
        onBack={() => setActiveChannel(null)}
      />
    );
  }

  const channels = [
    {
      type: "general" as const,
      name: "Canal General",
      description: "Mensajes visibles por todos los administradores",
      count: generalMessages.length,
      unread: generalMessages.filter(m => !m.adminReply).length,
      icon: <Users className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10",
    },
    ...(admins ?? []).map(admin => {
      const adminMsgs = getAdminMessages(admin.id);
      return {
        type: "admin" as const,
        id: admin.id,
        name: admin.username,
        description: `Chat directo con ${admin.username}`,
        count: adminMsgs.length,
        unread: adminMsgs.filter(m => !m.adminReply).length,
        icon: <User className="w-5 h-5 text-blue-600" />,
        bg: "bg-blue-100",
      };
    }),
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold">Mensajería</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Contacta con los administradores de Alumnos Solidarios</p>
      </div>
      <div className="space-y-3">
        {channels.map((ch, i) => (
          <button
            key={i}
            data-testid={`channel-${ch.type === "general" ? "general" : ch.id}`}
            onClick={() => setActiveChannel({ type: ch.type, id: (ch as any).id, name: ch.name })}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-border/20 shadow-sm hover:border-primary/30 hover:shadow-md transition-all text-left group"
          >
            <div className={`w-12 h-12 ${ch.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              {ch.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{ch.name}</span>
                {ch.unread > 0 && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {ch.unread} pendiente{ch.unread !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{ch.description}</p>
              {ch.count > 0 && <p className="text-xs text-muted-foreground mt-1">{ch.count} mensaje{ch.count !== 1 ? "s" : ""}</p>}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main User Panel ────────────────────────────────────────────────────────────

type Tab = "overview" | "sponsorships" | "activities" | "messages";

export default function UserPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: sponsorships } = useQuery<Sponsorship[]>({ queryKey: ["/api/my-sponsorships"] });
  const { data: myRegs } = useQuery<UserActivityReg[]>({ queryKey: ["/api/my-activities"] });
  const { data: messages } = useQuery<InternalMessage[]>({ queryKey: ["/api/my-messages"] });

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

  const unreadMessages = messages?.filter(m => !m.adminReply).length ?? 0;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Inicio", icon: <User className="w-5 h-5" /> },
    { id: "sponsorships", label: "Apadrinamientos", icon: <Heart className="w-5 h-5" />, badge: sponsorships?.length },
    { id: "activities", label: "Actividades", icon: <Calendar className="w-5 h-5" />, badge: myRegs?.length },
    { id: "messages", label: "Mensajes", icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessages || undefined },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-3">Mi panel</span>
          <h1 className="text-3xl font-display font-bold">Bienvenido, {user.username}</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu participación en Alumnos Solidarios.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl border border-border/20 p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`panel-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === tab.id ? "bg-primary text-white shadow-sm" : "text-foreground/60 hover:text-foreground hover:bg-gray-50"
              }`}
            >
              {tab.icon}{tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border/20 p-6 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-display font-bold mb-1">Hola, {user.username} 👋</h2>
                    <p className="text-muted-foreground text-sm">Aquí tienes un resumen de tu actividad</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <button data-testid="overview-card-sponsorships" onClick={() => setActiveTab("sponsorships")}
                      className="group p-5 rounded-2xl border border-border/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all text-left">
                      <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-2xl font-display font-bold text-primary">{sponsorships?.length ?? 0}</p>
                      <p className="font-semibold text-sm mt-1">Apadrinamientos</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Niños que apoyas</p>
                      <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-primary">
                        Gestionar <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    <button data-testid="overview-card-messages" onClick={() => setActiveTab("messages")}
                      className="group p-5 rounded-2xl border border-border/20 bg-blue-50 hover:bg-blue-100/70 hover:border-blue-200 transition-all text-left">
                      <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center mb-4 transition-colors relative">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        {unreadMessages > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-display font-bold text-blue-600">{messages?.length ?? 0}</p>
                      <p className="font-semibold text-sm mt-1">Mensajes</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unreadMessages > 0 ? `${unreadMessages} sin respuesta` : "Contacta con los admins"}
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600">
                        Abrir mensajería <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>

                    <button data-testid="overview-card-activities" onClick={() => setActiveTab("activities")}
                      className="group p-5 rounded-2xl border border-border/20 bg-green-50 hover:bg-green-100/70 hover:border-green-200 transition-all text-left">
                      <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center mb-4 transition-colors">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-display font-bold text-green-600">{myRegs?.length ?? 0}</p>
                      <p className="font-semibold text-sm mt-1">Actividades</p>
                      <p className="text-xs text-muted-foreground mt-0.5">En las que participas</p>
                      <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-green-600">
                        Ver actividades <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </div>

                  {/* Quick actions */}
                  <div className="border-t border-border/10 pt-5">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">Acciones rápidas</p>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => setActiveTab("sponsorships")} data-testid="quick-action-sponsorship"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                        <Heart className="w-4 h-4" /> Nuevo apadrinamiento
                      </button>
                      <button onClick={() => setActiveTab("messages")} data-testid="quick-action-messages"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-semibold hover:bg-blue-200 transition-colors">
                        <Inbox className="w-4 h-4" /> Enviar un mensaje
                      </button>
                      <button onClick={() => setActiveTab("activities")} data-testid="quick-action-activities"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-semibold hover:bg-green-200 transition-colors">
                        <Calendar className="w-4 h-4" /> Ver actividades
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sponsorships" && <SponsorshipsTab />}
              {activeTab === "activities" && <ActivitiesTab />}
              {activeTab === "messages" && <MensajesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
