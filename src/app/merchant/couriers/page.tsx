"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAvailableCouriers, getPartnerCouriers, CourierProfile } from "@/lib/couriers";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CouriersPage() {
  const { getValidAccessToken } = useAuth();
  const [availableCouriers, setAvailableCouriers] = useState<CourierProfile[]>([]);
  const [partnerIds, setPartnerIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
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
      setPartnerIds(new Set((partners || []).map((partner) => partner.id)));
    } catch (err: any) {
      console.error("Failed to fetch couriers:", err);
      toast.error(err.message || "Failed to load courier partners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getValidAccessToken]);

  const filteredCouriers = useMemo(() => {
    if (!searchQuery.trim()) return availableCouriers;
    return availableCouriers.filter((courier) =>
      `${courier.company_name || ""} ${courier.email || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [availableCouriers, searchQuery]);

  const stats = [
    { label: "Couriers in network", value: availableCouriers.length },
    { label: "Partnered carriers", value: partnerIds.size },
    { label: "Needs review", value: Math.max(0, availableCouriers.length - partnerIds.size) },
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
              Discover the right delivery networks and monitor partner status across Addis Ababa.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border/30 bg-background/60 backdrop-blur-md px-3 py-2 text-xs text-muted-foreground">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search couriers..."
                className="border-0 bg-transparent p-0 text-xs placeholder:text-muted-foreground/70 focus-visible:ring-0"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
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

      <section className="space-y-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span>Available couriers</span>
          </div>
          <span>{filteredCouriers.length} results</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-3xl border border-border/30 bg-card/60 p-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            Connecting to courier network...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filteredCouriers.map((courier) => (
              <CourierCard
                key={courier.id}
                courier={courier}
                isPartner={partnerIds.has(courier.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredCouriers.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/40 bg-card/60 p-6 text-sm text-muted-foreground">
            No courier partners match your search. Adjust the query or refresh the network.
          </div>
        )}
      </section>
    </div>
  );
}

function CourierCard({ courier, isPartner }: { courier: CourierProfile; isPartner: boolean }) {
  const rating = typeof courier.rating_aggregate === "number" ? courier.rating_aggregate : 0;

  return (
    <Card className="group border-border/40 bg-card/60 backdrop-blur-md shadow-xl shadow-black/5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{courier.company_name}</CardTitle>
          <Badge variant={isPartner ? "default" : "outline"} className="text-[10px] uppercase tracking-[0.3em]">
            {isPartner ? "Partnered" : "Available"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-4 w-4 text-amber-400" />
          <span>{rating.toFixed(1)} rating</span>
          <span className="text-muted-foreground/60">•</span>
          <span>{courier.email || "Private"}</span>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <CardDescription className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground/80">
            Fees & limits
          </CardDescription>
          <p className="text-sm text-foreground">Base price: ${courier.base_price.toFixed(2)}</p>
          <p className="text-sm text-foreground">Distance: ${courier.distance_rate.toFixed(2)}/km</p>
          <p className="text-sm text-foreground">Weight: ${courier.weight_rate.toFixed(2)}/kg</p>
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
    </Card>
  );
}
