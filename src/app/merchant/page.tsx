"use client";

import { useRouter } from "next/navigation";
import {
  Package,
  LogOut,
  BarChart3,
  Truck,
  ShoppingBag,
  Clock,
  TrendingUp,
  ChevronRight,
  Bell,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import dispatchLogo from "@/assets/dispatch-logo.png";

const STAT_CARDS = [
  {
    label: "Active Shipments",
    value: "—",
    icon: Truck,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "Total Orders",
    value: "—",
    icon: ShoppingBag,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    label: "Pending Review",
    value: "—",
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    label: "Delivery Rate",
    value: "—",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

const QUICK_ACTIONS = [
  { label: "New Shipment", icon: Package, desc: "Create and dispatch a new order" },
  { label: "Browse Couriers", icon: Truck, desc: "Compare and select courier partners" },
  { label: "View Analytics", icon: BarChart3, desc: "Track performance and trends" },
];

export default function MerchantDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    router.replace("/");
  };

  const initials = user
    ? `${user.given_name?.[0] ?? ""}${user.family_name?.[0] ?? ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "M";

  return (
    <AuthGuard allowedRoles={["merchant"]} loginPath="/login/merchant">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-accent/8 rounded-full blur-[100px]" />
        </div>

        {/* Top nav */}
        <header className="relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={dispatchLogo.src} alt="Dispatch" className="h-7 w-auto" />
              <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-widest hidden sm:block">
                Merchant
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg">
                <Settings className="h-4 w-4" />
              </Button>
              <LanguageSwitcher />
              <ThemeToggle />
              <div className="w-px h-5 bg-border/40 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive rounded-lg h-8"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">

          {/* Welcome hero */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-base shadow-inner flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Welcome back</p>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {user?.name || user?.email || "Merchant"}
                </h1>
                {user?.email && (
                  <p className="text-xs text-muted-foreground/60">{user.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active account
              </span>
            </div>
          </section>

          {/* Stat cards */}
          <section>
            <h2 className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider mb-4">Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {STAT_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`rounded-2xl border p-4 ${card.bg} flex flex-col gap-3`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-background/30 flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <h2 className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="group text-left rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground mt-1 flex-shrink-0 transition-colors" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Account info */}
          <section>
            <h2 className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider mb-4">Account</h2>
            <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm divide-y divide-border/40">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Merchant ID</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{user?.sub?.slice(0, 8) ?? "—"}</span>
              </div>
            </div>
          </section>

        </main>
      </div>
    </AuthGuard>
  );
}
