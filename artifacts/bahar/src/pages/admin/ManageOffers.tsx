import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetOffers, useGetProducts, useCreateOffer, useUpdateOffer, useDeleteOffer, Offer } from "@workspace/api-client-react";
import { Plus, Edit2, Trash2, X, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/hooks/use-language";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

export default function ManageOffers() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: offers, isLoading } = useGetOffers();
  const { data: products } = useGetProducts();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const { register, handleSubmit, reset } = useForm<any>();

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditingId(offer.id);
      const formatted: any = { ...offer };
      if (offer.expiresAt) {
        formatted.expiresAt = new Date(offer.expiresAt).toISOString().slice(0, 16);
      }
      reset(formatted);
      // Pre-populate selected products from offer_products junction
      const ids = (offer as any).productIds ?? (offer.productId ? [offer.productId] : []);
      setSelectedProductIds(ids.map(Number));
    } else {
      setEditingId(null);
      reset({ active: true, discountPercent: 10 });
      setSelectedProductIds([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setSelectedProductIds([]);
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const onSubmit = (data: any) => {
    const formattedData = {
      ...data,
      productId: selectedProductIds[0] ?? undefined,
      productIds: selectedProductIds,
      discountPercent: data.discountPercent ? Number(data.discountPercent) : undefined,
      stockLimit: data.stockLimit ? Number(data.stockLimit) : undefined,
      stockRemaining: data.stockRemaining ? Number(data.stockRemaining) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
    };

    if (editingId) {
      updateOffer.mutate({ id: editingId, data: formattedData }, { onSuccess: () => { queryClient.invalidateQueries(); closeModal(); }});
    } else {
      createOffer.mutate({ data: formattedData }, { onSuccess: () => { queryClient.invalidateQueries(); closeModal(); }});
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t.admin.offers.deleteConfirm)) deleteOffer.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries() });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary font-serif">{t.admin.offers.title}</h1>
        <button onClick={() => openModal()} className="btn-gold px-4 py-2 flex items-center gap-2 text-sm rounded-lg">
          <Plus size={16} /> {t.admin.offers.newOffer}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background text-sm text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">{t.admin.offers.tableTitle}</th>
              <th className="px-6 py-4 font-semibold">Products</th>
              <th className="px-6 py-4 font-semibold">{t.admin.offers.discount}</th>
              <th className="px-6 py-4 font-semibold">{t.admin.offers.expires}</th>
              <th className="px-6 py-4 font-semibold">{t.admin.offers.status}</th>
              <th className="px-6 py-4 font-semibold text-right">{t.admin.offers.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8"><PlaneLoader text="Loading offers..." /></td></tr>
            ) : offers?.map(o => {
              const linkedProducts = (o as any).products ?? [];
              return (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-semibold">{o.title}</td>
                  <td className="px-6 py-4">
                    {linkedProducts.length === 0 ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {linkedProducts.map((p: any) => (
                          <span key={p.id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            <Package size={10} /> {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4"><span className="bg-destructive/10 text-destructive font-bold px-2 py-1 rounded">{o.discountPercent}%</span></td>
                  <td className="px-6 py-4">{o.expiresAt ? new Date(o.expiresAt).toLocaleDateString() : t.admin.offers.never}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${o.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {o.active ? t.admin.offers.active : t.admin.offers.inactive}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(o)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(o.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl my-auto p-8 relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-6 right-6 text-muted-foreground hover:text-secondary"><X size={24}/></button>
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6">{editingId ? t.admin.offers.editOffer : t.admin.offers.createOffer}</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.offers.fieldTitle}</label>
                  <input {...register("title", { required: true })} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.offers.discountPercent}</label>
                  <input type="number" {...register("discountPercent")} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.offers.expiryDateTime}</label>
                  <input type="datetime-local" {...register("expiresAt")} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.offers.stockLimit}</label>
                  <input type="number" {...register("stockLimit")} className="w-full border rounded-lg p-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">{t.admin.offers.stockRemaining}</label>
                  <input type="number" {...register("stockRemaining")} className="w-full border rounded-lg p-3" />
                </div>
              </div>

              {/* Multi-product selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">Linked Products</label>
                <p className="text-xs text-muted-foreground">Select one or more products to include in this offer.</p>
                {!products || products.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No products available yet.</p>
                ) : (
                  <div className="border border-border rounded-xl p-3 max-h-52 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {products.map(p => (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedProductIds.includes(p.id) ? "bg-indigo-50 border border-indigo-200" : "hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-indigo-600"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        {p.imageUrl && (
                          <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-secondary truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground">EGP {p.price.toLocaleString()}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {selectedProductIds.length > 0 && (
                  <p className="text-xs text-indigo-600 font-semibold">{selectedProductIds.length} product{selectedProductIds.length > 1 ? "s" : ""} selected</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t.admin.offers.description}</label>
                <textarea {...register("description")} rows={2} className="w-full border rounded-lg p-3" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" {...register("active")} className="w-4 h-4" />
                <label htmlFor="active" className="font-semibold">{t.admin.offers.offerIsActive}</label>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-6 py-3 font-semibold hover:bg-muted rounded-xl">{t.admin.offers.cancel}</button>
                <button type="submit" disabled={createOffer.isPending || updateOffer.isPending} className="bg-secondary text-white px-8 py-3 rounded-xl">
                  {(createOffer.isPending || updateOffer.isPending) ? "Saving..." : t.admin.offers.saveOffer}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
