"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Star } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

type FormValues = {
  start_address: string;
  end_address: string;
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
    end_address: "",
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
      setShipment(details);
      const parsedDescription = parseDescriptionDetails(details.description);
      setFormValues({
        start_address: details.start_address || "",
        end_address: details.end_address || "",
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
        merchant_user_id: shipment.merchant_user_id // Keep existing or update from user context if needed
      };

      if (formValues.start_address !== (shipment.start_address || "")) {
        payload.start_address = formValues.start_address;
      }
      if (formValues.end_address !== (shipment.end_address || "")) {
        payload.end_address = formValues.end_address;
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
        // If only merchant_user_id is present, check if everything else is unchanged
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
        end_address: updated.end_address || "",
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

      await generateConfirmationCode(token, shipmentCode);
      toast.success(t("successCode"));
      await refreshShipment();
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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <header className="relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground/70">{t("header", { code: "" }).split(" ")[0]}</p>
              <h1 className="text-lg font-semibold">
                {t("header", { code: shipmentCode.toUpperCase() })}
              </h1>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
              <p className="text-sm text-muted-foreground animate-pulse">{tShipments("loading")}</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
              <p className="text-sm text-destructive font-medium">{fetchError}</p>
              <Button className="mt-4" onClick={refreshShipment}>
                {t("retry")}
              </Button>
            </div>
          ) : notFound ? (
            <div className="rounded-2xl border border-border/40 bg-card/70 p-6 text-center space-y-3">
              <h3 className="text-lg font-semibold">{t("notFound")}</h3>
              <p className="text-sm text-muted-foreground">{t("notFoundDesc")}</p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => router.push("/merchant/shipments")}>
                  {t("backToList")}
                </Button>
                <Button variant="outline" onClick={refreshShipment}>
                  {t("retry")}
                </Button>
              </div>
            </div>
          ) : (
            shipment && (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                <section className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">{t("snapshot")}</CardTitle>
                        <CardDescription className="flex items-center gap-3">
                          <span>{t("status")}</span>
                          <Badge variant={badgeVariant} className="text-xs px-2 py-1 uppercase font-bold">
                            {shipment.status || "pending"}
                          </Badge>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("code")}</p>
                        <p className="font-mono text-sm">{shipment.code || shipment.id}</p>
                      </div>
                      {shipment.confirmation_code && (
                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg border border-primary/20">
                          <p className="text-xs text-primary font-bold uppercase tracking-wide">{t("confirmationCode")}</p>
                          <p className="font-mono text-lg font-bold text-primary tracking-wider">{shipment.confirmation_code}</p>
                        </div>
                      )}
                      <div className="grid gap-4 border-t border-border/40 pt-4 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground">{t("created")}</p>
                          <p>{createdTimestamp}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground">{t("lastUpdated")}</p>
                          <p>{lastUpdatedTimestamp}</p>
                        </div>
                        {merchantInfo?.company_name && (
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground">{t("merchant")}</p>
                            <p className="text-sm text-foreground">{merchantInfo.company_name}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                      <CardFooter className="justify-end space-x-3">
                        <Button variant="ghost" size="sm" onClick={refreshShipment}>
                          {t("refresh")}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isDeleting}
                            >
                              {isDeleting ? t("cancelling") : t("cancel")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl">{t("cancelDialog.title")}</AlertDialogTitle>
                              <div className="text-sm text-muted-foreground">
                                {t("cancelDialog.desc")}
                                <ul className="mt-3 space-y-2 list-disc list-inside text-xs">
                                  {(t("cancelDialog.list") as string[]).map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                                <div className="mt-4 space-y-2">
                                  <label htmlFor="cancel-remark" className="text-xs font-semibold text-foreground">
                                    {t("cancelDialog.remarkLabel")}
                                  </label>
                                  <Textarea
                                    id="cancel-remark"
                                    placeholder={t("cancelDialog.remarkPlaceholder")}
                                    className="bg-background/50 h-20 text-xs"
                                    value={cancelRemark}
                                    onChange={(e) => setCancelRemark(e.target.value)}
                                  />
                                </div>
                              </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-3">
                              <AlertDialogCancel className="rounded-2xl border-border/40 hover:bg-muted/50 transition-colors">
                                {t("cancelDialog.keep")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleCancel}
                                className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                              >
                                {t("cancelDialog.confirm")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">{t("locations")}</CardTitle>
                        <CardDescription>{t("locations")}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start justify-between">
                        <p className="text-xs text-muted-foreground">{t("pickup")}</p>
                        <p className="text-right text-foreground max-w-[280px]">{shipment.start_address || "—"}</p>
                      </div>
                      <div className="flex items-start justify-between border-t border-border/30 pt-3">
                        <p className="text-xs text-muted-foreground">{t("destination")}</p>
                        <p className="text-right text-foreground max-w-[280px]">{shipment.end_address || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">{t("package")}</CardTitle>
                        <CardDescription>{t("package")}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid gap-1">
                        <p className="text-xs font-semibold text-muted-foreground">{t("recipient")}</p>
                        <p>{formValues.recipient_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{t("phone")}</p>
                        <p>{formValues.recipient_phone || "—"}</p>
                      </div>
                      <div className="grid gap-1 border-t border-border/30 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground">{t("notes")}</p>
                        <p>{formValues.description || "—"}</p>
                      </div>
                      <div className="grid gap-1 border-t border-border/30 pt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("items")}</span>
                          <span className="text-foreground">{formattedItems}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("weight")}</span>
                          <span className="text-foreground">{shipment.weight_kg ? `${shipment.weight_kg} kg` : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("dimensions")}</span>
                          <span className="text-foreground">{shipment.dimensions || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("fee")}</span>
                          <span className="text-foreground">
                            {shipment.total_fee ? `${shipment.total_fee}` : "—"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">{t("carrier")}</CardTitle>
                        <CardDescription>{t("carrier")}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{t("recipient")}</p>
                        <p className="text-foreground">{courierCompany?.company_name || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <p>{tRegister("fields.address")}</p>
                        <p className="text-right max-w-[220px]">{courierCompany?.company_address || "—"}</p>
                      </div>
                      <div className="grid gap-1 border-t border-border/30 pt-3 text-xs text-muted-foreground">
                        <p>{t("phone")}: {courierCompany?.phone_number || "—"}</p>
                        <p>{tRegister("fields.email")}: {courierCompany?.email || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="space-y-6">
                  {shipment && (
                    <Card className={cn(
                      "transition-opacity duration-300",
                      !(["pending", "courier_assigned", "assigned_to_courier"].includes(shipment.status?.toLowerCase() || "")) && "opacity-60 pointer-events-none"
                    )}>
                      <CardHeader>
                        <div>
                          <CardTitle className="text-xl">{t("updateTitle")}</CardTitle>
                          <CardDescription>
                            {["pending", "courier_assigned", "assigned_to_courier"].includes(shipment.status?.toLowerCase() || "") 
                              ? t("updateSubtitle")
                              : t("cannotUpdate")}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid gap-3">
                          <label className="text-xs text-muted-foreground">{t("pickup")}</label>
                          <Input
                            value={formValues.start_address}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, start_address: event.target.value }))
                            }
                          />
                        </div>
                        <div className="grid gap-3">
                          <label className="text-xs text-muted-foreground">{t("destination")}</label>
                          <Input
                            value={formValues.end_address}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, end_address: event.target.value }))
                            }
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="grid gap-3">
                            <label className="text-xs text-muted-foreground">{t("recipient")}</label>
                            <Input
                              value={formValues.recipient_name}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, recipient_name: event.target.value }))
                              }
                            />
                          </div>
                          <div className="grid gap-3">
                            <label className="text-xs text-muted-foreground">{t("phone")}</label>
                            <Input
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/20 pt-4">
                          <div className="grid gap-3">
                            <label className="text-xs text-muted-foreground">{t("weight")} (kg)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formValues.weight_kg}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, weight_kg: event.target.value }))
                              }
                            />
                          </div>
                          <div className="grid gap-3">
                            <label className="text-xs text-muted-foreground">{t("dimensions")}</label>
                            <Input
                              placeholder="e.g. 1m X 20cm X 20cm"
                              value={formValues.dimensions}
                              onChange={(event) =>
                                setFormValues((prev) => ({ ...prev, dimensions: event.target.value }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 border-t border-border/20 pt-4">
                          <label className="text-xs text-muted-foreground">{t("items")}</label>
                          <Input
                            placeholder="Item 1, Item 2, Item 3"
                            value={formValues.items}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, items: event.target.value }))
                            }
                          />
                        </div>

                        <div className="grid gap-3 border-t border-border/20 pt-4">
                          <label className="text-xs text-muted-foreground">{t("notes")}</label>
                          <Textarea
                            className="h-24"
                            value={formValues.description}
                            onChange={(event) =>
                              setFormValues((prev) => ({ ...prev, description: event.target.value }))
                            }
                          />
                        </div>
                        {statusMessage && (
                          <p className="text-xs text-foreground/80">{statusMessage}</p>
                        )}
                        {actionError && (
                          <p className="text-xs text-destructive font-medium">{actionError}</p>
                        )}
                      </CardContent>
                      <CardFooter className="justify-between flex-col gap-3 sm:flex-row">
                        <div className="text-xs text-muted-foreground">
                          {t("lastUpdated")} {lastUpdatedTimestamp}
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={handleUpdate} 
                          disabled={isUpdating || !(["pending", "courier_assigned", "assigned_to_courier"].includes(shipment.status?.toLowerCase() || ""))}
                        >
                          {isUpdating ? t("saving") : t("save")}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}

                  <Card className="space-y-4">
                    <CardHeader>
                      <CardTitle className="text-lg">{t("actions")}</CardTitle>
                      <CardDescription>{t("actionsSubtitle")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" onClick={refreshShipment} variant="secondary">
                        {t("refreshDetails")}
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => router.push("/merchant/shipments/new")}
                        disabled={isUpdating || isDeleting || isGeneratingCode}
                      >
                        {t("newShipment")}
                      </Button>
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={handleGenerateConfirmationCode}
                        disabled={isGeneratingCode || isUpdating || isDeleting || !!shipment.confirmation_code}
                      >
                        {isGeneratingCode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("generating")}
                          </>
                        ) : shipment.confirmation_code ? (
                          t("codeGenerated")
                        ) : (
                          t("generateCode")
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/70">
                    <CardHeader>
                      <CardTitle className="text-lg">{t("notes")}</CardTitle>
                      <CardDescription>{t("cancelDialog.desc")}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {t("cancelDialog.list")?.[0]}
                    </CardContent>
                  </Card>

                  {isDelivered && (
                    <Card className="border-primary/20 bg-primary/5 backdrop-blur-md">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-500" />
                          {t("rating.title")}
                        </CardTitle>
                        <CardDescription>
                          {t("rating.subtitle")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <StarRatingInput
                          value={ratingStars}
                          onChange={setRatingStars}
                          disabled={ratingSubmitting}
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            type="button"
                            className="rounded-xl px-8"
                            disabled={ratingStars < 1 || ratingSubmitting}
                            onClick={handleSubmitRating}
                          >
                            {ratingSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t("rating.submitting")}
                              </>
                            ) : (
                              t("rating.submit")
                            )}
                          </Button>
                          {ratingStars > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {t("rating.scoreHint", { score: (ratingStars * 2).toString() })}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
