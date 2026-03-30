import { Heart } from "lucide-react";
import { useGetProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { useLikedProducts } from "@/hooks/use-liked-products";
import { Link } from "wouter";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

export default function Liked() {
  const { likedIds, clearLikes } = useLikedProducts();
  const { data: allProducts, isLoading } = useGetProducts();

  const likedProducts = allProducts?.filter(p => likedIds.includes(p.id)) ?? [];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-secondary/5 -z-10"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
            <Heart className="text-red-500" size={28} fill="currentColor" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4">Liked Products</h1>
          <p className="text-muted-foreground">
            {likedIds.length === 0
              ? "You haven't liked any products yet. Browse our collection and tap the heart icon."
              : `You have ${likedIds.length} liked product${likedIds.length !== 1 ? "s" : ""}.`}
          </p>
          {likedIds.length > 0 && (
            <button
              onClick={clearLikes}
              className="mt-4 text-xs text-muted-foreground hover:text-red-500 underline transition-colors"
            >
              Clear all liked products
            </button>
          )}
        </div>

        {isLoading ? (
          <PlaneLoader text="Loading your favourites..." />
        ) : likedProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border">
            <Heart className="mx-auto text-muted-foreground/30 mb-4" size={48} />
            <h3 className="font-serif text-2xl text-secondary mb-2">No liked products yet</h3>
            <p className="text-muted-foreground mb-6">Browse our collection and click the ♡ to save your favourites here.</p>
            <Link href="/products" className="btn-gold px-6 py-3 text-sm font-bold rounded-xl">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {likedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
