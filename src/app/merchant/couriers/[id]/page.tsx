"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  Globe,
  ExternalLink,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  addPartnerCourier,
  buildCourierLogoProxyUrl,
  findCourierById,
  getAvailableCouriers,
  getPartnerCouriers,
  isCourierPartner,
  removePartnerCourier,
  submitCourierRating,
  type CourierProfile,
} from "@/lib/couriers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CourierDetailPageProps {
  params: Promise<{ id: string }>;
}

function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (stars: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rate from 1 to 5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={cn(
            "rounded-lg p-1.5 transition hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            disabled && "pointer-events-none opacity-50"
          )}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "h-9 w-9 transition-colors",
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/35"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function CourierDetailPage({ params }: CourierDetailPageProps) {
  const { id: idParam } = use(params);
  const router = useRouter();
  const { getValidAccessToken } = useAuth();

  const courierId = Number(idParam);
  const idValid = Number.isFinite(courierId) && courierId > 0;

  const [partners, setPartners] = useState<CourierProfile[]>([]);
  const [courier, setCourier] = useState<CourierProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerBusy, setPartnerBusy] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!idValid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error("Unable to authenticate");
        return;
      }
      setAccessToken(token);

      const [a, p] = await Promise.all([
        getAvailableCouriers(token),
        getPartnerCouriers(token).catch(() => []),
      ]);
      setPartners(p);

      const c = findCourierById(courierId, a, p);
      setCourier(c ?? null);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to load courier");
    } finally {
      setLoading(false);
    }
  }, [courierId, getValidAccessToken, idValid]);

  useEffect(() => {
    load();
  }, [load]);

  const isPartner = useMemo(
    () => isCourierPartner(courierId, partners),
    [partners, courierId]
  );

  const logoUrl = useMemo(
    () => buildCourierLogoProxyUrl(courier?.company_logo_id, accessToken),
    [courier?.company_logo_id, accessToken]
  );

  const aggregate =
    typeof courier?.rating_aggregate === "number" ? courier.rating_aggregate : 0;
  const ratingCount =
    typeof courier?.rating_count === "number" ? courier.rating_count : 0;

  const handlePartnerToggle = async () => {
    const token = await getValidAccessToken();
    if (!token || !courier) return;
    setPartnerBusy(true);
    try {
      if (isPartner) {
        await removePartnerCourier(token, courier.id);
        toast.success("Partnership ended");
        const p = await getPartnerCouriers(token).catch(() => []);
        setPartners(p);
      } else {
        await addPartnerCourier(token, courier.id);
        toast.success("Courier added as partner");
        const p = await getPartnerCouriers(token).catch(() => []);
        setPartners(p);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Partner action failed");
    } finally {
      setPartnerBusy(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!courier || ratingStars < 1 || ratingStars > 5) {
      toast.error("Select a star rating first");
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;

    const scoreOutOf10 = ratingStars * 2;
    setRatingSubmitting(true);
    try {
      await submitCourierRating(token, courier.id, scoreOutOf10);
      toast.success("Thank you for your rating");
      setRatingStars(0);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (!idValid) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/60 p-10 text-center text-muted-foreground">
        Invalid courier link.
        <Button asChild variant="link" className="mt-4 block mx-auto">
          <Link href="/merchant/couriers">Back to couriers</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border/30 bg-card/60 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        Loading courier…
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl text-muted-foreground"
          onClick={() => router.push("/merchant/couriers")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="rounded-3xl border border-dashed border-border/40 bg-card/60 p-10 text-center text-muted-foreground">
          This courier could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-xl text-muted-foreground"
          onClick={() => router.push("/merchant/couriers")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to couriers
        </Button>
        <Badge
          variant={isPartner ? "default" : "outline"}
          className="text-[10px] uppercase tracking-[0.3em]"
        >
          {isPartner ? "Your partner" : "Not partnered"}
        </Badge>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-border/40 bg-card/50 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)]">
        <div className="border-b border-border/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 px-8 py-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-border/40 bg-background/80 shadow-inner">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${courier.company_name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground/80">
                Courier company
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {courier.company_name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400" />
                  {aggregate.toFixed(1)} / 10
                  {ratingCount > 0 ? (
                    <span className="text-muted-foreground/60">
                      ({ratingCount} ratings)
                    </span>
                  ) : null}
                </span>
                {courier.status ? (
                  <Badge variant="secondary" className="rounded-lg text-[10px] uppercase">
                    {courier.status}
                  </Badge>
                ) : null}
              </div>
            </div>
            <Button
              size="lg"
              variant={isPartner ? "outline" : "default"}
              disabled={partnerBusy}
              className="min-w-[200px] shrink-0 gap-2 rounded-2xl shadow-lg shadow-primary/15"
              onClick={handlePartnerToggle}
            >
              {partnerBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPartner ? (
                <>
                  <UserMinus className="h-4 w-4" />
                  End partnership
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add as partner
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <Card className="border-border/40 bg-background/40">
            <CardHeader>
              <CardTitle className="text-base">Contact & location</CardTitle>
              <CardDescription>How to reach this courier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{courier.company_address || "—"}</span>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{courier.phone_number || "—"}</span>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{courier.email || "—"}</span>
              </div>
              {courier.website_url ? (
                <a
                  href={courier.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Website
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-background/40">
            <CardHeader>
              <CardTitle className="text-base">Pricing & capacity</CardTitle>
              <CardDescription>Rates shown for planning shipments</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">Base price:</span>{" "}
                <span className="font-medium text-foreground">
                  ${Number(courier.base_price).toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Distance:</span>{" "}
                <span className="font-medium text-foreground">
                  ${Number(courier.distance_rate).toFixed(2)}/km
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Weight:</span>{" "}
                <span className="font-medium text-foreground">
                  ${Number(courier.weight_rate).toFixed(2)}/kg
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Time:</span>{" "}
                <span className="font-medium text-foreground">
                  ${Number(courier.time_rate).toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Max weight:</span>{" "}
                <span className="font-medium text-foreground">
                  {courier.max_weight} kg
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className={cn("border-border/40 bg-card/60 backdrop-blur-md transition-opacity", !isPartner && "opacity-60")}>
        <CardHeader>
          <CardTitle className="text-lg">Rate courier company</CardTitle>
          <CardDescription>
            {isPartner 
              ? "Use 1–5 stars (each star counts as 2 points on our 10-point scale)."
              : "Only partnered couriers can be rated by a merchant."}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {!isPartner && (
            <div 
              className="absolute inset-0 z-10 cursor-not-allowed" 
              onClick={() => toast.error("Only partnered couriers can be rated.")}
              title="Only partnered couriers can be rated"
            />
          )}
          <StarRatingInput
            value={ratingStars}
            onChange={setRatingStars}
            disabled={ratingSubmitting || !isPartner}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="rounded-xl"
              disabled={ratingStars < 1 || ratingSubmitting || !isPartner}
              onClick={handleSubmitRating}
            >
              {ratingSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit rating"
              )}
            </Button>
            {isPartner && ratingStars > 0 ? (
              <span className="text-sm text-muted-foreground">
                Sends <span className="font-semibold text-foreground">{ratingStars * 2}</span> / 10
                to the server
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
