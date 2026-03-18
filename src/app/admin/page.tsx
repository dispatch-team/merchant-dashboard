"use client";

import { useRouter } from "next/navigation";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/intl";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const t = useI18n("dashboards");
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login/admin");
  };

  return (
    <AuthGuard allowedRoles={["admin"]} loginPath="/login/admin">
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-accent/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-success/10 rounded-full blur-[100px]" />
        </div>

        {/* Top controls */}
        <div className="absolute top-5 right-5 flex items-center gap-0.5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="relative z-10 w-full max-w-md bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Shield className="h-10 w-10 text-accent" />
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight text-foreground">
            {t("admin.title")}
          </h1>
          <p className="text-muted-foreground mb-2 text-sm leading-relaxed">
            {t("admin.welcome")}
          </p>
          {user && (
            <p className="text-xs text-muted-foreground/70 mb-10">
              Signed in as {user.name} ({user.email})
            </p>
          )}

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full rounded-2xl h-12 border-border/60 hover:border-destructive/40 group"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-destructive transition-colors" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
