import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Filter, Search } from "lucide-react";
import { useAddToCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { useLanguage, localizedText } from "@/contexts/language";

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
      ))}
      {count > 0 && <span className="text-xs text-muted-foreground ml-1">({count})</span>}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart.mutateAsync({ productId: product.id });
      toast({ title: "Añadido al carrito", description: product.title });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-border/20 overflow-hidden card-hover"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/tienda/${product.id}`}>
        <div className="relative overflow-hidden aspect-square bg-gray-50">
          <img
            src={`${product.imageUrl}?w=400&h=400&fit=crop&auto=format`}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-foreground/70 shadow-sm">
              {product.category}
            </span>
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">Agotado</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display font-bold text-lg mb-1 line-clamp-1" data-testid={`text-product-title-${product.id}`}>{localizedText(product.title, product.titleEn, product.titleDe, lang)}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{localizedText(product.description, product.descriptionEn, product.descriptionDe, lang)}</p>
          <StarRating rating={0} count={0} />
          <div className="flex items-center justify-between mt-4">
            <span className="text-2xl font-display font-bold text-primary" data-testid={`text-product-price-${product.id}`}>{parseFloat(product.price as string).toFixed(2)}€</span>
            <button
              data-testid={`button-add-cart-${product.id}`}
              onClick={handleAddToCart}
              disabled={addToCart.isPending || product.stock === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-full text-sm font-bold transition-all disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              Añadir
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Store() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const categories = ["Todos", ...Array.from(new Set(products?.map((p) => p.category) ?? []))];

  const filtered = products?.filter((p) => {
    const matchesCat = category === "Todos" || p.category === category;
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">Tienda Solidaria</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Compra con propósito</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Cada compra contribuye directamente a nuestros proyectos educativos y solidarios.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border/20 p-4 mb-8 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="relative flex-1 min-w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              data-testid="input-store-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {categories.map((cat) => (
              <button
                key={cat}
                data-testid={`button-category-${cat}`}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${category === cat ? "bg-primary text-white" : "bg-gray-100 text-foreground/70 hover:bg-primary/10 hover:text-primary"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
