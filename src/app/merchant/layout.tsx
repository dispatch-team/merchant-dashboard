"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  List,
  Truck,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { buildMerchantLogoProxyUrl } from "@/lib/merchantProfile";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/merchant", icon: Package },
  { label: "Shipments", href: "/merchant/shipments", icon: List },
  { label: "Couriers", href: "/merchant/couriers", icon: Truck },
  { label: "API Keys", href: "/merchant/api-keys", icon: Key },
];

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, user, getValidAccessToken } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const res = await fetch("/api/merchant/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setLogoUrl(buildMerchantLogoProxyUrl(data.company_logo_id, token));
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        console.error("Layout: Failed to load profile", err);
      }
    };
    fetchProfile();
  }, [getValidAccessToken]);

  return (
    <AuthGuard loginPath="/login/merchant" allowedRoles={["merchant"]}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary/20">
        <div className="absolute inset-0 z-0 bg-radial-gradient from-background to-muted/20 pointer-events-none" />
        
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 88 : 280 }}
          className="relative z-20 flex flex-col border-r border-border/40 bg-card/60 backdrop-blur-2xl transition-shadow duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)] h-full"
        >
          {/* Header */}
          <div className="flex items-center p-6 h-24 mb-2">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  key="full-logo"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center overflow-hidden w-full"
                >
                  <img src={dispatchLogo.src} alt="Dispatch Logo" className="h-20 w-auto object-contain drop-shadow-[0_0_15px_hsl(270,70%,60%,0.2)]" />
                </motion.div>
              ) : (
                <motion.div
                  key="icon-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex justify-center"
                >
                  <img src={dispatchLogo.src} alt="Dispatch Logo" className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_0_15px_hsl(270,70%,60%,0.2)]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background shadow-md hover:border-primary/50 hover:text-primary transition-all z-50 text-muted-foreground"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* Nav Items */}
          <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto hidden-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/merchant" && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center rounded-2xl p-3 transition-all duration-300 cursor-pointer overflow-hidden relative",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border border-primary/20"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", isCollapsed ? "mx-auto" : "mr-4")} />
                    {!isCollapsed && (
                      <span className="text-sm font-semibold tracking-wide truncate">{item.label}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/30 mt-auto flex flex-col gap-2 bg-gradient-to-t from-background/40 to-transparent">
            <Link href="/merchant/profile">
              <div className={cn(
                 "flex items-center rounded-2xl p-3 transition-all duration-300 cursor-pointer",
                 pathname?.includes("/profile") ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
              )}>
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  {logoUrl ? (
                    <div className={cn("rounded-xl border border-border/50 overflow-hidden bg-background/50 transition-all duration-300", isCollapsed ? "h-10 w-10" : "h-10 w-10 mr-4")}>
                      <img src={logoUrl} alt="Business Logo" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <User className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300", isCollapsed ? "mx-auto" : "mr-4")} />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold tracking-wide text-foreground truncate">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}` : (user?.name || "Profile")}
                    </span>
                    <span className="text-[11px] opacity-60 truncate">{profile?.company_name || user?.email || "Merchant"}</span>
                  </div>
                )}
              </div>
            </Link>
            
            <div className="flex items-center rounded-2xl p-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-300 cursor-pointer border border-transparent">
              <Settings className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300", isCollapsed ? "mx-auto" : "mr-4")} />
              {!isCollapsed && <span className="text-sm font-medium tracking-wide">System Settings</span>}
            </div>

            <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3 mx-auto" : "flex-row justify-between px-3 py-1")}>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <button
              onClick={() => logout()}
              className="group flex w-full items-center rounded-2xl p-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 border border-transparent"
            >
              <LogOut className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", isCollapsed ? "mx-auto" : "mr-4")} />
              {!isCollapsed && <span className="text-sm font-medium tracking-wide">Log Out</span>}
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="relative z-10 flex-1 overflow-y-auto w-full">
          <div className="h-full w-full p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
            <motion.div
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.4, ease: "easeOut" }}
               className="h-full w-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
