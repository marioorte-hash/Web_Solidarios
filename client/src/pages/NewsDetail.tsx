import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { NewsItem } from "@shared/schema";

export default function NewsDetail() {
  const [, params] = useRoute("/noticias/:id");
  const id = params?.id;

  const { data: item, isLoading } = useQuery<NewsItem>({
    queryKey: ["/api/news", Number(id)],
    enabled: !!id,
  });

  if (isLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-display font-bold mb-2">Noticia no encontrada</h2>
        <Link href="/noticias" className="btn-primary mt-4">Ver todas las noticias</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden mb-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
        <img src={`${item.imageUrl}?w=1400&h=600&fit=crop&auto=format`} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 z-20 flex flex-col justify-end container-custom pb-10">
          <Link href="/noticias" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver a Noticias
          </Link>
          <div className="flex items-center gap-2 text-primary/90 text-sm font-bold mb-3">
            <Calendar className="w-4 h-4" />
            {item.publishedAt && format(new Date(item.publishedAt as unknown as string), "d 'de' MMMM, yyyy", { locale: es })}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight max-w-3xl">{item.title}</h1>
        </div>
      </div>

      <div className="container-custom max-w-3xl py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium border-l-4 border-primary pl-6">
            {item.summary}
          </p>
          <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {item.content}
          </div>
        </motion.div>

        <div className="mt-12 pt-8 border-t border-border/20">
          <Link href="/noticias" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Ver más noticias
          </Link>
        </div>
      </div>
    </div>
  );
}
