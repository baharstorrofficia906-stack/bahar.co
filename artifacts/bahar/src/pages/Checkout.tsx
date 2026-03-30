import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Shield, CheckCircle2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { useLanguage } from "@/hooks/use-language";

const EGYPT_GOVERNORATES_EN = [
  "Cairo", "Alexandria", "Giza", "Qalyubia", "Sharqia", "Dakahlia",
  "Beheira", "Kafr el-Sheikh", "Gharbia", "Monufia", "Faiyum", "Beni Suef",
  "Minya", "Asyut", "Sohag", "Qena", "Luxor", "Aswan", "Red Sea",
  "New Valley", "Matruh", "North Sinai", "South Sinai", "Ismailia",
  "Suez", "Port Said", "Damietta",
];

const EGYPT_GOVERNORATES_AR = [
  "القاهرة", "الإسكندرية", "الجيزة", "القليوبية", "الشرقية", "الدقهلية",
  "البحيرة", "كفر الشيخ", "الغربية", "المنوفية", "الفيوم", "بني سويف",
  "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر",
  "الوادي الجديد", "مطروح", "شمال سيناء", "جنوب سيناء", "الإسماعيلية",
  "السويس", "بورسعيد", "دمياط",
];

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  governorate: z.string().min(1, "Please select a governorate"),
  customerAddress: z.string().min(5, "Full address is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const createOrder = useCreateOrder();
  const { t, lang } = useLanguage();
  const governorates = lang === "ar" ? EGYPT_GOVERNORATES_AR : EGYPT_GOVERNORATES_EN;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema)
  });

  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      setLocation("/cart");
    }
  }, [items.length, isSuccess, setLocation]);

  if (items.length === 0 && !isSuccess) {
    return null;
  }

  const onSubmit = (data: CheckoutForm) => {
    const { governorate, ...rest } = data;
    createOrder.mutate({
      data: {
        ...rest,
        customerAddress: `${governorate} - ${data.customerAddress}`,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice
        })),
        totalPrice
      }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
        clearCart();
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-background flex items-center justify-center px-4">
        <div className="bg-card max-w-lg w-full p-12 rounded-3xl shadow-xl text-center border border-border">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-secondary mb-4">{t.checkout.orderPlaced}</h1>
          <p className="text-muted-foreground mb-8">{t.checkout.orderPlacedDesc}</p>
          <button onClick={() => setLocation("/")} className="btn-luxury px-8 py-4 w-full">
            {t.checkout.returnHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="font-serif text-4xl font-bold text-secondary mb-10">{t.checkout.title}</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="lg:w-2/3">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-border space-y-8">

              <div>
                <h2 className="font-serif text-2xl font-bold text-secondary mb-6 border-b border-border pb-4">{t.checkout.shippingDetails}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary">{t.checkout.fullName} <span className="text-destructive">*</span></label>
                    <input {...register("customerName")} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none" />
                    {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-secondary">{t.checkout.phone} <span className="text-destructive">*</span></label>
                    <input {...register("customerPhone")} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="01X XXXX XXXX" />
                    {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-secondary">{t.checkout.emailAddress} <span className="text-muted-foreground font-normal">({t.checkout.optional})</span></label>
                    <input {...register("customerEmail")} type="email" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none" />
                    {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-secondary">{t.checkout.governorate} <span className="text-destructive">*</span></label>
                    <select
                      {...register("governorate")}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none appearance-none cursor-pointer text-secondary"
                      defaultValue=""
                    >
                      <option value="" disabled>{t.checkout.governoratePlaceholder}</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                    {errors.governorate && <p className="text-xs text-destructive">{errors.governorate.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-secondary">{t.checkout.address} <span className="text-destructive">*</span></label>
                    <textarea {...register("customerAddress")} rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder={t.checkout.addressPlaceholder} />
                    {errors.customerAddress && <p className="text-xs text-destructive">{errors.customerAddress.message}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl font-bold text-secondary mb-6 border-b border-border pb-4">{t.checkout.paymentMethod}</h2>
                <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full border-4 border-primary bg-white"></div>
                  <span className="font-semibold text-secondary">{t.checkout.cod}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.checkout.notes} <span className="text-muted-foreground font-normal">({t.checkout.optional})</span></label>
                <textarea {...register("notes")} rows={2} className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none" />
              </div>

              <button
                type="submit"
                disabled={createOrder.isPending}
                className="btn-gold w-full py-5 text-lg"
              >
                {createOrder.isPending ? t.checkout.processing : t.checkout.placeOrder}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:w-1/3">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-xl shadow-secondary/5 sticky top-32">
              <h2 className="font-serif text-xl font-bold text-secondary mb-6">{t.checkout.inYourCart}</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-border">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-secondary line-clamp-1">{item.productName}</h4>
                      <div className="text-xs text-muted-foreground">{t.checkout.qty} {item.quantity}</div>
                      <div className="text-sm font-semibold mt-1 text-secondary">EGP {item.totalPrice.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>{t.checkout.subtotal}</span>
                  <span>EGP {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>{t.cart.shipping}</span>
                  <span>{t.checkout.calculatedLater}</span>
                </div>
                <div className="pt-3 flex justify-between items-center">
                  <span className="font-bold text-secondary">{t.checkout.total}</span>
                  <span className="font-serif text-2xl font-bold text-primary">EGP {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 bg-secondary/5 p-4 rounded-xl">
                <Shield className="w-5 h-5 text-secondary shrink-0" />
                <p className="text-xs text-secondary/70 leading-relaxed">{t.checkout.privacyNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
