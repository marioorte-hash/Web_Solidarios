import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Star } from "lucide-react";
import { useNews, useActivities } from "@/hooks/use-content";
import { NewsCard, ActivityCard } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

// Unsplash images for emotional impact
// child smiling: https://images.unsplash.com/photo-1488521787991-ed7bbaae773c
// hands together: https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca
// volunteer group: https://images.unsplash.com/photo-1559027615-cd4628902d4a

export default function Home() {
  const { data: newsItems, isLoading: newsLoading } = useNews();
  const { data: activities, isLoading: activitiesLoading } = useActivities();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
            alt="Niño sonriendo"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="container-custom relative z-20 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
              Juntos cambiamos vidas
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] mb-6">
              Pequeños gestos,<br />
              <span className="text-primary">grandes sonrisas.</span>
            </h1>
            <p className="text-xl text-foreground/70 mb-8 max-w-lg leading-relaxed">
              Trabajamos cada día para construir un futuro lleno de oportunidades, amor y esperanza para quienes más lo necesitan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/apadrinamiento" className="btn-primary">
                Colabora hoy
              </Link>
              <Link href="/razon-de-ser" className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-bold text-foreground bg-white border border-border hover:bg-gray-50 transition-all">
                Conócenos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Stats/Values */}
      <section className="py-20 bg-accent/30">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              icon={<Heart className="w-8 h-8 text-primary" />}
              title="Compromiso"
              description="Dedicación total al bienestar y desarrollo integral de cada niño."
            />
            <ValueCard 
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Comunidad"
              description="Creamos lazos fuertes entre familias, voluntarios y padrinos."
            />
            <ValueCard 
              icon={<Star className="w-8 h-8 text-primary" />}
              title="Transparencia"
              description="Claridad total en la gestión de recursos y el impacto generado."
            />
          </div>
        </div>
      </section>

      {/* News Preview */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Últimas Noticias</h2>
              <p className="text-muted-foreground">Mantente al día de nuestras acciones y logros.</p>
            </div>
            <Link href="/noticias" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsLoading ? (
              [1, 2, 3].map((i) => <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />)
            ) : (
              newsItems?.slice(0, 3).map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  summary={item.summary}
                  imageUrl={item.imageUrl}
                  date={item.publishedAt}
                />
              ))
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/noticias" className="btn-primary w-full">Ver todas las noticias</Link>
          </div>
        </div>
      </section>

      {/* Activities Preview */}
      <section className="py-24 bg-secondary/30">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Próximas Actividades</h2>
            <p className="text-muted-foreground text-lg">
              Eventos, talleres y encuentros pensados para aprender, compartir y crecer juntos.
            </p>
          </div>

          <div className="space-y-8">
            {activitiesLoading ? (
              <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ) : (
              activities?.slice(0, 2).map((activity) => (
                <ActivityCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  imageUrl={activity.imageUrl}
                  date={activity.date}
                  location={activity.location}
                />
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/actividades" className="inline-flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors">
              Consultar agenda completa <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">¿Quieres ser parte del cambio?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Tu apoyo hace posible que sigamos creando historias con final feliz. Descubre cómo puedes colaborar.
          </p>
          <Link href="/contacto" className="inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-bold text-primary bg-white hover:scale-105 transition-transform shadow-xl">
            Contáctanos ahora
          </Link>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-border/20 text-center hover:-translate-y-1 transition-transform duration-300">
      <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
