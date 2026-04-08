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
import { X } from "lucide-react";

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
  return (
    <>
      <PageHeader
        title="Alumnos Solidarios, Razón de Ser"
        description="Nuestra historia, misión y el compromiso que nos impulsa cada día."
      />

      {/* ── Razón de Ser ───────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
            <p>
              Está asociación de Alumnos Solidarios nació con el objetivo de aunar la fuerza del conocimiento, adquirido en los años de formación académica, para impulsar el cambio social y económico a beneficio de sociedades y grupos menos favorecidos.
            </p>
            <p>
              La mirada solidaria tiene el poder de transformar el mundo. Potenciada desde la infancia por los educadores, que son la familia y los maestros, y bien conducida a lo largo de los años de formación superior, se convierte en una vacuna frente a la indiferencia. Ser solidario es una actitud ante la vida, es querer dejar una huella positiva en este mundo de desigualdades, identificar la necesidad y concentrarse en la búsqueda de soluciones.
            </p>
            <p>
              Una persona solidaria no pasa por la vida con una venda de quita y pon, a conveniencia. Además, tiene en sus genes adquiridos el poder de mover conciencias y sumar al propósito a todo aquel que tenga el corazón a la escucha.
            </p>
            <p>
              La sensibilización social ante las numerosas causas que la precisan es el comienzo del cambio. Honestidad y creatividad deben de ir de la mano para atraer la atención de la comunidad. La clave para el éxito es nuestro ejemplo. Que nadie pueda poner nunca en duda que lo que hacemos es por los demás. Que no solo seamos honrados sino que también lo evidenciemos, justificando hasta el último céntimo de nuestras acciones recaudatorias.
            </p>
            <div className="not-prose bg-primary/5 border border-primary/15 rounded-2xl px-8 py-6 my-10">
              <p className="text-xl font-display font-bold text-primary text-center leading-relaxed m-0">
                "No sabíamos lo que éramos capaces de hacer hasta que nos pusimos a hacerlo."
              </p>
              <p className="text-center text-sm text-muted-foreground mt-3 mb-0 font-semibold">Ese es nuestro lema.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Todos a Una ────────────────────────────────────────────── */}
      <section className="py-20 bg-accent/30">
        <div className="container-custom max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">Todos a Una</h2>
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-4xl">
            <p>
              Colaboramos con muchísimas entidades que merecen nuestra ayuda. Lo hacemos con ilusión y con creatividad. Estos son algunos ejemplos.
            </p>
          </div>
          <PhotoGallery photos={todosAUnaPhotos} />
        </div>
      </section>

      {/* ── África en el Corazón ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">África en el Corazón</h2>
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary max-w-4xl">
            <p>
              Los Alumnos Solidarios trabajamos desde hace años con diferentes entidades y personas de confianza, impulsores de mejoras locales en la sanidad y la educación.
            </p>
            <p>
              Comenzamos colaborando con la Fundacion Jigi Seme, <em>'Sostener la Esperanza'</em>, una entidad española centrada en colaborar con el sacerdote burkinabe Eugenio Kabore.
            </p>
            <p>
              Le conocimos personalmente en el Joyfe, cuando vino a dar una charla sobre sus proyectos. Nos comprometimos a ayudarle en lo que pudiéramos. Por ejemplo, colaboramos con el envío de un contenedor que transportaba materiales ginecológicos y oftalmológicos, también informáticos, juguetes, bicicletas y muchísimos libros.
            </p>
            <p>
              La familia de Guillermo y Nines, cuyos hijos fueron a nuestro colegio, se desplazaron hasta allí y contribuyeron pintando las instalaciones del colegio en Bobo Dioulasso.
            </p>
            <p>
              También enviamos una máquina de soldadura y hasta una ambulancia. Porque el padre Eugenio consiguió levantar un hospital en esa misma ciudad que actualmente ha sido reconocido como uno de los mejores del país.
            </p>

            <div className="not-prose bg-accent/30 border border-primary/10 rounded-2xl p-6 my-8">
              <h3 className="font-display font-bold text-lg mb-3 text-foreground">Costa de Marfil — Las Hermanitas de la Anunciación</h3>
              <p className="text-muted-foreground leading-relaxed">
                En el país vecino, Costa de Marfil, apoyamos desde hace muchos años a las Hermanitas de la Anunciación. Comenzamos a hacerlo a través de la Fundacion Juan José Márquez, una entidad médica fundada por el doctor Juan José Márquez, otro gran amigo.
              </p>
            </div>

            <p>
              Allí los proyectos se dividen en dos áreas. Uno, en el norte, en el dispensario médico que las Hermanitas tienen cerca de la ciudad de Koni, muy cerquita de la frontera con Burkina. Les apoyamos con el suministro de la merienda a los niños del colegio local, más de seiscientos niños que durante años han recibido un vaso de leche a la salida de la escuela. El impulsor de todas estas iniciativas ha sido el doctor Márquez, quien ha dedicado durante años sus vacaciones a asistir a pacientes en estas regiones remotas.
            </p>
            <p>
              En este dispensario, al que también llevan años apoyando los alumnos solidarios del Joyfe, hemos contribuido con la compra de equipamiento médico. También hemos financiado un centro de desnutridos, que atiende a los niños más vulnerables de la región.
            </p>

            <div className="not-prose bg-primary/5 border border-primary/15 rounded-2xl p-6 my-8">
              <p className="font-semibold text-foreground mb-2">📖 Cuentos Contra el Hambre</p>
              <p className="text-muted-foreground leading-relaxed">
                Un proyecto muy especial fue la edición de un libro ilustrado de cuentos, que conseguimos gracias a la colaboración de los alumnos y alumnas del JOYFE. <em>'Cuentos Contra el Hambre'</em> fue un exitazo de ventas, cuya recaudación destinamos al centro de desnutridos.
              </p>
            </div>

            <p>
              La segunda localización geográfica de los proyectos está en la aldea de Kahankro, a unas tres horas de la capital, Abidjan. Ahí las Hermanitas tienen un colegio, La Anunciación, con más de mil alumnos. Varios alumnos solidarios del JOYFE visitaron sus instalaciones, que han ido ampliándoselas hasta completar la educación Secundaria, gracias a la organización Manos Unidas.
            </p>
            <p>
              En esta escuela tenemos apadrinados como grupo Solidario a cinco niños. En total, coordinamos el apadrinamiento de más de un centenar de estudiantes y estamos muy orgullosos de sus resultados escolares.
            </p>
            <p>
              También desde hace años recibimos la visita anual de profesores y profesoras de la Escuela de la Anunciación, que mejoran su formación en nuestro Colegio.
            </p>
            <p>
              Nosotros hemos apoyado estos proyectos colaborando en los certámenes <em>'Arte por África'</em>, organizados en diferentes centros comerciales de Madrid. El propósito era contribuir con nuestras actividades a impulsar la recaudación del dinero destinado a proyectos en la escuela y en la clínica.
            </p>
            <p>Podéis haceros una idea de lo que hicimos viendo estas imágenes.</p>
          </div>
          <PhotoGallery photos={africaPhotos} />
        </div>
      </section>
    </>
  );
}

// Apadrinamiento page
export function Apadrinamiento() {
  return (
    <GenericPage
      title="Apadrinamiento"
      description="Crea un vínculo único y transforma el futuro de un niño."
    >
      <h3>¿Qué significa apadrinar?</h3>
      <p>
        Apadrinar es mucho más que una aportación económica. Es crear un lazo afectivo y solidario que permite
        a un niño acceder a educación, salud y nutrición adecuada. Tu apoyo no solo ayuda al niño, sino que
        impacta positivamente en toda su comunidad.
      </p>

      <div className="bg-accent/20 p-8 rounded-2xl my-8 border border-accent">
        <h4 className="text-xl font-bold text-primary mb-4">Tu aportación incluye:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>Material escolar y apoyo educativo.</li>
          <li>Revisiones médicas periódicas.</li>
          <li>Apoyo nutricional.</li>
          <li>Actividades recreativas y de integración.</li>
        </ul>
      </div>

      <p className="text-center mt-10">
        <button className="btn-primary">Quiero apadrinar ahora</button>
      </p>
    </GenericPage>
  );
}
