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
import { useI18n } from "@/intl";

interface CourierDetailPageProps {
  params: Promise<{ id: string }>;
}


export default function CourierDetailPage({ params }: CourierDetailPageProps) {
  const { id: idParam } = use(params);
  const router = useRouter();
  const t = useI18n("courierDetails");
  const tDashboard = useI18n("merchantDashboard");
  const { getValidAccessToken } = useAuth();

  const courierId = Number(idParam);
  const idValid = Number.isFinite(courierId) && courierId > 0;

  const [partners, setPartners] = useState<CourierProfile[]>([]);
  const [courier, setCourier] = useState<CourierProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [partnerBusy, setPartnerBusy] = useState(false);

  const load = useCallback(async () => {
    if (!idValid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error(t("errorAuth"));
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
      toast.error(e instanceof Error ? e.message : t("errorLoad"));
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
        toast.success(t("successEnd"));
        const p = await getPartnerCouriers(token).catch(() => []);
        setPartners(p);
      } else {
        await addPartnerCourier(token, courier.id);
        toast.success(t("successAdd"));
        const p = await getPartnerCouriers(token).catch(() => []);
        setPartners(p);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("errorAction"));
    } finally {
      setPartnerBusy(false);
    }
  };


  if (!idValid) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card/60 p-10 text-center text-muted-foreground">
        {t("invalid")}
        <Button asChild variant="link" className="mt-4 block mx-auto">
          <Link href="/merchant/couriers">{t("back")}</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-3xl border border-border/30 bg-card/60 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        {t("loading")}
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
          {t("back")}
        </Button>
        <div className="rounded-3xl border border-dashed border-border/40 bg-card/60 p-10 text-center text-muted-foreground">
          {t("notFound")}
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
          {t("back")}
        </Button>
        <Badge
          variant={isPartner ? "default" : "outline"}
          className="text-[10px] uppercase tracking-[0.3em]"
        >
          {isPartner ? t("partner") : t("notPartnered")}
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
                {t("type")}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {courier.company_name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground md:justify-start">
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
                  {t("endPartnership")}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {t("addPartner")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <Card className="border-border/40 bg-background/40">
            <CardHeader>
              <CardTitle className="text-base">{t("sections.contact.title")}</CardTitle>
              <CardDescription>{t("sections.contact.subtitle")}</CardDescription>
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
                  {t("sections.contact.website")}
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-background/40">
            <CardHeader>
              <CardTitle className="text-base">{t("sections.pricing.title")}</CardTitle>
              <CardDescription>{t("sections.pricing.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p>
                <span className="text-muted-foreground">{t("sections.pricing.base")}:</span>{" "}
                <span className="font-medium text-foreground">
                  {tDashboard("latestDeparture.currency")}{Number(courier.base_price).toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">{t("sections.pricing.distance")}:</span>{" "}
                <span className="font-medium text-foreground">
                  {tDashboard("latestDeparture.currency")}{Number(courier.distance_rate).toFixed(2)}{t("sections.pricing.perKm")}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">{t("sections.pricing.weight")}:</span>{" "}
                <span className="font-medium text-foreground">
                  {tDashboard("latestDeparture.currency")}{Number(courier.weight_rate).toFixed(2)}{t("sections.pricing.perKg")}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">{t("sections.pricing.time")}:</span>{" "}
                <span className="font-medium text-foreground">
                  {tDashboard("latestDeparture.currency")}{Number(courier.time_rate).toFixed(2)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">{t("sections.pricing.maxWeight")}:</span>{" "}
                <span className="font-medium text-foreground">
                  {courier.max_weight} kg
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>


    </div>
  );
}
