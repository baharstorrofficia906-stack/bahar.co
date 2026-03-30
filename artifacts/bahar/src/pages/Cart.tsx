import { Link } from "wouter";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/hooks/use-language";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-muted-foreground">
          <ShoppingBag size={40} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-secondary mb-4">{t.cart.empty}</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{t.cart.emptySub}</p>
        <Link href="/products" className="btn-luxury px-8 py-4">
          {t.cart.startShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="font-serif text-4xl font-bold text-secondary mb-10">{t.cart.title}</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-6">
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6">{t.cart.product}</div>
              <div className="col-span-2 text-center">{t.cart.quantity}</div>
              <div className="col-span-3 text-right">{t.cart.total}</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item) => (
              <div key={`${item.productId}-${item.selectedSize ?? ""}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-border/50">
                <div className="col-span-1 md:col-span-6 flex items-center gap-6">
                  <div className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-secondary/20">B</div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-secondary text-lg mb-1">{item.productName}</h3>
                    {item.selectedSize && (
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md mb-1">
                        Size: {item.selectedSize}
                      </div>
                    )}
                    <div className="text-sm font-medium text-muted-foreground">EGP {item.unitPrice.toLocaleString()}</div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center mt-4 md:mt-0">
                  <div className="flex items-center bg-white border border-border rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize)}
                      className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-secondary">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize)}
                      className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 text-left md:text-right mt-2 md:mt-0">
                  <span className="font-serif text-xl font-bold text-secondary">
                    EGP {item.totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="col-span-1 md:col-span-1 text-right mt-[-40px] md:mt-0">
                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedSize)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-xl shadow-secondary/5 sticky top-32">
              <h2 className="font-serif text-2xl font-bold text-secondary mb-6">{t.cart.orderSummary}</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.cart.subtotal}</span>
                  <span>EGP {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.cart.shipping}</span>
                  <span>{t.cart.calculatedAtCheckout}</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-secondary text-lg">{t.cart.total}</span>
                  <span className="font-serif text-2xl font-bold text-primary">EGP {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-gold w-full py-4 flex items-center justify-center gap-2">
                {t.cart.checkout} <ArrowRight size={18} />
              </Link>

              <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Shield size={14} /> {t.cart.secureCheckout}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
