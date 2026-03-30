import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetOrders, useUpdateOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

export default function ManageOrders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useGetOrders();
  const updateOrder = useUpdateOrder();
  const { t } = useLanguage();

  const handleStatusChange = (id: number, status: any) => {
    updateOrder.mutate({ id, data: { status } }, {
      onSuccess: () => queryClient.invalidateQueries()
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    canceled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary font-serif">{t.admin.orders.title}</h1>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <PlaneLoader text="Loading orders..." />
        ) : orders?.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed flex flex-col items-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-secondary">{t.admin.orders.noOrdersYet}</h3>
          </div>
        ) : orders?.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-border bg-background/30 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-lg text-secondary">Order #{order.id}</span>
                  <span className="text-sm text-muted-foreground">{new Date(order.createdAt || '').toLocaleString()}</span>
                </div>
                <h3 className="font-semibold text-secondary">{order.customerName}</h3>
                <p className="text-sm text-muted-foreground">{order.customerPhone} • {order.customerAddress}</p>
              </div>
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <span className="font-serif text-2xl font-bold text-primary">EGP {order.totalPrice.toLocaleString()}</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`text-sm font-bold uppercase rounded-full px-4 py-2 border outline-none cursor-pointer appearance-none ${statusColors[order.status]}`}
                >
                  <option value="pending">{t.admin.orders.pending}</option>
                  <option value="processing">{t.admin.orders.processing}</option>
                  <option value="shipped">{t.admin.orders.shipped}</option>
                  <option value="delivered">{t.admin.orders.delivered}</option>
                  <option value="canceled">{t.admin.orders.canceled}</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">{t.admin.orders.orderItems}</h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-secondary/10 text-secondary rounded flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                      <span className="font-medium">{item.productName}</span>
                    </div>
                    <span className="font-semibold">EGP {item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {order.notes && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-800 block mb-1">{t.admin.orders.customerNote}</span>
                  <p className="text-sm text-amber-900">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
