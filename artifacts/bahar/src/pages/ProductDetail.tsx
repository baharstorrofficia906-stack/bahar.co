import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, ArrowLeft, Package, Star, Shield, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetProduct } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useLikedProducts } from "@/hooks/use-liked-products";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

interface ProductDetailProps {
  id: number;
}

export default function ProductDetail({ id }: ProductDetailProps) {
  const [, setLocation] = useLocation();
  const { data: product, isLoading, isError } = useGetProduct(id);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLiked, toggleLike } = useLikedProducts();
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <PlaneLoader text="Loading product..." />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center px-4">
        <Package size={48} className="text-muted-foreground mb-4" />
        <h2 className="font-serif text-3xl font-bold text-secondary mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-8">This product may have been removed or doesn't exist.</p>
        <Link href="/#collection" className="btn-luxury px-8 py-4">
          Back to Collection
        </Link>
      </div>
    );
  }

  const liked = isLiked(product.id);
  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
      className: "bg-secondary text-white border-none",
    });
  };

  const handleLike = () => {
    toggleLike(product.id);
    toast({
      title: liked ? "Removed from Liked" : "Added to Liked",
      description: liked
        ? `${product.name} removed from your liked products.`
        : `${product.name} added to your liked products.`,
      className: "bg-secondary text-white border-none",
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* Breadcrumb */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-border shadow-sm mb-4">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <span className="font-serif text-secondary/30 text-4xl">BAHAR</span>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
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

              {/* Image nav arrows (only if multiple images) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => (i + 1) % allImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all bg-white ${
                      i === activeImage ? "border-primary shadow-md" : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-3">
              {product.category || "Exclusive"}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-secondary leading-tight mb-2">
              {product.name}
            </h1>

            {product.nameAr && (
              <p className="arabic-text text-lg text-muted-foreground mb-4">{product.nameAr}</p>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="font-serif text-3xl font-bold text-secondary">
                EGP {product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-muted-foreground line-through mb-0.5">
                  EGP {product.originalPrice.toLocaleString()}
                </span>
              )}
              {discount > 0 && (
                <span className="mb-1 text-sm font-bold text-destructive">Save {discount}%</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-700 font-medium">
                    {product.stock <= 5 ? `Only ${product.stock} left` : "In Stock"}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="font-semibold text-secondary mb-2 text-sm uppercase tracking-wider">About this product</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}
            {product.descriptionAr && (
              <p className="arabic-text text-muted-foreground leading-relaxed mb-6">{product.descriptionAr}</p>
            )}

            {/* Origin */}
            {product.origin && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Shield size={14} />
                <span>Origin: <span className="font-semibold text-secondary">{product.origin}</span></span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 btn-luxury py-4 flex items-center justify-center gap-2 text-sm tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {product.stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
              </button>

              <button
                onClick={handleLike}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                  liked
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-border hover:border-red-300 hover:text-red-400 text-muted-foreground"
                }`}
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-border">
              {[
                { icon: <Star size={16} />, label: "Premium Quality" },
                { icon: <Shield size={16} />, label: "Authentic Products" },
                { icon: <Truck size={16} />, label: "Egypt Delivery" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
