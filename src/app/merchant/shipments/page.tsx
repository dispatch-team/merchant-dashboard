"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  List,
  RefreshCcw,
  Plus,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button as UiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getShipments, ShipmentListResponse, ShipmentResponse } from "@/lib/shipments";
import { useI18n } from "@/intl";
import { EmptyState } from "@/components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

const pageSize = 10;

function getStatusDetails(status?: string) {
  const norm = (status || "pending").toLowerCase();
  
  if (norm.includes("delivered")) {
    return {
      glow: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
      badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      dot: "bg-emerald-400"
    };
  }
  if (norm.includes("cancelled") || norm.includes("failed")) {
    return {
      glow: "bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.4)]",
      badgeBg: "bg-destructive/10 border-destructive/20 text-destructive",
      dot: "bg-destructive"
    };
  }
  if (norm.includes("in_transit") || norm.includes("transit") || norm.includes("picked_up")) {
    return {
      glow: "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
      badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      dot: "bg-amber-400 animate-pulse"
    };
  }
  return {
    glow: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]",
    badgeBg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    dot: "bg-blue-400 animate-pulse"
  };
}

function getTranslatedStatus(status: string | undefined, t: any) {
  if (!status) return t("statuses.pending");
  const norm = status.toLowerCase();
  const key = `statuses.${norm}`;
  const translated = t(key as any);
  if (translated === key) {
    return norm
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return translated;
}

export default function ShipmentsListPage() {
  const t = useI18n("shipments");
  const tNav = useI18n("nav_merchant");
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<ShipmentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchShipments = useCallback(
    async (currentPage: number) => {
      setIsLoading(true);
      try {
        const token = await getValidAccessToken();
        if (!token || !user?.sub) {
          setError("Missing authentication context");
          return;
        }

        const response = await getShipments(token, {
          page: currentPage,
          page_size: pageSize,
          merchant_user_id: user.sub,
        });
        setData(response);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load shipments:", err);
        setError(err.message || "Unable to load shipments");
      } finally {
        setIsLoading(false);
      }
    },
    [getValidAccessToken, user?.sub]
  );

  useEffect(() => {
    fetchShipments(page);
  }, [page, fetchShipments]);

  const filteredShipments = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data.shipments;
    return data.shipments.filter((shipment) =>
      (shipment.code || shipment.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalPages = data ? Math.max(1, Math.ceil((data.total || 0) / (data.page_size || pageSize))) : 1;

  const stats = useMemo(() => {
    if (!data) {
      return [
        { label: t("stats.total"), value: "—", color: "from-purple-500/10 to-indigo-500/10", border: "border-purple-500/20", textGlow: "text-purple-400", icon: <Package className="h-5 w-5 text-purple-400" /> },
        { label: t("stats.active"), value: "—", color: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20", textGlow: "text-amber-400", icon: <TrendingUp className="h-5 w-5 text-amber-400" /> },
        { label: t("stats.pending"), value: "—", color: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20", textGlow: "text-blue-400", icon: <Clock className="h-5 w-5 text-blue-400" /> },
      ];
    }
    const total = data.total || 0;
    const active = data.shipments.filter(s => s.status && !["delivered", "cancelled", "failed"].includes(s.status.toLowerCase())).length;
    const pending = data.shipments.filter(s => s.status?.toLowerCase() === "pending").length;

    return [
      { label: t("stats.total"), value: total, color: "from-purple-500/10 to-indigo-500/10", border: "border-purple-500/25", textGlow: "text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]", icon: <Package className="h-5 w-5 text-purple-400" /> },
      { label: t("stats.active"), value: active, color: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/25", textGlow: "text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]", icon: <TrendingUp className="h-5 w-5 text-amber-400" /> },
      { label: t("stats.pending"), value: pending, color: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/25", textGlow: "text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]", icon: <Clock className="h-5 w-5 text-blue-400" /> },
    ];
  }, [data, t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-8 relative pb-12">
      {/* Background soft ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main glass controls dashboard block */}
      <section className="rounded-[2.5rem] border border-border/40 bg-card/35 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 block w-fit mb-3">
              {t("overview")}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <UiButton
              variant="outline"
              onClick={() => router.push("/merchant/shipments/new")}
              className="gap-2 rounded-full h-12 px-6 border-primary/20 hover:bg-primary/10 text-primary font-bold shadow-lg shadow-primary/5 transition-all duration-300 hover:scale-[1.03]"
            >
              <Plus className="h-4 w-4" />
              {t("newShipment")}
            </UiButton>
            <UiButton 
              variant="ghost" 
              className="gap-2 rounded-full h-12 w-12 border border-border/40 bg-background/30 backdrop-blur-md text-foreground/80 hover:bg-muted/80 shadow-sm" 
              onClick={() => fetchShipments(page)}
              title={t("refresh")}
            >
              <RefreshCcw className="h-4 w-4" />
            </UiButton>
          </div>
        </div>

        {/* Modular Metrics showcase */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 relative z-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: "spring" }}
              className={`rounded-3xl border ${stat.border} bg-gradient-to-br ${stat.color} backdrop-blur-xl p-5 shadow-sm flex items-center justify-between group hover:border-foreground/20 hover:shadow-md transition-all duration-300`}
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/75 block mb-1">
                  {stat.label}
                </span>
                <p className={`text-3xl font-black ${stat.textGlow} tracking-tight`}>{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-background/50 border border-border/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Filtering bar */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10 border-t border-border/20 pt-6">
          <div className="flex items-center gap-3 bg-background/40 border border-border/30 rounded-full px-4 py-2 w-full md:max-w-md transition-all duration-300 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 shadow-inner">
            <Search className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
            <Input
              placeholder={t("searchPlaceholder")}
              className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/40 h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-background/30 border border-border/30 rounded-full w-fit">
            <Filter className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-xs font-semibold text-muted-foreground/80">Filters active by latest departure</span>
          </div>
        </div>
      </section>

      {/* Shipment cards responsive list layout */}
      <section className="space-y-5">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 px-2">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-primary" />
            <span>Active Shipment Ledger</span>
          </div>
          <span>
            {t("pageOf", { current: page.toString(), total: totalPages.toString() })}
          </span>
        </div>

        {error && (
          <div className="rounded-3xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive flex items-center gap-3 backdrop-blur-md">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Custom Glassmorphic Rows */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-[2.5rem] border border-border/30 bg-card/25 p-20 flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground/65">{t("loading")}</span>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="rounded-[2.5rem] border border-border/30 bg-card/20 p-8">
              <EmptyState
                icon={<Package className="text-muted-foreground/45" />}
                title={t("empty")}
                description={t("emptyDesc")}
                actionLabel={t("newShipment")}
                onAction={() => router.push("/merchant/shipments/new")}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredShipments.map((shipment) => {
                  const statDetails = getStatusDetails(shipment.status);
                  
                  return (
                    <motion.div
                      key={shipment.code ?? shipment.id}
                      variants={itemVariants}
                      exit={{ opacity: 0, x: -20 }}
                      layout
                      onClick={() =>
                        router.push(`/merchant/shipments/${encodeURIComponent(shipment.code ?? shipment.id)}`)
                      }
                      className="rounded-[1.75rem] border border-border/35 bg-card/40 hover:bg-card/75 backdrop-blur-xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.22)] grid grid-cols-1 md:grid-cols-12 items-center gap-5 cursor-pointer relative overflow-hidden transition-all duration-300 group hover:border-border/60 hover:-translate-y-0.5"
                    >
                      {/* Left color glow accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statDetails.glow}`} />

                      {/* Code Column */}
                      <div className="md:col-span-3 flex flex-col gap-1.5 md:pl-3">
                        <span className="font-mono text-xs font-black uppercase tracking-widest text-foreground px-3 py-1 bg-background/50 border border-border/40 rounded-full shadow-inner w-fit">
                          {shipment.code || shipment.id}
                        </span>
                        {shipment.created_at && (
                          <span className="text-[10px] font-semibold text-muted-foreground/60 flex items-center gap-1.5 pl-1.5">
                            <Calendar className="h-3 w-3" />
                            {isClient ? new Date(shipment.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : "—"}
                          </span>
                        )}
                      </div>

                      {/* Aligned Route Column */}
                      <div className="md:col-span-6 grid grid-cols-9 items-center gap-3">
                        {/* Origin info */}
                        <div className="col-span-4 min-w-0 flex items-center gap-2.5">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-background/40 border border-border/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-inner">
                            O
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/50 block">Pickup</span>
                            <span className="text-xs font-semibold text-foreground truncate block">{shipment.start_address}</span>
                          </div>
                        </div>

                        {/* Connection arrow */}
                        <div className="col-span-1 flex justify-center text-center">
                          <ArrowRight className="h-4 w-4 text-muted-foreground/35 group-hover:text-primary transition-colors duration-300" />
                        </div>

                        {/* Destination info */}
                        <div className="col-span-4 min-w-0 flex items-center gap-2.5">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shadow-inner animate-pulse">
                            D
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/50 block">Destination</span>
                            <span className="text-xs font-bold text-foreground truncate block">{shipment.end_address}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Column */}
                      <div className="md:col-span-2 flex justify-start md:justify-center border-t border-border/20 md:border-t-0 pt-4 md:pt-0">
                        <Badge className={`capitalize border ${statDetails.badgeBg} rounded-full px-3.5 py-1 flex items-center gap-1.5 text-xs font-bold shadow-sm`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statDetails.dot}`} />
                          {getTranslatedStatus(shipment.status, t)}
                        </Badge>
                      </div>

                      {/* Actions Column */}
                      <div className="md:col-span-1 flex justify-end">
                        <div className="w-10 h-10 rounded-full border border-border/40 bg-background/40 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 group-hover:bg-primary/5 shadow-inner transition-all duration-300 group-hover:translate-x-1">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Dynamic Glass pagination bar */}
        {!isLoading && filteredShipments.length > 0 && (
          <div className="rounded-[1.75rem] border border-border/30 bg-card/20 backdrop-blur-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs font-semibold text-muted-foreground/75 px-2">
              {t("showing", { count: filteredShipments.length.toString(), total: (data?.total ?? 0).toString() })}
            </div>
            
            <div className="flex items-center gap-2">
              <UiButton
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage((prev) => Math.max(1, prev - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full px-5 border-border/40 bg-card/30 shadow-sm text-xs font-bold disabled:opacity-40"
              >
                {t("prev")}
              </UiButton>
              <div className="h-8 px-3.5 rounded-full bg-background/50 border border-border/30 flex items-center justify-center text-xs font-black text-foreground shadow-inner">
                {page} / {totalPages}
              </div>
              <UiButton
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((prev) => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full px-5 border-border/40 bg-card/30 shadow-sm text-xs font-bold disabled:opacity-40"
              >
                {t("next")}
              </UiButton>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
