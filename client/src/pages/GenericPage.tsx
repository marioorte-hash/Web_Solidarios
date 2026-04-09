import { PageHeader } from "@/components/PageHeader";
import img01 from "@assets/2016-05-13_00.44.25_1775684577939.jpg";
import img02 from "@assets/2016-05-13_01.07.13_1775684577940.jpg";
import img03 from "@assets/2016-10-08_15.03.44_1775684577940.jpg";
import img04 from "@assets/2016-10-17_20.28.31_1775684577941.jpg";
import img05 from "@assets/2016-10-25_14.01.26_1775684577941.jpg";
import img06 from "@assets/2016-11-05_19.20.59_1775684577942.jpg";
import img07 from "@assets/2016-11-11_14.10.04_1775684577942.jpg";
import img08 from "@assets/2016-11-28_12.51.33_1775684577943.jpg";
import img09 from "@assets/2016-12-15_01.21.17_1775684577943.jpg";
import img10 from "@assets/2016-12-15_01.37.44_1775684577944.jpg";
import img11 from "@assets/2017-01-26_13.04.10_1775684577944.jpg";
import img12 from "@assets/2017-01-26_13.04.18_1775684577945.jpg";
import img13 from "@assets/2017-05-22_14.04.39_1775684577945.jpg";
import img14 from "@assets/2017-08-09_09.41.44_1775684577946.jpg";
import img15 from "@assets/2017-08-09_09.41.52_1775684577947.jpg";
import img16 from "@assets/2018-08-22_21.33.30_1775684577947.jpg";
import img17 from "@assets/2019-12-15_18.38.37_1775684577947.jpg";
import img18 from "@assets/2019-12-18_10.47.03_1775684577948.jpg";
import img19 from "@assets/2019-12-21_13.21.16_1775684577948.jpg";
import { useState } from "react";
import { X, Heart, CheckCircle, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { SponsorshipFormField } from "@shared/schema";
import { useT, T } from "@/contexts/language";
import { motion, AnimatePresence } from "framer-motion";

// Reusable component for static pages like "Razón de ser", "Apadrinamiento", etc.
interface GenericPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function GenericPage({ title, description, children }: GenericPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <section className="py-20 bg-white">
        <div className="container-custom prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-4xl mx-auto">
          {children}
        </div>
      </section>
    </>
  );
}

// ── Photo Gallery Component ────────────────────────────────────────────────────

interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {lightbox.caption && (
              <p className="mt-4 text-white/80 text-sm text-center max-w-xl">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="columns-2 md:columns-3 gap-3 mt-8">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="break-inside-avoid mb-3 group cursor-zoom-in"
            onClick={() => setLightbox(photo)}
          >
            <div className="relative overflow-hidden rounded-xl border-4 border-white shadow-md ring-1 ring-black/10 transition-all duration-300 group-hover:shadow-xl group-hover:ring-primary/30 group-hover:scale-[1.02]">
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-medium line-clamp-2">{photo.caption}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Photos data ───────────────────────────────────────────────────────────────

const todosAUnaPhotos: GalleryPhoto[] = [
  { src: img01, alt: "Mercadillo solidario con artesanías", caption: "Mercadillo solidario en el colegio Joyfe" },
  { src: img02, alt: "Presentación en el escenario", caption: "Acto de presentación de actividades solidarias" },
  { src: img03, alt: "Alumnos con camión DHL", caption: "Envío de materiales con DHL — los alumnos lo hicieron posible" },
  { src: img09, alt: "Voluntaria con cuentos contra el hambre", caption: "Campaña 'Cuentos Contra el Hambre'" },
  { src: img10, alt: "Tres estudiantes solidarios", caption: "Alumnos solidarios del Joyfe" },
  { src: img15, alt: "Voluntaria con figura africana", caption: "Arte solidario — exposición en el centro comercial" },
  { src: img16, alt: "Equipo de Alumnos Solidarios", caption: "El equipo de Alumnos Solidarios reunido" },
  { src: img19, alt: "Grupo en exposición benéfica", caption: "Exposición benéfica 'Arte x África' en Madrid" },
  { src: img05, alt: "Cartel Arte x África", caption: "2ª Exposición benéfica Arte x África — Arturo Soria Plaza" },
  { src: img06, alt: "Gran evento solidario en centro comercial", caption: "Evento solidario con cientos de asistentes" },
];

const africaPhotos: GalleryPhoto[] = [
  { src: img04, alt: "Cargando la ambulancia en Madrid", caption: "Preparando el envío de la ambulancia a Burkina Faso" },
  { src: img07, alt: "Ambulancia rotulada", caption: "La ambulancia con el logotipo de Joyfe lista para partir" },
  { src: img08, alt: "Interior de la ambulancia con equipamiento", caption: "Material médico y ortopédico cargado en la ambulancia" },
  { src: img14, alt: "Ambulancia Z53 en carretera española", caption: "La ambulancia Z53 en su camino a Burkina Faso" },
  { src: img11, alt: "Ambulancia Centro Médico Eureka en África", caption: "La ambulancia llegó al Centre Médical Eureka en Burkina" },
  { src: img12, alt: "Vista trasera de la ambulancia en África", caption: "La ambulancia, símbolo de cooperación internacional" },
  { src: img17, alt: "Descargando contenedor en África", caption: "Descarga del contenedor con materiales en Costa de Marfil" },
  { src: img18, alt: "Niños en aula de informática", caption: "Los niños de La Anunciación con los ordenadores donados" },
  { src: img13, alt: "Grupo en la playa con hermanitas", caption: "Visita a los proyectos de las Hermanitas de la Anunciación" },
];

// ── Razón de Ser — full content ───────────────────────────────────────────────

export function RazonDeSer() {
  const tr = useT();
  const R = T.razon;

  return (
    <>
      <PageHeader
        title={tr(R.headerTitle)}
        description={tr(R.headerDesc)}
      />

      {/* ── Razón de Ser ───────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
            <p>{tr(R.sec1p1)}</p>
            <p>{tr(R.sec1p2)}</p>
            <p>{tr(R.sec1p3)}</p>
            <p>{tr(R.sec1p4)}</p>
            <div className="not-prose bg-primary/5 border border-primary/15 rounded-2xl px-8 py-6 my-10">
              <p className="text-xl font-display font-bold text-primary text-center leading-relaxed m-0">
                "{tr(R.sec1quote)}"
              </p>
              <p className="text-center text-sm text-muted-foreground mt-3 mb-0 font-semibold">{tr(R.sec1quotecaption)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Todos a Una ────────────────────────────────────────────── */}
      <section className="py-20 bg-accent/30">
        <div className="container-custom max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">{tr(R.sec2title)}</h2>
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-4xl">
            <p>{tr(R.sec2desc)}</p>
          </div>
          <PhotoGallery photos={todosAUnaPhotos} />
        </div>
      </section>

      {/* ── África en el Corazón ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">{tr(R.sec3title)}</h2>
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-4xl">
            <p>{tr(R.sec3p1)}</p>
            <p>{tr(R.sec3p2)}</p>
            <p>{tr(R.sec3p3)}</p>
            <p>{tr(R.sec3p4)}</p>
            <p>{tr(R.sec3p5)}</p>

            <div className="not-prose bg-accent/30 border border-primary/10 rounded-2xl p-6 my-8">
              <h3 className="font-display font-bold text-lg mb-3 text-foreground">{tr(R.sec3block1title)}</h3>
              <p className="text-muted-foreground leading-relaxed">{tr(R.sec3block1p)}</p>
            </div>

            <p>{tr(R.sec3p6)}</p>
            <p>{tr(R.sec3p7)}</p>

            <div className="not-prose bg-primary/5 border border-primary/15 rounded-2xl p-6 my-8">
              <p className="font-semibold text-foreground mb-2">{tr(R.sec3block2title)}</p>
              <p className="text-muted-foreground leading-relaxed">{tr(R.sec3block2p)}</p>
            </div>

            <p>{tr(R.sec3p8)}</p>
            <p>{tr(R.sec3p9)}</p>
            <p>{tr(R.sec3p10)}</p>
            <p>{tr(R.sec3p11)}</p>
            <p>{tr(R.sec3p12)}</p>
          </div>
          <PhotoGallery photos={africaPhotos} />
        </div>
      </section>
    </>
  );
}

// ── Sponsorship Form Modal ────────────────────────────────────────────────────

function SponsorshipModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const tr = useT();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data: fields, isLoading } = useQuery<SponsorshipFormField[]>({
    queryKey: ["/api/sponsorship-form-fields"],
  });

  const [responses, setResponses] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const activeFields = (fields ?? [])
    .filter((f) => f.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const mutation = useMutation({
    mutationFn: (body: any) => apiRequest("POST", "/api/sponsorships", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my-sponsorships"] });
      setSubmitted(true);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const field of activeFields) {
      if (field.required && !responses[field.id]?.trim()) {
        toast({ title: tr(T.sponsorship.requiredField) + `: "${field.label}"`, variant: "destructive" });
        return;
      }
    }
    const customResponses: Record<string, string> = {};
    activeFields.forEach((f) => {
      if (responses[f.id]) customResponses[String(f.id)] = responses[f.id];
    });
    mutation.mutate({
      childName: "Solicitud pendiente de asignación",
      country: "Pendiente",
      customResponses: JSON.stringify(customResponses),
    });
  };

  if (!user) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-6">
          <AlertCircle className="w-14 h-14 text-primary/40 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold mb-2">{tr(T.sponsorship.loginRequired)}</h3>
          <p className="text-muted-foreground mb-6">{tr(T.sponsorship.loginRequiredDesc)}</p>
          <button
            onClick={() => { onClose(); navigate("/auth"); }}
            className="btn-primary"
          >
            {tr(T.sponsorship.goToLogin)}
          </button>
        </div>
      </ModalShell>
    );
  }

  if (submitted) {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-6">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold mb-2">{tr(T.sponsorship.successTitle)}</h3>
          <p className="text-muted-foreground mb-6">{tr(T.sponsorship.successDesc)}</p>
          <button onClick={onClose} className="btn-primary">{tr(T.sponsorship.close)}</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-center gap-3 mb-2">
        <Heart className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-display font-bold">{tr(T.sponsorship.formTitle)}</h3>
      </div>
      <p className="text-muted-foreground text-sm mb-6">{tr(T.sponsorship.formDesc)}</p>

      {/* User info banner */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-6 text-sm">
        <p className="font-semibold text-foreground mb-1">{tr(T.sponsorship.yourInfo)}</p>
        <p className="text-muted-foreground"><span className="font-medium">{user.username}</span> · {user.email}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : activeFields.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">{tr(T.sponsorship.noFields)}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {activeFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-semibold mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.fieldType === "multiple_choice" && field.options && field.options.length > 0 ? (
                <div className="space-y-2">
                  {field.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={`field_${field.id}`}
                        value={opt}
                        checked={responses[field.id] === opt}
                        onChange={() => setResponses(r => ({ ...r, [field.id]: opt }))}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={responses[field.id] ?? ""}
                  onChange={(e) => setResponses(r => ({ ...r, [field.id]: e.target.value }))}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder={field.label}
                />
              )}
            </div>
          ))}

          {/* Consent notice */}
          <div className="bg-accent/30 border border-primary/10 rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
            {tr(T.sponsorship.shareInfo)}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              {tr(T.sponsorship.cancel)}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-60"
            >
              {mutation.isPending ? tr(T.sponsorship.submitting) : tr(T.sponsorship.submit)}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl border border-border/20 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-muted-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}

