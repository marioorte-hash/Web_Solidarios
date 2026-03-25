import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, ShoppingCart, ArrowLeft, Package } from "lucide-react";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface Review {
  id: number;
  userId: number;
  username: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ProductWithImages extends Product {
  images: { id: number; imageUrl: string }[];
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          data-testid={`star-${s}`}
          className="focus:outline-none"
        >
          <Star className={`w-6 h-6 transition-colors ${s <= (hover || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/tienda/:id");
  const id = Number(params?.id);
  const { data: product, isLoading } = useQuery<ProductWithImages>({ queryKey: ["/api/products", id] });
  const { data: reviews } = useQuery<Review[]>({ queryKey: ["/api/products", id, "reviews"] });
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const addToCart = useAddToCart();
  const qc = useQueryClient();

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/products/${id}/reviews`, { rating, comment });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/products", id, "reviews"] });
      setRating(0);
      setComment("");
      toast({ title: "¡Reseña publicada!", description: "Gracias por tu valoración." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
        <h2 className="text-2xl font-display font-bold mb-2">Producto no encontrado</h2>
        <Link href="/tienda" className="btn-primary mt-4">Volver a la tienda</Link>
      </div>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.images?.map(i => i.imageUrl) ?? [])];
  const avgRating = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom">
        <Link href="/tienda" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-4"
            >
              <img src={`${allImages[selectedImage]}?w=800&h=800&fit=crop&auto=format`} alt={product.title} className="w-full h-full object-cover" />
            </motion.div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    data-testid={`button-image-${i}`}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={`${img}?w=160&h=160&fit=crop&auto=format`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4" data-testid="text-product-name">{product.title}</h1>
            {reviews && reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} reseñas)</span>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-display font-bold text-primary" data-testid="text-detail-price">{parseFloat(product.price as string).toFixed(2)}€</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
              </span>
            </div>
            <button
              data-testid="button-add-to-cart"
              disabled={addToCart.isPending || product.stock === 0}
              onClick={async () => {
                try {
                  await addToCart.mutateAsync({ productId: product.id });
                  toast({ title: "Añadido al carrito", description: product.title });
                } catch (err: any) {
                  toast({ title: "Error", description: err.message, variant: "destructive" });
                }
              }}
              className="btn-primary w-full flex items-center gap-3 justify-center text-base disabled:opacity-50"
            >
              <ShoppingCart className="w-5 h-5" />
              {addToCart.isPending ? "Añadiendo..." : "Añadir al carrito"}
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-border/20 pt-12">
          <h2 className="text-2xl font-display font-bold mb-8">Reseñas y valoraciones</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Existing reviews */}
            <div>
              {reviews?.length === 0 ? (
                <p className="text-muted-foreground">Aún no hay reseñas. ¡Sé el primero!</p>
              ) : (
                <div className="space-y-4">
                  {reviews?.map((review) => (
                    <div key={review.id} data-testid={`review-${review.id}`} className="bg-white rounded-2xl p-5 border border-border/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                          {review.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{review.username}</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add review */}
            <div>
              {user ? (
                <div className="bg-white rounded-2xl p-6 border border-border/20">
                  <h3 className="font-display font-bold text-lg mb-4">Escribe tu reseña</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Valoración</label>
                      <StarPicker value={rating} onChange={setRating} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Comentario (opcional)</label>
                      <textarea
                        data-testid="input-review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        placeholder="¿Qué te pareció el producto?"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                    <button
                      data-testid="button-submit-review"
                      disabled={rating === 0 || submitReview.isPending}
                      onClick={() => submitReview.mutate()}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submitReview.isPending ? "Publicando..." : "Publicar reseña"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-accent/30 rounded-2xl p-6 text-center">
                  <p className="text-muted-foreground mb-4">Inicia sesión para dejar una reseña</p>
                  <Link href="/auth" className="btn-primary">Iniciar sesión</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
