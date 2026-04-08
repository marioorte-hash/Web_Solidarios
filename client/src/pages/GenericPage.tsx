import { PageHeader } from "@/components/PageHeader";

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

// Razón de Ser — full content
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
        <div className="container-custom max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">Todos a Una</h2>
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
            <p>
              Colaboramos con muchísimas entidades que merecen nuestra ayuda. Lo hacemos con ilusión y con creatividad. Estos son algunos ejemplos.
            </p>
          </div>
          {/* Bloque visual para imágenes de campañas */}
          <div className="mt-8 border-2 border-dashed border-primary/20 rounded-2xl p-10 text-center bg-white">
            <div className="text-primary/30 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Espacio para imágenes de campañas y actos realizados</p>
            <p className="text-muted-foreground text-xs mt-1">(Sube las imágenes desde el panel de administración)</p>
          </div>
        </div>
      </section>

      {/* ── África en el Corazón ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">África en el Corazón</h2>
          <div className="prose prose-lg prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary">
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

          {/* Bloque visual de imágenes África */}
          <div className="mt-8 border-2 border-dashed border-primary/20 rounded-2xl p-10 text-center bg-accent/10">
            <div className="text-primary/30 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Imágenes de los proyectos en África</p>
            <p className="text-muted-foreground text-xs mt-1">(Sube las imágenes desde el panel de administración)</p>
          </div>
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
