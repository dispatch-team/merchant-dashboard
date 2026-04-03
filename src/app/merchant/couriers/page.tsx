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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAvailableCouriers,
  getPartnerCouriers,
  type CourierProfile,
} from "@/lib/couriers";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

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
        toast.error("Unable to authenticate courier network");
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
      const message = err instanceof Error ? err.message : "Failed to load couriers";
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
    { label: "Couriers in network", value: availableCouriers.length },
    { label: "Your partners", value: partnerCouriers.length },
    {
      label: "Not partnered yet",
      value: Math.max(0, availableCouriers.length - partnerIds.size),
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground/80">
              Couriers
            </p>
            <h1 className="text-3xl font-semibold">Courier partnerships</h1>
            <p className="text-sm text-muted-foreground">
              Discover delivery networks and manage partners across Addis Ababa.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-2xl border border-border/30 bg-background/60 backdrop-blur-md px-2 py-1.5">
              <Input
                placeholder="Search couriers…"
                className="h-9 min-w-[180px] max-w-[240px] border-0 bg-transparent text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0"
                value={draftQuery}
                onChange={(e) => setDraftQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applySearch();
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
                aria-label="Search couriers"
                onClick={applySearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-md p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <Tabs defaultValue="all" className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-11 w-full max-w-md rounded-2xl border border-border/40 bg-background/50 p-1 sm:w-auto">
            <TabsTrigger
              value="all"
              className="flex-1 gap-2 rounded-xl data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <LayoutGrid className="h-4 w-4" />
              All couriers
            </TabsTrigger>
            <TabsTrigger
              value="partners"
              className="flex-1 gap-2 rounded-xl data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              Partners
            </TabsTrigger>
          </TabsList>
          {appliedQuery ? (
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
              Filter: &ldquo;{appliedQuery}&rdquo;
            </p>
          ) : null}
        </div>

        <TabsContent value="all" className="mt-0 space-y-5 outline-none">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span>Available couriers</span>
            </div>
            <span>{filteredAvailable.length} results</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-border/30 bg-card/60 p-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Connecting to courier network...
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredAvailable.map((courier) => (
                <CourierCard
                  key={courier.id}
                  courier={courier}
                  isPartner={partnerIds.has(courier.id)}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredAvailable.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/40 bg-card/60 p-6 text-sm text-muted-foreground">
              {appliedQuery
                ? "No couriers match your search. Change the query and press the search button."
                : "No couriers are available right now."}
            </div>
          )}
        </TabsContent>

        <TabsContent value="partners" className="mt-0 space-y-5 outline-none">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Partner couriers</span>
            </div>
            <span>{filteredPartners.length} results</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-border/30 bg-card/60 p-12 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Loading partners...
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {filteredPartners.map((courier) => (
                <CourierCard key={courier.id} courier={courier} isPartner />
              ))}
            </div>
          )}

          {!isLoading && filteredPartners.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/40 bg-card/60 p-6 text-sm text-muted-foreground">
              {appliedQuery
                ? "No partners match your search. Change the query and press search."
                : "You have not added any courier partners yet. Browse all couriers to add one."}
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
  const rating =
    typeof courier.rating_aggregate === "number" ? courier.rating_aggregate : 0;

  return (
    <Card className="group flex flex-col border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-black/5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">{courier.company_name}</CardTitle>
          <Badge
            variant={isPartner ? "default" : "outline"}
            className="shrink-0 text-[10px] uppercase tracking-[0.3em]"
          >
            {isPartner ? "Partner" : "Available"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-4 w-4 text-amber-400" />
          <span>{rating.toFixed(1)} rating</span>
          <span className="text-muted-foreground/60">•</span>
          <span>{courier.email || "Private"}</span>
        </div>
      </CardHeader>

      <CardContent className="grid flex-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <CardDescription className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80">
            Fees & limits
          </CardDescription>
          <p className="text-sm text-foreground">
            Base price: ${Number(courier.base_price).toFixed(2)}
          </p>
          <p className="text-sm text-foreground">
            Distance: ${Number(courier.distance_rate).toFixed(2)}/km
          </p>
          <p className="text-sm text-foreground">
            Weight: ${Number(courier.weight_rate).toFixed(2)}/kg
          </p>
        </div>
        <div className="space-y-2">
          <CardDescription className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80">
            Capacity
          </CardDescription>
          <p className="text-sm text-foreground">{courier.max_weight} kg max load</p>
          {courier.website_url && (
            <a
              href={courier.website_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-foreground"
            >
              Visit site
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto border-t border-border/30 pt-4">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="ml-auto rounded-xl border-border/50 font-semibold"
        >
          <Link href={`/merchant/couriers/${courier.id}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
