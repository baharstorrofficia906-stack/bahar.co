import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useGetCustomers,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Edit2, Trash2, X, Users, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export default function ManageCustomers() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: customers, isLoading } = useGetCustomers();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [editingId, setEditingId] = useState<number | null>(null);
  const { register, handleSubmit, reset } = useForm<CustomerForm>();

  const openEdit = (c: any) => {
    setEditingId(c.id);
    reset({ name: c.name, phone: c.phone, email: c.email || "", address: c.address || "" });
  };

  const closeEdit = () => {
    setEditingId(null);
    reset();
  };

  const onSubmit = (data: CustomerForm) => {
    if (!editingId) return;
    updateCustomer.mutate(
      { id: editingId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          closeEdit();
        },
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(t.admin.customers.deleteConfirm(name))) {
      deleteCustomer.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries() });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-serif">{t.admin.customers.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.admin.customers.registeredCount(customers?.length ?? 0)}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
          <Users size={16} />
          <span className="font-semibold text-sm">{t.admin.customers.totalCount(customers?.length ?? 0)}</span>
        </div>
      </div>

      {/* Customer Cards Grid */}
      {isLoading ? (
        <PlaneLoader text="Loading customers..." />
      ) : customers?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-lg">{t.admin.customers.noCustomers}</p>
          <p className="text-sm mt-1">{t.admin.customers.noCustomersSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers?.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center font-bold font-serif text-xl text-secondary">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.admin.customers.joined} {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.admin.customers.editCustomer}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-sm">
                {c.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={13} className="text-primary shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={13} className="text-primary shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-3 pt-2 border-t border-border">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-secondary">{(c as any).totalOrders ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{t.admin.customers.orders}</p>
                </div>
                <div className="w-px bg-border" />
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-primary">
                    EGP {((c as any).totalSpent ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.admin.customers.totalSpent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl">
            <button
              onClick={closeEdit}
              className="absolute top-6 right-6 text-muted-foreground hover:text-secondary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6">{t.admin.customers.editCustomer}</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.admin.customers.fullName}</label>
                <input
                  {...register("name", { required: true })}
                  className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder={t.admin.customers.namePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.admin.customers.phoneNumber}</label>
                <input
                  {...register("phone", { required: true })}
                  className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder={t.admin.customers.phonePlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.admin.customers.emailAddress}</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  placeholder={t.admin.customers.emailPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary">{t.admin.customers.deliveryAddress}</label>
                <textarea
                  {...register("address")}
                  rows={3}
                  className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                  placeholder={t.admin.customers.addressPlaceholder}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-6 py-3 font-semibold text-secondary hover:bg-muted rounded-xl transition-colors"
                >
                  {t.admin.customers.cancel}
                </button>
                <button
                  type="submit"
                  disabled={updateCustomer.isPending}
                  className="btn-gold px-8 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {updateCustomer.isPending ? t.admin.customers.saving : t.admin.customers.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
