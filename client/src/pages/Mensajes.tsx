import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Paperclip, X, FileText,
  CheckCircle2, Clock, Reply, Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { InternalMessage } from "@shared/schema";

function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function MessageCard({ msg }: { msg: InternalMessage }) {
  const [open, setOpen] = useState(false);

  return (
    <div data-testid={`message-card-${msg.id}`}
      className="bg-white rounded-2xl border border-border/20 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          msg.adminReply ? "bg-green-100" : "bg-primary/10"
        }`}>
          <MessageSquare className={`w-5 h-5 ${msg.adminReply ? "text-green-600" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{msg.subject}</span>
            {msg.adminReply && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                Respondido
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(msg.createdAt)}</p>
        </div>
        <div className="flex-shrink-0">
          {open ? <X className="w-4 h-4 text-muted-foreground" /> : <Reply className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/20 px-4 pb-4 pt-4 space-y-4">
          {/* User message */}
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-sm font-semibold mb-2 text-primary">Tu mensaje</p>
            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
            {msg.attachmentUrl && (
              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary font-semibold hover:underline">
                <Paperclip className="w-3.5 h-3.5" />
                {msg.attachmentName || "Ver adjunto"}
              </a>
            )}
          </div>
          {/* Admin reply */}
          {msg.adminReply ? (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-sm font-semibold text-green-700">Respuesta de Alumnos Solidarios</p>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.adminReply}</p>
              {msg.repliedAt && (
                <p className="text-xs text-muted-foreground mt-2">{formatDate(msg.repliedAt)}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Clock className="w-4 h-4" />
              Pendiente de respuesta
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Mensajes() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading } = useQuery<InternalMessage[]>({ queryKey: ["/api/my-messages"] });

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject,
          body,
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.name,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my-messages"] });
      setSubject("");
      setBody("");
      setAttachment(null);
      setShowForm(false);
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
      const res = await fetch("/api/upload/attachment", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) throw new Error("Error al subir el archivo");
      const data = await res.json();
      setAttachment({ url: data.url, name: data.filename });
      toast({ title: "Archivo adjuntado", description: data.filename });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSend = () => {
    if (!subject.trim()) {
      toast({ title: "Falta el asunto", variant: "destructive" });
      return;
    }
    if (!body.trim()) {
      toast({ title: "Falta el mensaje", variant: "destructive" });
      return;
    }
    send.mutate();
  };

  if (authLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-2xl font-display font-bold mb-2">Inicia sesión para contactar</h2>
          <p className="text-muted-foreground mb-6">Necesitas una cuenta para enviarnos mensajes directamente.</p>
          <Link href="/auth" className="btn-primary">Iniciar sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom max-w-3xl">
        <div className="mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-3">Mensajería</span>
          <h1 className="text-3xl font-display font-bold">Contacta con nosotros</h1>
          <p className="text-muted-foreground mt-1">Envíanos un mensaje y te responderemos lo antes posible.</p>
        </div>

        {/* New message button / form */}
        <div className="mb-6">
          {!showForm ? (
            <button data-testid="button-new-message" onClick={() => setShowForm(true)}
              className="flex items-center gap-2 btn-primary">
              <Send className="w-4 h-4" /> Nuevo mensaje
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border/20 shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-display font-bold text-lg">Nuevo mensaje</h2>
                <button onClick={() => setShowForm(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Asunto <span className="text-red-500">*</span></label>
                  <input
                    data-testid="input-message-subject"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Consulta sobre apadrinamiento..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Mensaje <span className="text-red-500">*</span></label>
                  <textarea
                    data-testid="input-message-body"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={5}
                    className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                {/* Attachment */}
                <div>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                  {attachment ? (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">{attachment.name}</span>
                      <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button data-testid="button-attach-file" onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium disabled:opacity-50">
                      <Paperclip className="w-4 h-4" />
                      {uploading ? "Subiendo..." : "Adjuntar imagen o PDF"}
                    </button>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button data-testid="button-send-message" onClick={handleSend} disabled={send.isPending}
                    className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {send.isPending ? "Enviando..." : "Enviar"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Messages list */}
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Cargando mensajes...</div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-primary/20 rounded-2xl">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-primary/30" />
            <p className="font-display font-bold text-lg mb-1">Aún no has enviado ningún mensaje</p>
            <p className="text-sm text-muted-foreground">Pulsa "Nuevo mensaje" para contactar con nosotros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{messages.length} mensaje{messages.length !== 1 ? "s" : ""}</p>
            {messages.map(msg => <MessageCard key={msg.id} msg={msg} />)}
          </div>
        )}
      </div>
    </div>
  );
}
