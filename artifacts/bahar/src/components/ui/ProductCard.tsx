import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useLikedProducts } from "@/hooks/use-liked-products";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLiked, toggleLike } = useLikedProducts();
  const liked = isLiked(product.id);
  const [activeImage, setActiveImage] = useState(0);

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      className: "bg-secondary text-white border-none",
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product.id);
    toast({
      title: liked ? "Removed from Liked" : "Added to Liked",
      description: liked
        ? `${product.name} removed from your liked products.`
        : `${product.name} added to your liked products.`,
      className: "bg-secondary text-white border-none",
    });
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage(i => (i - 1 + allImages.length) % allImages.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImage(i => (i + 1) % allImages.length);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="h-full"
    >
      <Link href={`/products?id=${product.id}`} className="group block h-full">
        <div className="luxury-card overflow-hidden h-full flex flex-col relative bg-white">

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {discount > 0 && (
              <span className="bg-destructive text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                {discount}% OFF
              </span>
            )}
            {product.featured && (
              <span className="bg-primary text-secondary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                Premium
              </span>
            )}
          </div>

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all ${
              liked
                ? "text-red-500 opacity-100"
                : "text-secondary/50 hover:text-red-400 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
            }`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
          </button>

          {/* Image Carousel */}
          <div className="aspect-[4/5] overflow-hidden bg-white relative">
            {allImages.length > 0 ? (
              <>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={activeImage}
                    src={allImages[activeImage]}
                    alt={`${product.name} ${activeImage + 1}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-full h-full object-contain p-3 absolute inset-0"
                  />
                </AnimatePresence>

                {/* Arrow buttons — only show when multiple images */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight size={14} />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveImage(i); }}
                          className={`rounded-full transition-all ${
                            i === activeImage
                              ? "w-4 h-1.5 bg-secondary"
                              : "w-1.5 h-1.5 bg-secondary/30 hover:bg-secondary/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <span className="font-serif text-secondary/30 text-2xl">BAHAR</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">
              {product.category || "Exclusive"}
            </div>

            <h3 className="font-serif text-lg font-semibold text-secondary leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>

            {product.nameAr && (
              <h4 className="arabic-text text-sm text-muted-foreground mb-3 leading-relaxed">
                {product.nameAr}
              </h4>
            )}

            <div className="mt-auto pt-4 flex items-end justify-between">
              <div className="flex flex-col">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-muted-foreground line-through mb-0.5">
                    EGP {product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="font-serif text-xl font-bold text-secondary">
                  EGP {product.price.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center hover:bg-primary transition-colors disabled:opacity-50 disabled:bg-muted"
              >
                <ShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
