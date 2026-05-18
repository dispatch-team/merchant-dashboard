"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Star, Package, MapPin, Tag, Truck, ShieldAlert } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  cancelShipment,
  generateConfirmationCode,
  getShipmentDetails,
  rateShipment,
  ShipmentResponse,
  ShipmentUpdatePayload,
  updateShipment,
} from "@/lib/shipments";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { parseAddress, AutocompleteResult } from "@/lib/addresses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useI18n } from "@/intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spoiler } from "@/components/ui/spoiler";
import { motion } from "framer-motion";

type FormValues = {
  start_address: string;
  start_latitude?: number;
  start_longitude?: number;
  end_address: string;
  end_latitude?: number;
  end_longitude?: number;
  description: string;
  recipient_name: string;
  recipient_phone: string;
  weight_kg: string;
  dimensions: string;
  items: string;
};

type ParsedDescription = {
  description: string;
  recipient_name: string;
  recipient_phone: string;
};

const parseDescriptionDetails = (raw?: string): ParsedDescription => {
  if (!raw) {
    return { description: "", recipient_name: "", recipient_phone: "" };
  }

  const parts = raw.split("|").map((part) => part.trim()).filter(Boolean);
  let recipient_name = "";
  let recipient_phone = "";
  const remaining: string[] = [];

  parts.forEach((part) => {
    const lower = part.toLowerCase();
    if (lower.startsWith("recipient:")) {
      recipient_name = part.split(":").slice(1).join(":").trim();
    } else if (lower.startsWith("phone:")) {
      recipient_phone = part.split(":").slice(1).join(":").trim();
    } else {
      remaining.push(part);
    }
  });

  return {
    description: remaining.join(" | "),
    recipient_name,
    recipient_phone,
  };
};

const buildDescriptionPayload = (values: FormValues) => {
  const parts: string[] = [];
  if (values.description.trim()) {
    parts.push(values.description.trim());
  }
  if (values.recipient_name.trim()) {
    parts.push(`Recipient: ${values.recipient_name.trim()}`);
  }
  if (values.recipient_phone.trim()) {
    parts.push(`Phone: ${values.recipient_phone.trim()}`);
  }
  return parts.join(" | ");
};

interface ShipmentDetailsPageProps {
  params: Promise<{
    code: string;
  }>;
}

const isValidPhone = (phone: string) => /^\+251\d{9}$/.test(phone.trim());

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
    <div className="flex gap-1.5" role="group" aria-label="Rate from 1 to 5 stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={cn(
            "rounded-full p-2 transition hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            disabled && "pointer-events-none opacity-50"
          )}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
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

