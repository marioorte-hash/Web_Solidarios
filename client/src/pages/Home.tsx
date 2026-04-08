import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Users, Star, Calendar, MapPin, ShoppingBag } from "lucide-react";
import { useNews, useActivities } from "@/hooks/use-content";
import { useQuery } from "@tanstack/react-query";
import { NewsCard } from "@/components/Card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Home() {
  const { data: newsItems, isLoading: newsLoading } = useNews();
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  const { data: products, isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const upcomingActivities = activities?.slice(0, 3) ?? [];
  const featuredProducts = products?.slice(0, 4) ?? [];

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

      {/* Activities Preview */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Próximas Actividades</h2>
              <p className="text-muted-foreground">Participa en nuestros eventos y forma parte de la comunidad.</p>
            </div>
            <Link href="/actividades" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activitiesLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : upcomingActivities.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-primary/20 rounded-2xl">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Próximamente nuevas actividades</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingActivities.map((act: any) => (
                <div key={act.id} className="group bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                  {act.imageUrl && (
                    <div className="relative h-44 overflow-hidden">
                      <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(act.date), "d MMM yyyy", { locale: es })}
                      </span>
                      {act.location && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-foreground/60 px-3 py-1 rounded-full">
                          <MapPin className="w-3.5 h-3.5" />
                          {act.location}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">{act.title}</h3>
                    {act.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{act.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/actividades" className="btn-primary w-full">Ver todas las actividades</Link>
          </div>
        </div>
      </section>

      {/* News Preview */}
      <section className="py-24 bg-accent/20">
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

      {/* Store Preview */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Tienda Solidaria</h2>
              <p className="text-muted-foreground">Compra con propósito. Cada artículo ayuda a financiar nuestros proyectos.</p>
            </div>
            <Link href="/tienda" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
              Ver tienda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-primary/20 rounded-2xl">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-medium">Próximamente artículos en la tienda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product: any) => (
                <Link key={product.id} href={`/tienda/${product.id}`} className="group block">
                  <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-gray-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{product.name}</p>
                      <p className="text-primary font-bold mt-2 text-lg">{parseFloat(product.price).toFixed(2)} €</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/tienda" className="btn-primary w-full">Ver toda la tienda</Link>
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
