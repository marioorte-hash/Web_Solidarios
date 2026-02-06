import { PageHeader } from "@/components/PageHeader";
import { NewsCard } from "@/components/Card";
import { useNews } from "@/hooks/use-content";

export default function News() {
  const { data: newsItems, isLoading } = useNews();

  return (
    <>
      <PageHeader 
        title="Noticias y Actualidad" 
        description="Descubre nuestras últimas historias, logros y novedades. Transparencia y cercanía en cada paso que damos."
      />
      
      <section className="py-20 bg-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : newsItems && newsItems.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  summary={item.summary}
                  imageUrl={item.imageUrl}
                  date={item.publishedAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No hay noticias disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