export default function ShipmentDetailsPage({ params }: ShipmentDetailsPageProps) {
  const t = useI18n("shipmentDetails");
  const tShipments = useI18n("shipments");
  const tRegister = useI18n("register");
  const resolvedParams = use(params);
  const shipmentCode = resolvedParams?.code || "";
  const router = useRouter();
  const { getValidAccessToken } = useAuth();

  const [shipment, setShipment] = useState<ShipmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [cancelRemark, setCancelRemark] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    start_address: "",
    start_latitude: undefined,
    start_longitude: undefined,
    end_address: "",
    end_latitude: undefined,
    end_longitude: undefined,
    description: "",
    recipient_name: "",
    recipient_phone: "",
    weight_kg: "",
    dimensions: "",
    items: "",
  });

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTimestamp = (value?: string | null) => {
    if (!isClient) return "—";
    return value ? new Date(value).toLocaleString() : "—";
  };

  const lastUpdatedTimestamp = useMemo(() => {
    if (!shipment) return "—";
    const candidate =
      shipment.updated_at ||
      shipment.assigned_to_driver_at ||
      shipment.assigned_to_courier_at ||
      shipment.picked_up_at ||
      shipment.in_transit_at ||
      shipment.failed_at ||
      shipment.returned_at ||
      shipment.delivered_at;
    return formatTimestamp((candidate as string) || shipment.created_at);
  }, [shipment]);

  const createdTimestamp = useMemo(() => formatTimestamp(shipment?.created_at), [shipment]);

  const formattedItems = useMemo(() => {
    if (!shipment?.items?.length) return "—";
    return shipment.items.join(", ");
  }, [shipment]);

  const courierCompany = shipment?.courier_company;
  const merchantInfo = shipment?.merchant as { company_name?: string } | undefined;

  const refreshShipment = useCallback(async () => {
    setIsLoading(true);
    setNotFound(false);
    setFetchError(null);
    setStatusMessage(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const details = await getShipmentDetails(token, shipmentCode);
      
      // Check for persisted confirmation code in localStorage as a fallback
      const persistedCode = localStorage.getItem(`conf_code_${shipmentCode}`);
      let finalConfirmationCode = details.confirmation_code;
      
      if (persistedCode && !finalConfirmationCode) {
        finalConfirmationCode = persistedCode;
      } else if (finalConfirmationCode) {
        // Sync back to localStorage if API has it
        localStorage.setItem(`conf_code_${shipmentCode}`, finalConfirmationCode);
      }

      const shipmentWithCode = { ...details, confirmation_code: finalConfirmationCode };
      setShipment(shipmentWithCode);

      const parsedDescription = parseDescriptionDetails(details.description);
      setFormValues({
        start_address: details.start_address || "",
        start_latitude: details.start_latitude,
        start_longitude: details.start_longitude,
        end_address: details.end_address || "",
        end_latitude: details.end_address_latitude,
        end_longitude: details.end_address_longitude,
        description: parsedDescription.description,
        recipient_name: parsedDescription.recipient_name,
        recipient_phone: parsedDescription.recipient_phone,
        weight_kg: details.weight_kg?.toString() || "",
        dimensions: details.dimensions || "",
        items: details.items?.join(", ") || "",
      });
    } catch (err: any) {
      console.error("Failed to load shipment details:", err);
      if (err.status === 404) {
        setNotFound(true);
        setFetchError(null);
        return;
      }
      setFetchError(err.message || t("errorUpdate"));
    } finally {
      setIsLoading(false);
    }
  }, [getValidAccessToken, shipmentCode]);

  const handleParseAddress = useCallback(async (name: "start_address" | "end_address", address: string) => {
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      const result = await parseAddress(token, address);
      
      if (result) {
        setFormValues(prev => ({
          ...prev,
          [`${name === "start_address" ? "start" : "end"}_latitude`]: result.latitude,
          [`${name === "start_address" ? "start" : "end"}_longitude`]: result.longitude,
        }));
      }
    } catch (err) {
      console.error("Failed to parse address:", err);
    }
  }, [getValidAccessToken]);

  const handleAddressSelect = (name: "start_address" | "end_address", result: AutocompleteResult) => {
    setFormValues(prev => ({ 
      ...prev, 
      [name]: result.name,
      [`${name === "start_address" ? "start" : "end"}_latitude`]: result.lat,
      [`${name === "start_address" ? "start" : "end"}_longitude`]: result.lng,
    }));
    handleParseAddress(name, result.name);
  };

  useEffect(() => {
    refreshShipment();
  }, [refreshShipment]);

  const badgeVariant = useMemo<"default" | "secondary" | "destructive">(() => {
    const status = shipment?.status?.toLowerCase();
    if (!status) return "secondary";
    if (status.includes("delivered") || status.includes("success")) return "default";
    if (status.includes("cancelled") || status.includes("failed")) return "destructive";
    return "secondary";
  }, [shipment]);

  const handleUpdate = async () => {
    if (!shipment) return;
    
    // Status check
    const allowedStatuses = ["pending", "courier_assigned", "assigned_to_courier"];
    const currentStatus = shipment.status?.toLowerCase() || "";
    if (currentStatus && !allowedStatuses.includes(currentStatus)) {
      setActionError(t("errorStatus", { status: shipment.status || "" }));
      return;
    }

    setIsUpdating(true);
    setStatusMessage(null);
    setActionError(null);

    try {
      const token = await getValidAccessToken();
      if (!token) return;
 
      if (!isValidPhone(formValues.recipient_phone)) {
        setActionError(tRegister("validation.phoneInvalid"));
        setIsUpdating(false);
        return;
      }

      const payload: ShipmentUpdatePayload = {
        merchant_user_id: shipment.merchant_user_id
      };

      if (formValues.start_address !== (shipment.start_address || "")) {
        const hasCoords = formValues.start_latitude && formValues.start_longitude;
        payload.start_address = hasCoords 
          ? `${formValues.start_latitude}; ${formValues.start_longitude}`
          : formValues.start_address;
      }
      if (formValues.end_address !== (shipment.end_address || "")) {
        const hasCoords = formValues.end_latitude && formValues.end_longitude;
        payload.end_address = hasCoords 
          ? `${formValues.end_latitude}; ${formValues.end_longitude}`
          : formValues.end_address;
      }
      const newDescription = buildDescriptionPayload(formValues);
      if (newDescription !== (shipment.description || "")) {
        payload.description = newDescription;
      }
      
      const newWeight = parseFloat(formValues.weight_kg);
      if (!isNaN(newWeight) && newWeight !== shipment.weight_kg) {
        payload.weight_kg = newWeight;
      }
      
      if (formValues.dimensions !== (shipment.dimensions || "")) {
        payload.dimensions = formValues.dimensions;
      }
      
      const newItems = formValues.items.split(",").map(i => i.trim()).filter(Boolean);
      const oldItems = shipment.items || [];
      if (JSON.stringify(newItems) !== JSON.stringify(oldItems)) {
        payload.items = newItems;
      }

      if (Object.keys(payload).length <= 1 && payload.merchant_user_id) {
        const hasOtherChanges = Object.keys(payload).length > 1;
        if (!hasOtherChanges) {
           setStatusMessage(t("noChanges"));
           setIsUpdating(false);
           return;
        }
      }

      const updated = await updateShipment(token, shipmentCode, payload);
      setShipment(updated);
      setActionError(null);
      const parsedUpdatedDescription = parseDescriptionDetails(updated.description);
      setFormValues({
        start_address: updated.start_address || "",
        start_latitude: updated.start_latitude,
        start_longitude: updated.start_longitude,
        end_address: updated.end_address || "",
        end_latitude: updated.end_address_latitude,
        end_longitude: updated.end_address_longitude,
        description: parsedUpdatedDescription.description,
        recipient_name: parsedUpdatedDescription.recipient_name,
        recipient_phone: parsedUpdatedDescription.recipient_phone,
        weight_kg: updated.weight_kg?.toString() || "",
        dimensions: updated.dimensions || "",
        items: updated.items?.join(", ") || "",
      });
      toast.success(t("successUpdate"));
    } catch (err: any) {
      console.error("Failed to update shipment:", err);
      setActionError(err.message || t("errorUpdate"));
      toast.error(err.message || t("errorUpdate"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateConfirmationCode = async () => {
    if (!shipment) return;

    setIsGeneratingCode(true);
    setActionError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const result = await generateConfirmationCode(token, shipmentCode) as any;
      const newCode = result?.confirmation_code || result?.code;
      if (newCode) {
        localStorage.setItem(`conf_code_${shipmentCode}`, newCode);
        setShipment(prev => prev ? { ...prev, confirmation_code: newCode } : null);
        toast.success(`${t("successCode")}: ${newCode}`);
      } else {
        toast.success(t("successCode"));
        await refreshShipment();
      }
    } catch (err: any) {
      console.error("Failed to generate confirmation code:", err);
      setActionError(err.message || t("errorUpdate"));
      toast.error(err.message || t("errorUpdate"));
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCancel = async () => {
    if (!shipment) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      await cancelShipment(token, shipmentCode, cancelRemark);
      toast.success(t("successCancel"));
      router.push("/merchant/shipments");
    } catch (err: any) {
      console.error("Failed to cancel shipment:", err);
      setActionError(err.message || t("errorUpdate"));
      toast.error(err.message || t("errorUpdate"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!shipment || ratingStars < 1 || ratingStars > 5) {
      toast.error(t("rating.selectFirst"));
      return;
    }
    const token = await getValidAccessToken();
    if (!token) return;

    const scoreOutOf10 = ratingStars * 2;
    setRatingSubmitting(true);
    try {
      await rateShipment(token, shipmentCode, scoreOutOf10);
      toast.success(t("rating.success"));
      setRatingStars(0);
      await refreshShipment();
    } catch (err: any) {
      toast.error(err.message || "Could not submit rating");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const isDelivered = shipment?.status?.toLowerCase() === "delivered" || shipment?.status?.toLowerCase() === "success";

  return (
    <AuthGuard allowedRoles={["merchant"]} loginPath="/login/merchant">
      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden pb-12">
        {/* Soft background visual flares */}
        <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[5%] w-[450px] h-[450px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
          
          {/* CURVY GLASS FLOATING HEADER (STICKY RECTANGLE BAR REMOVED) */}
          <div className="flex items-center gap-4 mb-4 px-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full h-12 w-12 border-border/30 bg-background/30 hover:bg-muted/80 backdrop-blur-md shrink-0 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 block w-fit mb-1.5 shadow-sm">
                {t("header", { code: "" }).split(" ")[0]}
              </span>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {t("header", { code: shipmentCode.toUpperCase() })}
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-[2.5rem] border border-border/30 bg-card/25 p-24 flex flex-col items-center justify-center gap-3 shadow-inner">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
              <span className="text-sm font-semibold text-muted-foreground/65">{tShipments("loading")}</span>
            </div>
          ) : fetchError ? (
            <div className="rounded-[2.25rem] border border-destructive/30 bg-destructive/10 p-8 text-center space-y-4">
              <p className="text-sm text-destructive font-medium">{fetchError}</p>
              <Button onClick={refreshShipment} className="rounded-full px-6">
                {t("retry")}
              </Button>
            </div>
          ) : notFound ? (
            <div className="rounded-[2.25rem] border border-border/40 bg-card/50 p-12 text-center space-y-4 shadow-xl backdrop-blur-xl">
              <h3 className="text-xl font-black text-foreground">{t("notFound")}</h3>
              <p className="text-sm text-muted-foreground">{t("notFoundDesc")}</p>
              <div className="flex justify-center gap-3 pt-3">
                <Button variant="ghost" className="rounded-full px-6" onClick={() => router.push("/merchant/shipments")}>
                  {t("backToList")}
                </Button>
                <Button className="rounded-full px-6" onClick={refreshShipment}>
                  {t("retry")}
                </Button>
              </div>
            </div>
          ) : (
            shipment && (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                
                {/* LEFT SECTION - INFRASTRUCTURE INFORMATION */}
                <section className="space-y-8">
                  
                  {/* Snapshot Card */}
                  <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/65 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                          <Tag className="h-5 w-5 text-primary" />
                          {t("snapshot")}
                        </h2>
                        
                        <Badge className={cn("rounded-full px-3.5 py-1 text-[10px] font-bold border transition-colors uppercase tracking-widest shrink-0 shadow-sm", 
                          badgeVariant === "default" && "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
                          badgeVariant === "destructive" && "bg-destructive/10 border-destructive/25 text-destructive",
                          badgeVariant === "secondary" && "bg-blue-500/10 border-blue-500/25 text-blue-400"
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5 inline-block animate-pulse",
                            badgeVariant === "default" && "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
                            badgeVariant === "destructive" && "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]",
                            badgeVariant === "secondary" && "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                          )} />
                          {getTranslatedStatus(shipment.status, tShipments)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-border/10 pb-3 mt-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("code")}</p>
                        <p className="font-mono text-sm font-black text-foreground">{shipment.code || shipment.id}</p>
                      </div>

                      {/* Confirmation Code Glowing Vault */}
                      {(shipment.confirmation_code || shipment.confirmation_code === "") && (
                        <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-3xl border border-primary/20 shadow-inner relative overflow-hidden group/vault">
                          <div className="absolute top-[-30%] right-[-10%] w-24 h-24 bg-primary/10 rounded-full blur-[35px] pointer-events-none" />
                          <div className="relative z-10">
                            <p className="text-[9px] text-primary font-black uppercase tracking-widest mb-1.5">{t("confirmationCode")}</p>
                            <Spoiler className="font-mono text-3xl font-black text-primary tracking-[0.25em] drop-shadow-[0_0_12px_rgba(var(--primary),0.3)]">
                              {shipment.confirmation_code || "PENDING"}
                            </Spoiler>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-md group-hover/vault:scale-110 transition-transform duration-300">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      )}

                      {/* Date & Metadata list */}
                      <div className="grid gap-3 pt-2 text-xs font-semibold text-foreground/90">
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <p className="text-muted-foreground/60">{t("created")}</p>
                          <p className="text-foreground">{createdTimestamp}</p>
                        </div>
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <p className="text-muted-foreground/60">{t("lastUpdated")}</p>
                          <p className="text-foreground">{lastUpdatedTimestamp}</p>
                        </div>
                        {merchantInfo?.company_name && (
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground/60">{t("merchant")}</p>
                            <p className="text-foreground">{merchantInfo.company_name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Locations Details (Creative Vertical Timeline) */}
                  <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/65 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
                    <h2 className="text-xl font-black tracking-tight text-foreground mb-6 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {t("locations")}
                    </h2>
                    
                    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/25">
                      {/* Pickup point */}
                      <div className="relative group/pickup">
                        <div className="absolute left-[-29px] top-1.5 w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10 shadow-sm group-hover/pickup:scale-110 transition-transform duration-300">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 mb-1">{t("pickup")}</p>
                          <p className="text-sm font-bold text-foreground/95">{shipment.start_address || "—"}</p>
                        </div>
                      </div>

                      {/* Destination point */}
                      <div className="relative group/dest">
                        <div className="absolute left-[-29px] top-1.5 w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center z-10 shadow-sm group-hover/dest:scale-110 transition-transform duration-300">
                          <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1">{t("destination")}</p>
                          <p className="text-sm font-bold text-foreground/95">{shipment.end_address || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/65 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
                    <h2 className="text-xl font-black tracking-tight text-foreground mb-5 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      {t("package")}
                    </h2>
                    
                    <div className="grid gap-6">
                      <div className="grid gap-4 sm:grid-cols-2 bg-background/30 p-5 rounded-3xl border border-border/10 shadow-inner">
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-1">{t("recipient")}</p>
                          <p className="text-sm font-black text-foreground">{formValues.recipient_name || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60 mb-1">{t("phone")}</p>
                          <p className="text-sm font-black text-foreground font-mono">{formValues.recipient_phone || "—"}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pl-1">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("notes")}</p>
                        <p className="text-sm font-semibold text-foreground/95 bg-muted/20 p-4 rounded-2xl border border-border/5">{formValues.description || "—"}</p>
                      </div>

                      <div className="space-y-3.5 border-t border-border/10 pt-4 text-xs font-semibold pl-1">
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <span className="text-muted-foreground/60">{t("items")}</span>
                          <span className="text-foreground">{formattedItems}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <span className="text-muted-foreground/60">{t("weight")}</span>
                          <span className="text-foreground">{shipment.weight_kg ? `${shipment.weight_kg} kg` : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-border/10 pb-2">
                          <span className="text-muted-foreground/60">{t("dimensions")}</span>
                          <span className="text-foreground">{shipment.dimensions || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground/60">{t("fee")}</span>
                          <span className="text-primary font-black text-sm">
                            {shipment.total_fee ? `${shipment.total_fee}` : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Carrier Information */}
                  <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/65 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
                    <h2 className="text-xl font-black tracking-tight text-foreground mb-5 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      {t("carrier")}
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/10 pb-2.5">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("recipient")}</p>
                        <p className="text-sm font-black text-foreground">{courierCompany?.company_name || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between border-b border-border/10 pb-2.5">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{tRegister("fields.address")}</p>
                        <p className="text-sm font-bold text-foreground text-right max-w-[240px]">{courierCompany?.company_address || "—"}</p>
                      </div>
                      <div className="grid gap-2.5 text-xs font-semibold text-muted-foreground/75 pl-1 pt-1">
                        <p className="flex justify-between"><span>{t("phone")}:</span> <span className="font-mono text-foreground font-bold">{courierCompany?.phone_number || "—"}</span></p>
                        <p className="flex justify-between"><span>{tRegister("fields.email")}:</span> <span className="text-foreground font-bold">{courierCompany?.email || "—"}</span></p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* RIGHT SECTION - EDIT CONSOLE & TRIGGER BUTTONS */}
                <section className="space-y-8">
                  
                  {/* Curvy Glassy Update Card Form */}
                  {shipment && (
                    <div className={cn(
                      "rounded-[2.25rem] border border-border/35 bg-card/45 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-300 relative overflow-hidden",
                      !(["pending", "courier_assigned", "assigned_to_courier"].includes(shipment.status?.toLowerCase() || "")) && "opacity-60 pointer-events-none"
                    )}>
                      <h2 className="text-xl font-black tracking-tight text-foreground mb-1">{t("updateTitle")}</h2>
                      <p className="text-xs text-muted-foreground mb-6">
                        {["pending", "courier_assigned", "assigned_to_courier"].includes(shipment.status?.toLowerCase() || "") 
                          ? t("updateSubtitle")
                          : t("cannotUpdate")}
                      </p>
                      
                      <div className="space-y-5">
                        <div className="grid gap-2">
                          <AddressAutocomplete
                            label={t("pickup")}
                            name="start_address"
                            value={formValues.start_address}
                            onChange={(e) => setFormValues(prev => ({ ...prev, start_address: e.target.value }))}
                            onBlur={(e) => handleParseAddress("start_address", e.target.value)}
                            onSelect={(result) => handleAddressSelect("start_address", result)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <AddressAutocomplete
                            label={t("destination")}
                            name="end_address"
                            value={formValues.end_address}
                            onChange={(e) => setFormValues(prev => ({ ...prev, end_address: e.target.value }))}
                            onBlur={(e) => handleParseAddress("end_address", e.target.value)}
                            onSelect={(result) => handleAddressSelect("end_address", result)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("recipient")}</label>
                            <Input
                              className="rounded-full h-11 px-4 border-border/40 focus-visible:ring-primary/20 font-bold"
                              value={formValues.recipient_name}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, recipient_name: event.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("phone")}</label>
                            <Input
                              className="rounded-full h-11 px-4 border-border/40 focus-visible:ring-primary/20 font-mono font-bold"
                              value={formValues.recipient_phone}
                              placeholder="+2519xxxxxxxx"
                              onChange={(event) =>
                                setFormValues((prev) => ({
                                  ...prev,
                                  recipient_phone: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/10 pt-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("weight")} (kg)</label>
                            <Input
                              type="number"
                              step="0.01"
                              className="rounded-full h-11 px-4 border-border/40 focus-visible:ring-primary/20 font-bold"
                              value={formValues.weight_kg}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, weight_kg: event.target.value }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("dimensions")}</label>
                            <Input
                              placeholder="e.g. 1m X 20cm X 20cm"
                              className="rounded-full h-11 px-4 border-border/40 focus-visible:ring-primary/20 font-bold"
                              value={formValues.dimensions}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, dimensions: event.target.value }))
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2 border-t border-border/10 pt-4">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("items")}</label>
                          <Input
                            placeholder="Item 1, Item 2, Item 3"
                            className="rounded-full h-11 px-4 border-border/40 focus-visible:ring-primary/20 font-bold"
                            value={formValues.items}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, items: event.target.value }))
                            }
                          />
                        </div>

                        <div className="space-y-2 border-t border-border/10 pt-4">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">{t("notes")}</label>
                          <Textarea
                            className="h-24 rounded-3xl p-4 border-border/40 focus-visible:ring-primary/20 font-semibold"
                            value={formValues.description}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, description: event.target.value }))
                            }
                          />
                        </div>
                        
                        {statusMessage && (
                          <p className="text-xs text-foreground/80 font-bold pl-1">{statusMessage}</p>
                        )}
                        {actionError && (
                          <p className="text-xs text-destructive font-bold pl-1">{actionError}</p>
                        )}
                      </div>

                      <div className="mt-6 border-t border-border/10 pt-5 flex justify-between items-center flex-wrap gap-4">
                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60">
                          {t("lastUpdated")}: <span className="text-foreground">{lastUpdatedTimestamp.split(",")[0]}</span>
                        </div>
                        <Button 
                          onClick={handleUpdate} 
                          disabled={isUpdating || !(["pending", "courier_assigned", "assigned_to_courier"].includes(shipment.status?.toLowerCase() || ""))}
                          className="rounded-full px-6 h-11 bg-primary text-primary-foreground font-black shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          {isUpdating ? t("saving") : t("save")}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions Dashboard Hub */}
                  <div className="rounded-[2.25rem] border border-border/35 bg-card/45 backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
                    <h2 className="text-xl font-black tracking-tight text-foreground mb-1">{t("actions")}</h2>
                    <p className="text-xs text-muted-foreground mb-5">{t("actionsSubtitle")}</p>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={refreshShipment} 
                        variant="secondary"
                        className="w-full rounded-full h-11 font-bold border border-border/40 shadow-sm"
                      >
                        {t("refreshDetails")}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => router.push("/merchant/shipments/new")}
                        disabled={isUpdating || isDeleting || isGeneratingCode}
                        className="w-full rounded-full h-11 font-bold border-primary/20 text-primary hover:bg-primary/10 transition-colors shadow-sm"
                      >
                        {t("newShipment")}
                      </Button>
                      
                      <Button
                        variant={shipment.confirmation_code ? "outline" : "default"}
                        onClick={handleGenerateConfirmationCode}
                        disabled={isGeneratingCode || isUpdating || isDeleting}
                        className="w-full rounded-full h-11 font-bold shadow-md"
                      >
                        {isGeneratingCode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {shipment.confirmation_code ? t("regenerating") : t("generating")}
                          </>
                        ) : shipment.confirmation_code ? (
                          t("regenerateCode")
                        ) : (
                          t("generateCode")
                        )}
                      </Button>

                      {/* Cancel Dispatch Dialog Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            disabled={isDeleting}
                            className="w-full rounded-full h-11 font-black shadow-lg"
                          >
                            {isDeleting ? t("cancelling") : t("cancel")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2.25rem] border-border/50 bg-card/95 backdrop-blur-2xl p-8 max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                              <ShieldAlert className="h-6 w-6 text-destructive" />
                              {t("cancelDialog.title")}
                            </AlertDialogTitle>
                            <div className="text-sm text-muted-foreground space-y-4">
                              <p className="font-semibold text-foreground/90 mt-1">{t("cancelDialog.desc")}</p>
                              
                              <ul className="space-y-1.5 list-disc list-inside text-xs font-semibold pl-1">
                                {(t("cancelDialog.list") as string[]).map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                              
                              <div className="space-y-2 pt-2 border-t border-border/10">
                                <label htmlFor="cancel-remark" className="text-xs font-extrabold uppercase tracking-widest text-foreground block">
                                  {t("cancelDialog.remarkLabel")}
                                </label>
                                <Textarea
                                  id="cancel-remark"
                                  placeholder={t("cancelDialog.remarkPlaceholder")}
                                  className="bg-background/40 rounded-2xl h-20 text-xs p-3 font-semibold"
                                  value={cancelRemark}
                                  onChange={(e) => setCancelRemark(e.target.value)}
                                />
                              </div>
                            </div>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6 gap-3 flex-wrap">
                            <AlertDialogCancel className="rounded-full px-6 h-11 border-border/40 hover:bg-muted/50 transition-colors font-bold text-xs">
                              {t("cancelDialog.keep")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancel}
                              className="rounded-full px-6 h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-black text-xs shadow-md"
                            >
                              {t("cancelDialog.confirm")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Notes Card Info Box */}
                  <div className="rounded-[2.25rem] border border-border/30 bg-muted/20 backdrop-blur-2xl p-6 relative overflow-hidden">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-foreground/80 mb-2">{t("notes")}</h3>
                    <p className="text-[11px] font-semibold text-muted-foreground leading-relaxed">
                      {t("cancelDialog.list")?.[0]}
                    </p>
                  </div>

                  {/* Premium Delivery Rating Vault */}
                  {isDelivered && (
                    <div className="rounded-[2.25rem] border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-2xl p-7 shadow-[0_20px_50px_rgba(var(--primary),0.08)] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[45px] pointer-events-none" />
                      
                      <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 mb-1.5">
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400 animate-pulse" />
                        {t("rating.title")}
                      </h2>
                      <p className="text-xs text-muted-foreground mb-6 pl-1">{t("rating.subtitle")}</p>
                      
                      <div className="space-y-6 pl-1">
                        <StarRatingInput
                          value={ratingStars}
                          onChange={setRatingStars}
                          disabled={ratingSubmitting}
                        />
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-2">
                          <Button
                            type="button"
                            disabled={ratingStars < 1 || ratingSubmitting}
                            onClick={handleSubmitRating}
                            className="rounded-full px-7 h-11 bg-primary text-primary-foreground font-black shadow-lg hover:scale-105 transition-all duration-300"
                          >
                            {ratingSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                {t("rating.submitting")}
                              </>
                            ) : (
                              t("rating.submit")
                            )}
                          </Button>
                          {ratingStars > 0 && (
                            <span className="text-xs font-extrabold uppercase tracking-widest text-primary/80 bg-primary/15 border border-primary/25 rounded-full px-3.5 py-1.5 shadow-sm">
                              {t("rating.scoreHint", { score: (ratingStars * 2).toString() })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
