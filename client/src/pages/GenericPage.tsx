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

// Placeholder content for Razon de Ser
export function RazonDeSer() {
  return (
    <GenericPage 
      title="Nuestra Razón de Ser" 
      description="Conoce la historia, misión y valores que impulsan cada una de nuestras acciones."
    >
      <h3>Nuestra Misión</h3>
      <p>
        Existimos para brindar apoyo, recursos y oportunidades a niños y familias en situación de vulnerabilidad.
        Creemos firmemente que cada niño merece un entorno seguro, amoroso y estimulante donde pueda desarrollar todo su potencial.
      </p>
      
      <h3>Nuestros Valores</h3>
      <ul>
        <li><strong>Empatía:</strong> Nos ponemos en el lugar del otro para entender sus necesidades reales.</li>
        <li><strong>Compromiso:</strong> No nos rendimos ante las dificultades; perseveramos por el bienestar de los niños.</li>
        <li><strong>Transparencia:</strong> Gestionamos cada recurso con honestidad y claridad.</li>
      </ul>

      <img 
        src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop" 
        alt="Voluntarios trabajando" 
        className="w-full rounded-2xl my-10 shadow-lg" 
      />
    </GenericPage>
  );
}

// Placeholder content for Apadrinamiento
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
