import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
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

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ];
  const mainImage = allImages[0];

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

        {/* Image */}
        <div className="aspect-[4/5] overflow-hidden bg-muted relative">
          {mainImage ? (
            <img 
              src={mainImage} 
              alt={product.name}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/50">
              <span className="font-serif text-secondary/30 text-2xl">BAHAR</span>
            </div>
          )}
          {allImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              +{allImages.length - 1} photos
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
