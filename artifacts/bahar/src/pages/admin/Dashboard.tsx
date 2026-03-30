import { useState } from "react";
import {
  useGetStats,
  useGetProducts,
  useUpdateProduct,
  useGetOffers,
  useDeleteOffer,
  useGetMessages,
  useMarkMessageRead,
  Product,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Package, ShoppingCart, DollarSign, Users, Edit2, Trash2, X, Tag, Mail, MailOpen } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: stats, isLoading, error } = useGetStats({ query: { retry: false } });
  const { data: products } = useGetProducts();
  const { data: offers } = useGetOffers();
  const { data: customerMessages } = useGetMessages();

  const updateProduct = useUpdateProduct();
  const deleteOffer = useDeleteOffer();
  const markRead = useMarkMessageRead();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { register, handleSubmit, reset } = useForm<any>();

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    reset({
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice ?? "",
      stock: p.stock ?? "",
      category: p.category ?? "",
      description: p.description ?? "",
    });
  };

  const closeEditProduct = () => {
    setEditingProduct(null);
    reset();
  };

  const onProductSubmit = (data: any) => {
    if (!editingProduct) return;
    updateProduct.mutate(
      {
        id: editingProduct.id,
        data: {
          ...data,
          price: Number(data.price),
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          stock: data.stock ? Number(data.stock) : undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          closeEditProduct();
        },
      }
    );
  };

  const handleDeleteOffer = (id: number, title: string) => {
    if (confirm(`${t.admin.offers.deleteConfirm} "${title}"?`)) {
      deleteOffer.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries() });
    }
  };

  if (error) {
    setLocation("/admin");
    return null;
  }

  if (isLoading || !stats) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-2xl"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: t.admin.dashboard.totalRevenue, value: `EGP ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={24} />, color: "text-green-600 bg-green-100" },
    { title: t.admin.dashboard.totalOrders, value: stats.totalOrders, icon: <ShoppingCart size={24} />, color: "text-blue-600 bg-blue-100" },
    { title: t.admin.dashboard.pendingOrders, value: stats.pendingOrders, icon: <ShoppingCart size={24} />, color: "text-amber-600 bg-amber-100" },
    { title: t.admin.dashboard.totalCustomers, value: stats.totalCustomers, icon: <Users size={24} />, color: "text-purple-600 bg-purple-100" },
    { title: t.admin.dashboard.totalProducts, value: stats.totalProducts, icon: <Package size={24} />, color: "text-indigo-600 bg-indigo-100" },
  ];

  return (
    <AdminLayout>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{card.title}</p>
              <h3 className="font-serif text-2xl font-bold text-secondary">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
        <div className="p-6 border-b border-border">
          <h3 className="font-serif text-xl font-bold text-secondary">{t.admin.dashboard.recentOrders}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background text-sm text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">{t.admin.dashboard.orderId}</th>
                <th className="px-6 py-4 font-semibold">{t.admin.dashboard.customer}</th>
                <th className="px-6 py-4 font-semibold">{t.admin.dashboard.date}</th>
                <th className="px-6 py-4 font-semibold">{t.admin.dashboard.status}</th>
                <th className="px-6 py-4 font-semibold text-right">{t.admin.dashboard.total}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">{t.admin.dashboard.noRecentOrders}</td></tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">#{order.id}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                        order.status === "pending" ? "bg-amber-100 text-amber-700" :
                        order.status === "processing" ? "bg-blue-100 text-blue-700" :
                        order.status === "shipped" ? "bg-indigo-100 text-indigo-700" :
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">EGP {order.totalPrice.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Messages */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Mail size={18} />
            </div>
            <h3 className="font-serif text-lg font-bold text-secondary">Customer Messages</h3>
          </div>
          <span className="text-xs text-muted-foreground font-semibold">
            {customerMessages?.filter(m => !m.read).length ?? 0} unread
          </span>
        </div>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {!customerMessages || customerMessages.length === 0 ? (
            <p className="px-6 py-8 text-center text-muted-foreground text-sm">No messages yet</p>
          ) : (
            customerMessages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-4 px-6 py-4 transition-colors ${msg.read ? "opacity-60" : "bg-blue-50/40"}`}>
                <div className="mt-1 shrink-0 text-blue-500">
                  {msg.read ? <MailOpen size={16} /> : <Mail size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-secondary text-sm">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.email}</span>
                    {msg.createdAt && (
                      <span className="text-xs text-muted-foreground ml-auto shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {msg.subject && <p className="text-xs font-semibold text-secondary/70 mb-1">{msg.subject}</p>}
                  <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                </div>
                {!msg.read && (
                  <button
                    onClick={() => markRead.mutate({ id: msg.id }, { onSuccess: () => queryClient.invalidateQueries() })}
                    className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded-lg hover:bg-blue-100"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Row: Edit Products + Delete Offers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Edit Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Package size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-secondary">{t.admin.dashboard.editProducts}</h3>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">{t.admin.dashboard.productCount(products?.length ?? 0)}</span>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {!products || products.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground text-sm">{t.admin.dashboard.noProductsYet}</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">EGP {p.price.toLocaleString()} · {t.admin.dashboard.stock}: {p.stock ?? "—"}</p>
                  </div>
                  <button
                    onClick={() => openEditProduct(p)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                    title={t.admin.dashboard.editProduct}
                  >
                    <Edit2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delete Offers */}
        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Tag size={18} />
              </div>
              <h3 className="font-serif text-lg font-bold text-secondary">{t.admin.dashboard.deleteOffers}</h3>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">{t.admin.dashboard.offerCount(offers?.length ?? 0)}</span>
          </div>
          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {!offers || offers.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground text-sm">{t.admin.dashboard.noOffersYet}</p>
            ) : (
              offers.map((o) => (
                <div key={o.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary text-sm truncate">{o.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{o.discountPercent}% OFF</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${o.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {o.active ? t.admin.dashboard.active : t.admin.dashboard.inactive}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteOffer(o.id, o.title)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title={t.admin.dashboard.deleteOffers}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl my-auto p-8 relative shadow-2xl">
            <button onClick={closeEditProduct} className="absolute top-6 right-6 text-muted-foreground hover:text-secondary transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6">{t.admin.dashboard.editProduct}</h2>

            <form onSubmit={handleSubmit(onProductSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.admin.dashboard.productName}</label>
                <input {...register("name", { required: true })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">{t.admin.dashboard.price}</label>
                  <input type="number" step="0.01" {...register("price", { required: true })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">{t.admin.dashboard.originalPrice}</label>
                  <input type="number" step="0.01" {...register("originalPrice")} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">{t.admin.dashboard.stock}</label>
                  <input type="number" {...register("stock")} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary">{t.admin.dashboard.category}</label>
                  <input {...register("category")} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.admin.dashboard.description}</label>
                <textarea {...register("description")} rows={3} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeEditProduct} className="px-6 py-3 font-semibold text-secondary hover:bg-muted rounded-xl transition-colors">{t.admin.dashboard.cancel}</button>
                <button type="submit" disabled={updateProduct.isPending} className="btn-gold px-8 py-3 rounded-xl font-semibold disabled:opacity-50">
                  {updateProduct.isPending ? t.admin.dashboard.saving : t.admin.dashboard.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