// ── Apadrinamiento page ───────────────────────────────────────────────────────

export function Apadrinamiento() {
  const [showModal, setShowModal] = useState(false);
  const tr = useT();

  return (
    <>
      <PageHeader
        title={tr(T.sponsorship.pageTitle)}
        description={tr(T.sponsorship.pageDesc)}
      />

      <section className="py-20 bg-white">
        <div className="container-custom prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-4xl mx-auto">
          <h3>{tr(T.sponsorship.what)}</h3>
          <p>{tr(T.sponsorship.whatDesc)}</p>

          <div className="not-prose bg-accent/20 p-8 rounded-2xl my-8 border border-accent">
            <h4 className="text-xl font-bold text-primary mb-4">{tr(T.sponsorship.includes)}</h4>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>{tr(T.sponsorship.item1)}</li>
              <li>{tr(T.sponsorship.item2)}</li>
              <li>{tr(T.sponsorship.item3)}</li>
              <li>{tr(T.sponsorship.item4)}</li>
            </ul>
          </div>

          <div className="not-prose text-center mt-10">
            <button
              data-testid="button-sponsor-cta"
              className="btn-primary text-lg px-10 py-4"
              onClick={() => setShowModal(true)}
            >
              {tr(T.sponsorship.cta)}
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showModal && <SponsorshipModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
