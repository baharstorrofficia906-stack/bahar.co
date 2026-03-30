import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingCart, Users, LogOut } from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";
import { useLanguage } from "@/hooks/use-language";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const logout = useAdminLogout();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin")
    });
  };

  const nav = [
    { name: t.admin.nav.dashboard, href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: t.admin.nav.products, href: "/admin/products", icon: <Package size={20} /> },
    { name: t.admin.nav.offers, href: "/admin/offers", icon: <Tag size={20} /> },
    { name: t.admin.nav.orders, href: "/admin/orders", icon: <ShoppingCart size={20} /> },
    { name: t.admin.nav.customers, href: "/admin/customers", icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-secondary text-white hidden md:flex flex-col fixed inset-y-0 left-0 z-10 shadow-xl">
        <div className="p-6 border-b border-white/10 text-center">
          <Link href="/" className="font-serif text-3xl font-bold text-white tracking-widest block">
            BAHAR
          </Link>
          <span className="text-primary text-xs uppercase tracking-widest font-bold mt-2 block">{t.admin.portal}</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {nav.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-primary text-secondary font-bold shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-white/70 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <LogOut size={20} />
            {t.admin.logout}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <h2 className="font-serif text-xl font-bold text-secondary capitalize">
            {location.split('/').pop()}
          </h2>
          <Link href="/" className="text-sm font-semibold text-primary hover:text-secondary transition-colors">
            {t.admin.viewStore} &rarr;
          </Link>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-background/50">
          {children}
        </main>
      </div>
    </div>
  );
}
