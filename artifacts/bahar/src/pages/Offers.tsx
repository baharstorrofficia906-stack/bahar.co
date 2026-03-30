import { useGetOffers } from "@workspace/api-client-react";
import { Countdown } from "@/components/ui/Countdown";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

export default function Offers() {
  const { data: offers, isLoading } = useGetOffers();
  const { addToCart } = useCart();
  const { toast } = useToast();

  return (
    <div className="min-h-screen pt-28 pb-24 bg-secondary text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-primary font-bold tracking-[0.2em] text-sm uppercase mb-4 px-4 py-1 border border-primary/30 rounded-full">
            Limited Time Only
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 text-white">Exclusive <span className="gold-gradient-text">Deals</span></h1>
          <p className="text-white/70 text-lg mb-4">Don't miss out on these specially curated offers. Stock is strictly limited.</p>
          <p className="arabic-text text-xl text-primary/90">عروض حصرية لفترة محدودة</p>
        </div>

        {isLoading ? (
          <PlaneLoader text="Loading offers..." />
        ) : (
          <div className="space-y-12">
            {offers?.filter(o => o.active).map((offer) => {
              const linkedProducts = (offer as any).products ?? (offer.product ? [offer.product] : []);
              const mainImage = offer.imageUrl || linkedProducts[0]?.imageUrl;

              const progress = offer.stockLimit && offer.stockRemaining !== undefined
                ? ((offer.stockLimit - offer.stockRemaining) / offer.stockLimit) * 100
                : 0;

              return (
                <div key={offer.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md flex flex-col lg:flex-row group hover:border-primary/30 transition-colors">
                  
                  {/* Image Side */}
                  <div className="lg:w-2/5 relative h-64 lg:h-auto overflow-hidden bg-black/20">
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-destructive text-white px-4 py-2 rounded-lg shadow-lg font-bold flex flex-col items-center leading-none">
                        <span className="text-sm uppercase tracking-wider">SAVE</span>
                        <span className="text-2xl">{offer.discountPercent}%</span>
                      </div>
                    </div>
                    {mainImage ? (
                      <img 
                        src={mainImage}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-serif text-3xl">BAHAR</div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="lg:w-3/5 p-8 md:p-12 flex flex-col">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 group-hover:text-primary transition-colors">{offer.title}</h2>
                    {offer.titleAr && (
                      <h3 className="arabic-text text-xl text-white/60 mb-4">{offer.titleAr}</h3>
                    )}
                    
                    {offer.description && (
                      <p className="text-white/80 mb-6 leading-relaxed max-w-xl">{offer.description}</p>
                    )}

                    {/* Multi-product grid */}
                    {linkedProducts.length > 0 && (
                      <div className={`grid gap-3 mb-6 ${linkedProducts.length > 1 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}>
                        {linkedProducts.map((product: any) => {
                          const discountedPrice = offer.offerPrice ?? (product.price * (1 - (offer.discountPercent ?? 0) / 100));
                          return (
                            <div key={product.id} className="bg-black/30 rounded-xl p-3 border border-white/5 flex flex-col gap-2">
                              {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover rounded-lg" />
                              )}
                              <p className="font-semibold text-sm text-white truncate">{product.name}</p>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div>
                                  <div className="text-white/40 line-through text-xs">EGP {product.price.toLocaleString()}</div>
                                  <div className="text-primary font-bold text-sm">EGP {discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                </div>
                                <button
                                  onClick={() => {
                                    addToCart({ ...product, price: discountedPrice });
                                    toast({ title: "Added to Cart", description: `${product.name} added.` });
                                  }}
                                  className="p-2 bg-primary/20 hover:bg-primary text-primary hover:text-secondary rounded-lg transition-colors shrink-0"
                                  title="Add to cart"
                                >
                                  <ShoppingCart size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="bg-black/30 rounded-2xl p-6 mb-6 border border-white/5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <div className="text-sm text-primary font-bold tracking-widest uppercase mb-2">Offer Ends In</div>
                          {offer.expiresAt && <Countdown expiresAt={offer.expiresAt} />}
                        </div>
                        
                        {offer.offerPrice && (
                          <div className="text-right">
                            {offer.originalPrice && (
                              <div className="text-white/50 line-through text-lg mb-1">EGP {offer.originalPrice.toLocaleString()}</div>
                            )}
                            <div className="font-serif text-4xl font-bold text-primary">EGP {offer.offerPrice.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {offer.stockRemaining !== undefined && offer.stockRemaining <= 10 && (
                        <div className="mb-2 flex justify-between text-sm font-bold text-destructive">
                          <span>High Demand!</span>
                          <span>Only {offer.stockRemaining} left</span>
                        </div>
                      )}
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${offer.stockRemaining !== undefined && offer.stockRemaining <= 10 ? 'bg-destructive' : 'bg-primary'}`} 
                          style={{ width: `${Math.max(10, progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {offers?.filter(o => o.active).length === 0 && (
              <div className="text-center py-24 text-white/40">
                <p className="text-2xl font-serif mb-2">No active offers right now</p>
                <p>Check back soon for exclusive deals.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
