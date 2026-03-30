import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { Lock } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAdminLogin();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ data: { password } }, {
      onSuccess: () => setLocation("/admin/dashboard"),
      onError: () => setError(t.admin.login.invalidPassword)
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-secondary mb-2">BAHAR</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">{t.admin.login.secureAccess}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-bold p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-secondary">{t.admin.login.accessKey}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="btn-gold w-full py-4 text-sm tracking-widest mt-4"
          >
            {login.isPending ? t.admin.login.authenticating : t.admin.login.enterPortal}
          </button>
        </form>
      </div>
    </div>
  );
}
