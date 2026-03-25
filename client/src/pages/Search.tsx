import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search as SearchIcon, Newspaper, Calendar, ShoppingBag, X } from "lucide-react";
import type { Product, NewsItem, Activity } from "@shared/schema";

interface SearchResults {
  products: Product[];
  news: NewsItem[];
  activities: Activity[];
}

export default function Search() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { products: [], news: [], activities: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const totalResults = (data?.products?.length ?? 0) + (data?.news?.length ?? 0) + (data?.activities?.length ?? 0);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom max-w-4xl">
        {/* Search Bar */}
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold mb-6">Buscar</h1>
          <div className="relative">
            <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              data-testid="input-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en productos, noticias y actividades..."
              autoFocus
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-border bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            {query && (
              <button onClick={() => setQuery("")} data-testid="button-clear-search" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Buscando...
          </div>
        )}

        {/* No query */}
        {!debouncedQuery.trim() && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Escribe algo para empezar a buscar</p>
          </div>
        )}

        {/* No results */}
        {debouncedQuery.trim() && !isLoading && data && totalResults === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Sin resultados para "{debouncedQuery}"</p>
            <p className="text-sm mt-2">Prueba con otros términos de búsqueda</p>
          </div>
        )}

        {/* Results */}
        {data && totalResults > 0 && (
          <div className="space-y-10">
            <p className="text-sm text-muted-foreground">{totalResults} resultado{totalResults !== 1 ? "s" : ""} para "{debouncedQuery}"</p>

            {/* Products */}
            {data.products.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg">Productos ({data.products.length})</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.products.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Link href={`/tienda/${p.id}`} data-testid={`search-product-${p.id}`} className="flex gap-4 bg-white rounded-2xl border border-border/20 p-4 hover:border-primary/30 transition-colors group">
                        <img src={`${p.imageUrl}?w=80&h=80&fit=crop&auto=format`} alt={p.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{p.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                          <p className="text-primary font-bold mt-1">{parseFloat(p.price as string).toFixed(2)}€</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* News */}
            {data.news.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg">Noticias ({data.news.length})</h2>
                </div>
                <div className="space-y-3">
                  {data.news.map((n) => (
                    <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Link href={`/noticias/${n.id}`} data-testid={`search-news-${n.id}`} className="flex gap-4 bg-white rounded-2xl border border-border/20 p-4 hover:border-primary/30 transition-colors group">
                        <img src={`${n.imageUrl}?w=80&h=80&fit=crop&auto=format`} alt={n.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <h3 className="font-bold group-hover:text-primary transition-colors">{n.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{n.summary}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Activities */}
            {data.activities.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg">Actividades ({data.activities.length})</h2>
                </div>
                <div className="space-y-3">
                  {data.activities.map((a) => (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Link href="/actividades" data-testid={`search-activity-${a.id}`} className="flex gap-4 bg-white rounded-2xl border border-border/20 p-4 hover:border-primary/30 transition-colors group">
                        <img src={`${a.imageUrl}?w=80&h=80&fit=crop&auto=format`} alt={a.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div>
                          <h3 className="font-bold group-hover:text-primary transition-colors">{a.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
