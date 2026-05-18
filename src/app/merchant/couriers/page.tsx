"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Star,
  Users,
  LayoutGrid,
  RefreshCcw,
  Activity,
  CircleDollarSign,
  Layers,
  Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAvailableCouriers,
  getPartnerCouriers,
  type CourierProfile,
} from "@/lib/couriers";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useI18n } from "@/intl";
import { motion, AnimatePresence } from "framer-motion";

function filterCouriers(list: CourierProfile[], query: string): CourierProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((courier) =>
    `${courier.company_name || ""} ${courier.email || ""} ${courier.company_address || ""} ${courier.phone_number || ""}`
      .toLowerCase()
      .includes(q)
  );
}

export default function CouriersPage() {
  const t = useI18n("couriers");
  const tNav = useI18n("nav_merchant");
  const { getValidAccessToken } = useAuth();
  const [availableCouriers, setAvailableCouriers] = useState<CourierProfile[]>([]);
  const [partnerCouriers, setPartnerCouriers] = useState<CourierProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draftQuery, setDraftQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error(t("errorAuth"));
        return;
      }

      const [available, partners] = await Promise.all([
        getAvailableCouriers(token),
        getPartnerCouriers(token).catch(() => []),
      ]);

      setAvailableCouriers(available || []);
      setPartnerCouriers(partners || []);
    } catch (err: unknown) {
      console.error("Failed to fetch couriers:", err);
      const message = err instanceof Error ? err.message : t("errorLoad");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applySearch = useCallback(() => {
    setAppliedQuery(draftQuery.trim());
  }, [draftQuery]);

  const filteredAvailable = useMemo(
    () => filterCouriers(availableCouriers, appliedQuery),
    [availableCouriers, appliedQuery]
  );
  const filteredPartners = useMemo(
    () => filterCouriers(partnerCouriers, appliedQuery),
    [partnerCouriers, appliedQuery]
  );

  const partnerIds = useMemo(
    () => new Set(partnerCouriers.map((p) => p.id)),
    [partnerCouriers]
  );

  const stats = [
    { 
      label: t("stats.network"), 
      value: availableCouriers.length, 
      color: "from-purple-500/10 to-indigo-500/10", 
      border: "border-purple-500/20", 
      textGlow: "text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]", 
      icon: <Activity className="h-5 w-5 text-purple-400" /> 
    },
    { 
      label: t("stats.partners"), 
      value: partnerCouriers.length, 
      color: "from-emerald-500/10 to-teal-500/10", 
      border: "border-emerald-500/20", 
      textGlow: "text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]", 
      icon: <ShieldCheck className="h-5 w-5 text-emerald-400" /> 
    },
    {
      label: t("stats.notPartnered"),
      value: Math.max(0, availableCouriers.length - partnerIds.size),
      color: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/20",
      textGlow: "text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
      icon: <Users className="h-5 w-5 text-blue-400" />
    },
  ];

  return (
    <div className="space-y-8 relative pb-12">
      {/* Decorative background glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top Glass Console Card */}
      <section className="rounded-[2.5rem] border border-border/40 bg-card/35 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 block w-fit mb-3">
              {tNav("couriers")}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-background/40 border border-border/30 rounded-full px-4 py-2 min-w-[240px] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 shadow-inner transition-all duration-300">
              <Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/40 h-8"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                }}
              />
            </div>

            <Button
              onClick={applySearch}
              className="rounded-full h-12 px-6 border border-primary/20 bg-primary/10 text-primary font-bold shadow-lg hover:bg-primary/20 transition-all duration-300 hover:scale-[1.03]"
            >
              {t("searchLabel")}
            </Button>
            
            <Button
              variant="ghost"
              onClick={fetchData}
              className="rounded-full h-12 w-12 border border-border/40 bg-background/30 backdrop-blur-md text-foreground/80 hover:bg-muted/80 shadow-sm"
              title="Refresh Network"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick statistics display */}
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
      </section>

      {/* Tabs list layout */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          <TabsList className="h-12 w-full max-w-md rounded-full border border-border/45 bg-background/30 backdrop-blur-xl p-1.5 sm:w-auto shadow-inner">
            <TabsTrigger
              value="all"
              className="flex-1 gap-2 rounded-full h-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-xs font-bold transition-all duration-300"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t("tabs.all")}
            </TabsTrigger>
            <TabsTrigger
              value="partners"
              className="flex-1 gap-2 rounded-full h-9 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-xs font-bold transition-all duration-300"
            >
              <Users className="h-3.5 w-3.5" />
              {t("tabs.partners")}
            </TabsTrigger>
          </TabsList>

          {appliedQuery ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 shadow-sm block w-fit">
              {t("filterActive", { query: appliedQuery })}
            </span>
          ) : null}
        </div>

        {/* Tab 1: Available Couriers */}
        <TabsContent value="all" className="mt-0 space-y-5 outline-none">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 px-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>{t("availableCouriers")}</span>
            </div>
            <span>{t("results", { count: String(filteredAvailable.length) })}</span>
          </div>

          {isLoading ? (
            <div className="rounded-[2.5rem] border border-border/30 bg-card/25 p-24 flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground/65">{t("connecting")}</span>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid gap-6 lg:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {filteredAvailable.map((courier) => (
                  <motion.div
                    key={courier.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <CourierCard
                      courier={courier}
                      isPartner={partnerIds.has(courier.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!isLoading && filteredAvailable.length === 0 && (
            <div className="rounded-[2.5rem] border border-dashed border-border/40 bg-card/20 p-12 text-center text-sm font-semibold text-muted-foreground/70">
              {appliedQuery ? t("noResultsSearch") : t("noResultsAvailable")}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Partner Couriers */}
        <TabsContent value="partners" className="mt-0 space-y-5 outline-none">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 px-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>{t("partnerCouriers")}</span>
            </div>
            <span>{t("results", { count: String(filteredPartners.length) })}</span>
          </div>

          {isLoading ? (
            <div className="rounded-[2.5rem] border border-border/30 bg-card/25 p-24 flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-semibold text-muted-foreground/65">{t("loadingPartners")}</span>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid gap-6 lg:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {filteredPartners.map((courier) => (
                  <motion.div
                    key={courier.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  >
                    <CourierCard courier={courier} isPartner />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!isLoading && filteredPartners.length === 0 && (
            <div className="rounded-[2.5rem] border border-dashed border-border/40 bg-card/20 p-12 text-center text-sm font-semibold text-muted-foreground/70">
              {appliedQuery ? t("noResultsSearch") : t("noResultsPartners")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourierCard({
  courier,
  isPartner,
}: {
  courier: CourierProfile;
  isPartner: boolean;
}) {
  const t = useI18n("couriers");
  const tDashboard = useI18n("merchantDashboard");
  const rating = typeof courier.rating_aggregate === "number" ? courier.rating_aggregate : 0;
  const ratingCount = typeof courier.rating_count === "number" ? courier.rating_count : 0;

  const partnerBadgeStyle = isPartner 
    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.08)]"
    : "bg-blue-500/10 border-blue-500/25 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.08)]";

  const partnerDot = isPartner
    ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
    : "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse";

  return (
    <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/75 backdrop-blur-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.22)] flex flex-col justify-between min-h-[280px] cursor-pointer relative overflow-hidden transition-all duration-300 group hover:border-border/60 hover:-translate-y-1">
      {/* Decorative Aura hover glow inside card */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-[35px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header Area */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
              {courier.company_name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/75 font-semibold">
              <span>{courier.email || t("card.privateEmail")}</span>
            </div>
          </div>
          
          {/* Glass Partner Badge */}
          <Badge className={`border ${partnerBadgeStyle} rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold shadow-sm shrink-0`}>
            <span className={`h-1.5 w-1.5 rounded-full ${partnerDot}`} />
            {isPartner ? t("card.partnerBadge") : t("card.availableBadge")}
          </Badge>
        </div>

        {/* Separator */}
        <div className="border-t border-border/20 my-5" />

        {/* Content details grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Column 1: Fees and limits */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/55 flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3 text-primary/70" />
              {t("card.feesLimits")}
            </span>
            <div className="space-y-1.5 text-sm font-semibold text-foreground/90 pl-1">
              <div className="flex justify-between items-center border-b border-border/10 pb-1">
                <span className="text-muted-foreground/60 text-xs">{t("card.basePrice")}</span>
                <span>{tDashboard("latestDeparture.currency")}{Number(courier.base_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/10 pb-1">
                <span className="text-muted-foreground/60 text-xs">{t("card.distance")}</span>
                <span>{tDashboard("latestDeparture.currency")}{Number(courier.distance_rate).toFixed(2)}{t("card.perKm")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground/60 text-xs">{t("card.weight")}</span>
                <span>{tDashboard("latestDeparture.currency")}{Number(courier.weight_rate).toFixed(2)}{t("card.perKg")}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Capacity & Web */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/55 flex items-center gap-1">
                <Layers className="h-3 w-3 text-emerald-400" />
                {t("card.capacity")}
              </span>
              <p className="text-sm font-extrabold text-foreground pl-1">
                {t("card.maxLoad", { weight: String(courier.max_weight) })}
              </p>
            </div>

            {courier.website_url && (
              <a
                href={courier.website_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-foreground/80 pl-1 py-1 mt-auto hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {t("card.visitSite")}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Card Action footer */}
      <div className="mt-6 border-t border-border/20 pt-4 flex justify-between items-center">
        {/* Rating stars only if available in DB */}
        <div className="flex items-center gap-1.5 min-h-[1.5rem]">
          {ratingCount > 0 ? (
            <>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shadow-sm" />
              <span className="text-xs font-black text-foreground">{rating.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-muted-foreground/60">({ratingCount})</span>
            </>
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground/40 italic">No ratings yet</span>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          className="rounded-full px-5 border-border/40 hover:bg-primary hover:text-primary-foreground shadow-sm text-xs font-bold transition-all duration-300"
        >
          <Link href={`/merchant/couriers/${courier.id}`}>
            {t("card.viewDetails")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
