"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/context/AuthContext";
import { getShipments, ShipmentListResponse, ShipmentResponse } from "@/lib/shipments";
import {
  Loader2,
  RefreshCcw,
  Package,
  Truck,
  List,
  BarChart3,
  TrendingUp,
  Clock,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { buildMerchantLogoProxyUrl } from "@/lib/merchantProfile";

const QUICK_ACTIONS = [
  {
    label: "New Shipment",
    desc: "Create and dispatch shipments in seconds",
    path: "/merchant/shipments/new",
    icon: Package,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Shipments",
    desc: "View tracking and delivery reports",
    path: "/merchant/shipments",
    icon: List,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: "Couriers",
    desc: "Compare courier partners and fees",
    path: "/merchant/couriers",
    icon: Truck,
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const STAT_CONFIGS = [
  { title: "Active shipments", icon: BarChart3 },
  { title: "Total created", icon: Package },
  { title: "Pending review", icon: Clock },
  { title: "Delivery rate", icon: TrendingUp },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function MerchantDashboard() {
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();
  const [shipments, setShipments] = useState<ShipmentListResponse | null>(null);
  const [latestShipment, setLatestShipment] = useState<ShipmentResponse | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.error("Failed to load profile", err);
    }
  };

  const fetchShipments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token || !user?.sub) {
        setError("Missing authentication token");
        return;
      }

      const response = await getShipments(token, {
        page: 1,
        page_size: 5,
        merchant_user_id: user.sub,
      });
      setShipments(response);
      setLatestShipment(response.shipments?.[0] ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load shipment overview");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchShipments(), fetchProfile()]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchShipments();
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.sub]);

  const stats = useMemo(() => {
    if (!shipments) {
      return STAT_CONFIGS.map((stat) => ({
        ...stat,
        value: "—",
        accent: "neutral" as const,
      }));
    }

    const total = shipments.total ?? 0;
    const active = shipments.shipments.filter(
      (shipment) =>
        shipment.status &&
        !["delivered", "cancelled", "failed"].includes(shipment.status.toLowerCase())
    ).length;
    const pending = shipments.shipments.filter(
      (shipment) => shipment.status?.toLowerCase() === "pending"
    ).length;
    const delivered = shipments.shipments.filter(
      (shipment) => shipment.status?.toLowerCase() === "delivered"
    ).length;
    const deliveryRate =
      total > 0 ? Math.round((delivered / total) * 100) : 0;

    return [
      { ...STAT_CONFIGS[0], value: active, accent: "positive" as const },
      { ...STAT_CONFIGS[1], value: total, accent: "neutral" as const },
      { ...STAT_CONFIGS[2], value: pending, accent: "warning" as const },
      { ...STAT_CONFIGS[3], value: `${deliveryRate}%`, accent: "positive" as const },
    ];
  }, [shipments]);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleString() : "—";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header Section */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/40 backdrop-blur-2xl p-8 lg:p-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Live Overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl bg-background/50 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={profile?.company_name || "Company Logo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={dispatchLogo.src}
                    alt="Dispatch"
                    className="h-10 w-10 object-contain drop-shadow-md"
                  />
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Welcome back, {user?.name || user?.preferred_username || "Merchant"} 
                  {profile?.company_name && <span className="opacity-80"> at {profile.company_name}</span>}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">
                  Here is what's happening with your logistics operations today.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-2xl h-11 px-5 shadow-sm border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
            onClick={refreshDashboard}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-semibold tracking-wide">Sync Data</span>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4 relative z-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
            >
              <StatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                changeType={stat.accent === "positive" ? "positive" : stat.accent === "warning" ? "negative" : "neutral"}
                change={stat.accent === "warning" ? "Action needed" : undefined}
                className="bg-background/40 border border-border/30 shadow-none hover:bg-background/60 transition-colors backdrop-blur-xl rounded-3xl"
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Main Content Grid */}
      <motion.section variants={itemVariants} className="grid gap-8 lg:grid-cols-[1fr,360px]">
        
        {/* Latest Shipment Panel */}
        <div className="rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-xl p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/70 mb-1">Fulfillment Status</p>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Latest Departure</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl text-xs font-semibold border-border/40 hover:bg-background/50 hover:border-border/80"
              onClick={() => router.push("/merchant/shipments")}
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              <p className="text-sm font-medium tracking-wide">Retrieving shipment data...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-center max-w-sm">
                <p className="text-sm text-destructive font-medium mb-3">{error}</p>
                <Button variant="outline" size="sm" onClick={refreshDashboard} className="rounded-xl border-destructive/20 hover:bg-destructive/20 text-destructive">
                  Retry Connection
                </Button>
              </div>
            </div>
          ) : latestShipment ? (
            <div className="space-y-6 relative z-10">
              <div className="flex flex-wrap items-center gap-3 bg-background/40 p-3 rounded-2xl border border-border/30 w-fit backdrop-blur-md">
                <Badge
                  className="uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-xl"
                  variant={latestShipment.status?.toLowerCase() === 'pending' ? 'secondary' : 'default'}
                >
                  {latestShipment.status || "—"}
                </Badge>
                <div className="w-px h-4 bg-border/50" />
                <p className="text-[11px] font-medium text-muted-foreground tracking-wide">
                  Created {formatDate(latestShipment.created_at)}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[2rem] border border-border/30 bg-background/50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2">Tracking ID</p>
                  <p className="text-xl font-mono font-bold text-foreground tracking-tight">{latestShipment.code || latestShipment.id}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-2 line-clamp-1">{latestShipment.description || "No description provided"}</p>
                </div>

                <div className="rounded-[2rem] border border-border/30 bg-background/50 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-3">Route</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-border" />
                      <p className="text-sm font-medium text-muted-foreground truncate">{latestShipment.start_address || "Origin unset"}</p>
                    </div>
                    <div className="w-0.5 h-3 bg-border/50 ml-1" />
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                      <p className="text-sm font-bold text-foreground truncate">{latestShipment.end_address || "Destination unset"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-border/30 bg-background/30 p-5 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Carrier</p>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">{latestShipment.courier_company?.company_name || "Unassigned"}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1">{latestShipment.courier_company?.phone_number || "—"}</p>
                </div>
                
                <div className="rounded-3xl border border-border/30 bg-background/30 p-5 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Details</p>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">{latestShipment.weight_kg ? `${latestShipment.weight_kg} kg` : "Weight unspecified"}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{latestShipment.dimensions || "Dimensions N/A"}</p>
                </div>

                <div className="rounded-3xl border border-border/30 bg-background/30 p-5 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Contents</p>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">{(latestShipment.items || []).join(", ") || "No items listed"}</p>
                  <p className="text-xs font-medium text-primary mt-1">Fee: ₦{latestShipment.total_fee?.toFixed(2) ?? "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[300px] bg-background/20 rounded-[2rem] border border-dashed border-border/40 p-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-foreground font-semibold mb-2">No Active Shipments</p>
              <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                Create your first shipment to start tracking deliveries here.
              </p>
              <Button onClick={() => router.push('/merchant/shipments/new')} className="mt-6 rounded-xl shadow-md h-10 px-6 font-semibold">
                Create Shipment
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6 rounded-[2.5rem] border border-border/40 bg-card/30 backdrop-blur-xl p-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground/70 mb-1">Shortcuts</p>
            <h3 className="text-xl font-bold text-foreground tracking-tight">Quick Actions</h3>
          </div>
          
          <div className="flex flex-col gap-4 mt-8">
            {QUICK_ACTIONS.map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  key={action.label}
                  onClick={() => router.push(action.path)}
                  className="group relative flex items-center justify-between rounded-3xl border border-border/30 bg-background/50 p-4 text-left transition-all hover:border-border/60 shadow-sm hover:shadow-md overflow-hidden"
                >
                  <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border border-border/20 shadow-inner", action.bg, action.color)}>
                      <ActionIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground tracking-wide">{action.label}</p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/40 mr-1 shadow-sm group-hover:bg-foreground group-hover:text-background transition-colors relative z-10">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

      </motion.section>
    </motion.div>
  );
}
