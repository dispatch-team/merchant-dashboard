"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  User,
  Phone,
  FileText,
  Weight,
  Ruler,
  List,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
  Edit3,
  Calendar,
  Check,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getPartnerCouriers, CourierProfile } from "@/lib/couriers";
import { createShipment } from "@/lib/shipments";
import { toast } from "sonner";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { useI18n } from "@/intl";
import { AddressAutocomplete } from "@/components/AddressAutocomplete";
import { parseAddress, AutocompleteResult } from "@/lib/addresses";
import { motion, AnimatePresence } from "framer-motion";

interface FormFields {
  courier_company_id: string;
  start_address: string;
  start_latitude?: number;
  start_longitude?: number;
  start_subcity?: string;
  end_address: string;
  end_latitude?: number;
  end_longitude?: number;
  end_subcity?: string;
  recipient_name: string;
  recipient_phone: string;
  description: string;
  weight_kg: string;
  dimensions: string;
  items: string;
}

interface FormErrors {
  courier_company_id?: string;
  start_address?: string;
  end_address?: string;
  recipient_name?: string;
  recipient_phone?: string;
  description?: string;
  weight_kg?: string;
}

const INITIAL_FIELDS: FormFields = {
  courier_company_id: "",
  start_address: "",
  end_address: "",
  recipient_name: "",
  recipient_phone: "",
  description: "",
  weight_kg: "",
  dimensions: "",
  items: "",
};

function isValidPhone(phone: string) {
  return /^\+251\d{9}$/.test(phone.trim());
}

function validate(
  fields: FormFields,
  selectedCourier: CourierProfile | null,
  t: (key: string, params?: any) => string
): FormErrors {
  const errors: FormErrors = {};

  if (!fields.courier_company_id || parseInt(fields.courier_company_id, 10) <= 0)
    errors.courier_company_id = t("validation.selectCourier");

  if (!fields.start_address.trim())
    errors.start_address = t("validation.pickupRequired");

  if (!fields.end_address.trim())
    errors.end_address = t("validation.destRequired");

  if (!fields.recipient_name.trim())
    errors.recipient_name = t("validation.nameRequired");

  if (!fields.recipient_phone.trim()) {
    errors.recipient_phone = t("validation.phoneRequired");
  } else if (!isValidPhone(fields.recipient_phone)) {
    errors.recipient_phone = t("validation.phoneInvalid");
  }

  if (!fields.description.trim())
    errors.description = t("validation.descRequired");

  if (fields.weight_kg) {
    const w = parseFloat(fields.weight_kg);
    if (isNaN(w) || w <= 0) {
      errors.weight_kg = t("validation.weightPositive");
    } else if (selectedCourier && w > selectedCourier.max_weight) {
      errors.weight_kg = t("validation.weightExceeds", { name: selectedCourier.company_name, weight: selectedCourier.max_weight });
    }
  }

  return errors;
}

export default function NewShipmentPage() {
  const t = useI18n("newShipment");
  const tAuth = useI18n("auth");
  const tDetails = useI18n("shipmentDetails");
  const tNav = useI18n("nav_merchant");
  const tDashboard = useI18n("merchantDashboard");
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();

  // Wizard state: "form" | "review"
  const [step, setStep] = useState<"form" | "review">("form");

  const [couriers, setCouriers] = useState<CourierProfile[]>([]);
  const [couriersLoading, setCouriersLoading] = useState(true);
  const [couriersError, setCouriersError] = useState<string | null>(null);

  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createdShipment, setCreatedShipment] = useState<{
    id: string;
    status: string;
  } | null>(null);

  // Load partner couriers
  useEffect(() => {
    async function fetchCouriers() {
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const data = await getPartnerCouriers(token);
        setCouriers(data || []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : t("fields.loadingCouriers");
        setCouriersError(message);
      } finally {
        setCouriersLoading(false);
      }
    }
    fetchCouriers();
  }, [getValidAccessToken]);

  const selectedCourier =
    couriers.find((c) => String(c.id) === fields.courier_company_id) ?? null;

  // Revalidate on change if touched
  const revalidate = useCallback(
    (updated: FormFields) => {
      const errs = validate(updated, selectedCourier, t);
      setErrors((prev) => {
        const next: FormErrors = { ...prev };
        (Object.keys(errs) as (keyof FormErrors)[]).forEach((k) => {
          if (touched[k]) next[k] = errs[k];
        });
        (Object.keys(prev) as (keyof FormErrors)[]).forEach((k) => {
          if (!errs[k] && touched[k]) delete next[k];
        });
        return next;
      });
    },
    [selectedCourier, touched, t]
  );

  useEffect(() => {
    if (touched.weight_kg || touched.courier_company_id) {
      revalidate(fields);
    }
  }, [fields.courier_company_id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    const updated = { ...fields, [name]: value };
    setFields(updated);
    if (touched[name as keyof FormFields]) {
      const errs = validate(updated, selectedCourier, t);
      setErrors((prev) => ({
        ...prev,
        [name]: errs[name as keyof FormErrors],
      }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target as any;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(fields, selectedCourier, t);
    setErrors((prev) => ({
      ...prev,
      [name]: errs[name as keyof FormErrors],
    }));

    if ((name === "start_address" || name === "end_address") && value.trim()) {
      handleParseAddress(name as "start_address" | "end_address", value.trim());
    }
  }

  async function handleParseAddress(name: "start_address" | "end_address", address: string) {
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      const result = await parseAddress(token, address);
      if (result) {
        setFields(prev => ({
          ...prev,
          [`${name === "start_address" ? "start" : "end"}_latitude`]: result.latitude,
          [`${name === "start_address" ? "start" : "end"}_longitude`]: result.longitude,
          [`${name === "start_address" ? "start" : "end"}_subcity`]: result.subcity,
        }));
      }
    } catch (err) {
      console.error("Failed to parse address:", err);
    }
  }

  const handleAddressSelect = (name: "start_address" | "end_address", result: AutocompleteResult) => {
    const updated = { 
      ...fields, 
      [name]: result.name,
      [`${name === "start_address" ? "start" : "end"}_latitude`]: result.lat,
      [`${name === "start_address" ? "start" : "end"}_longitude`]: result.lng,
      [`${name === "start_address" ? "start" : "end"}_subcity`]: result.subcity,
    };
    setFields(updated);
    setTouched((prev) => ({ ...prev, [name]: true }));
    handleParseAddress(name, result.name);

    const errs = validate(updated, selectedCourier, t);
    setErrors((prev) => ({
      ...prev,
      [name]: errs[name as keyof FormErrors],
    }));
  };

  // Click Submit Form -> Go to Review Step
  function handleGoToReview(e: React.FormEvent) {
    e.preventDefault();
    
    // Touch all fields to make sure errors are surfaced
    const allTouched: Partial<Record<keyof FormFields, boolean>> = {};
    (Object.keys(fields) as (keyof FormFields)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const errs = validate(fields, selectedCourier, t);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please correct the errors in the form before reviewing.");
      return;
    }

    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Click Confirm -> Trigger API Booking call
  async function handleConfirmBooking() {
    setIsSubmitting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error(tAuth("sessionExpired"));
        return;
      }

      const fullDescription = [
        fields.description.trim(),
        `${t("fields.recipient")}: ${fields.recipient_name.trim()}`,
        `${t("fields.phone")}: ${fields.recipient_phone.trim()}`,
      ]
        .filter(Boolean)
        .join(" | ");

      const items = fields.items
        ? fields.items
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [];

      const courierId = parseInt(fields.courier_company_id, 10);
      
      const formattedStartAddress = fields.start_latitude && fields.start_longitude 
        ? `${fields.start_latitude}; ${fields.start_longitude}` 
        : fields.start_address.trim();
        
      const formattedEndAddress = fields.end_latitude && fields.end_longitude 
        ? `${fields.end_latitude}; ${fields.end_longitude}` 
        : fields.end_address.trim();

      const payload: Record<string, unknown> = {
        courier_company_id: courierId,
        CourierCompanyID: courierId,
        merchant_user_id: user?.sub ?? "",
        start_address: formattedStartAddress,
        start_latitude: fields.start_latitude,
        start_longitude: fields.start_longitude,
        start_subcity: fields.start_subcity,
        end_address: formattedEndAddress,
        end_address_latitude: fields.end_latitude,
        end_address_longitude: fields.end_longitude,
        end_subcity: fields.end_subcity,
        description: fullDescription,
        items,
      };

      if (fields.weight_kg) payload.weight_kg = parseFloat(fields.weight_kg);
      if (fields.dimensions.trim()) payload.dimensions = fields.dimensions.trim();

      const result = await createShipment(token, payload as any);
      setCreatedShipment({
        id: result.id ?? result.shipment_id ?? "N/A",
        status: result.status ?? "Pending",
      });
      toast.success(t("successTitle"));
    } catch (err: any) {
      toast.error(err.message || tDetails("errorUpdate"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthGuard allowedRoles={["merchant"]} loginPath="/login/merchant">
      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
        {/* Background ambient blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        {/* Clean, Transparent Header (no rectangular background, no logo, no extra text) */}
        <div className="relative z-30 max-w-4xl w-full mx-auto px-6 pt-10 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === "review") {
                setStep("form");
              } else {
                router.push("/merchant");
              }
            }}
            className="h-12 w-12 rounded-2xl border border-border/40 bg-card/30 hover:bg-muted/80 backdrop-blur-md shadow-sm text-foreground/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Stepper indicators */}
          {!createdShipment && (
            <div className="flex items-center gap-2 bg-card/30 border border-border/30 rounded-full p-1.5 backdrop-blur-md shadow-sm">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 ${step === "form" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground/80"}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-bold">1</span>
                Details
              </div>
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold tracking-wide transition-all duration-300 ${step === "review" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground/80"}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-bold">2</span>
                Confirm
              </div>
            </div>
          )}
        </div>

        {/* Content Panel */}
        <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-start">
          
          <AnimatePresence mode="wait">
            
            {/* SUCCESS BANNER STEP */}
            {createdShipment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <div className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/10 p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(16,185,129,0.15)] flex flex-col items-center text-center gap-6 max-w-2xl mx-auto relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
                  
                  <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-extrabold text-foreground tracking-tight">{t("successTitle")}</h2>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      {t("successDesc", { status: createdShipment.status })}
                    </p>
                  </div>

                  <div className="bg-background/50 border border-border/30 rounded-3xl px-6 py-4 font-mono text-sm max-w-xs w-full shadow-inner">
                    <span className="text-xs text-muted-foreground block uppercase font-bold tracking-wider mb-1">{t("shipmentId")}</span>
                    <span className="text-foreground font-extrabold text-base">{createdShipment.id}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 w-full max-w-sm justify-center">
                    <Button
                      variant="outline"
                      className="rounded-2xl border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400 h-12 flex-1 font-bold"
                      onClick={() => {
                        setCreatedShipment(null);
                        setStep("form");
                        setFields(INITIAL_FIELDS);
                        setErrors({});
                        setTouched({});
                      }}
                    >
                      {t("title")}
                    </Button>
                    <Button
                      className="rounded-2xl h-12 flex-1 font-bold bg-primary hover:bg-primary/90"
                      onClick={() => router.push("/merchant")}
                    >
                      {t("dashboard")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FORM INPUT STEP */}
            {!createdShipment && step === "form" && (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
                  </div>
                  <p className="text-muted-foreground ml-12 text-sm">
                    {t("subtitle")}
                  </p>
                </div>

                <form onSubmit={handleGoToReview} noValidate className="space-y-8">
                  <div className="rounded-[2.5rem] border border-border/40 bg-card/35 backdrop-blur-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] divide-y divide-border/25 overflow-hidden">
                    
                    {/* Courier select section */}
                    <FormSection title={t("sections.courier")} icon={<Truck className="h-4 w-4 text-primary" />}>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          {t("fields.partnerCourier")} <span className="text-destructive">*</span>
                        </label>
                        {couriersLoading ? (
                          <div className="flex items-center gap-2.5 h-12 px-4 rounded-2xl border border-border/40 bg-background/30 backdrop-blur-md">
                            <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
                            <span className="text-sm text-muted-foreground/60">{t("fields.loadingCouriers")}</span>
                          </div>
                        ) : couriersError ? (
                          <div className="flex items-center gap-2.5 h-12 px-4 rounded-2xl border border-destructive/30 bg-destructive/5">
                            <AlertCircle className="h-4 w-4 text-destructive/70" />
                            <span className="text-sm text-destructive/80">{couriersError}</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="relative">
                              <select
                                name="courier_company_id"
                                value={fields.courier_company_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={couriers.length === 0}
                                className={`w-full appearance-none h-12 pl-5 pr-12 rounded-full border text-sm bg-background/30 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                                  errors.courier_company_id
                                    ? "border-destructive/40 bg-destructive/5 focus:ring-destructive/10"
                                    : "border-border/40 focus:border-primary/40 focus:bg-background/50"
                                }`}
                              >
                                <option value="">
                                  {couriers.length === 0
                                    ? t("fields.noCouriers")
                                    : t("fields.chooseCourier")}
                                </option>
                                {couriers.map((c) => (
                                  <option key={c.id} value={String(c.id)}>
                                    {c.company_name} — Max: {c.max_weight} kg
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                            </div>
                            
                            {couriers.length === 0 && (
                              <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                                {t("noCouriersDesc_part1")}
                                <Link
                                  href="/merchant/couriers"
                                  className="font-bold text-primary hover:underline ml-1"
                                >
                                  {tNav("couriers")}
                                </Link>
                                {t("noCouriersDesc_part2")}
                              </p>
                            )}
                          </div>
                        )}
                        <FieldError message={errors.courier_company_id} />
                        
                        {selectedCourier && (
                          <div className="mt-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2 text-xs text-emerald-400 font-medium w-fit">
                            <Check className="h-3.5 w-3.5" />
                            {t("fields.basePrice")}: {tDashboard("latestDeparture.currency")}{selectedCourier.base_price.toFixed(2)} · {t("fields.maxWeight")}: {selectedCourier.max_weight} kg
                          </div>
                        )}
                      </div>
                    </FormSection>

                    {/* Routing section */}
                    <FormSection title={t("sections.addresses")} icon={<MapPin className="h-4 w-4 text-primary" />}>
                      <div className="space-y-6">
                        <AddressAutocomplete
                          label={t("fields.pickupAddress")}
                          required
                          name="start_address"
                          placeholder="Search pickup location in Addis Ababa..."
                          icon={<MapPin className="h-4 w-4" />}
                          value={fields.start_address}
                          error={errors.start_address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onSelect={(result) => handleAddressSelect("start_address", result)}
                        />
                        <AddressAutocomplete
                          label={t("fields.destinationAddress")}
                          required
                          name="end_address"
                          placeholder="Search destination location in Addis Ababa..."
                          icon={<MapPin className="h-4 w-4" />}
                          value={fields.end_address}
                          error={errors.end_address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onSelect={(result) => handleAddressSelect("end_address", result)}
                        />
                      </div>
                    </FormSection>

                    {/* Recipient section */}
                    <FormSection title={t("sections.recipient")} icon={<User className="h-4 w-4 text-primary" />}>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                          label={t("fields.recipientName")}
                          required
                          name="recipient_name"
                          placeholder="Full name"
                          icon={<User className="h-4 w-4" />}
                          value={fields.recipient_name}
                          error={errors.recipient_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <FormField
                          label={t("fields.recipientPhone")}
                          required
                          name="recipient_phone"
                          placeholder="+251911000000"
                          icon={<Phone className="h-4 w-4" />}
                          value={fields.recipient_phone}
                          error={errors.recipient_phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="tel"
                        />
                      </div>
                    </FormSection>

                    {/* Package section */}
                    <FormSection title={t("sections.package")} icon={<Package className="h-4 w-4 text-primary" />}>
                      <div className="space-y-6">
                        <FormField
                          label={t("fields.packageDescription")}
                          required
                          name="description"
                          placeholder="What details should the courier know about the contents?"
                          icon={<FileText className="h-4 w-4" />}
                          value={fields.description}
                          error={errors.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          multiline
                        />
                        <div className="grid sm:grid-cols-2 gap-6">
                          <FormField
                            label={t("fields.weight")}
                            name="weight_kg"
                            placeholder="e.g. 3.5"
                            icon={<Weight className="h-4 w-4" />}
                            value={fields.weight_kg}
                            error={errors.weight_kg}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="number"
                            step="0.1"
                            min="0"
                            hint={
                              selectedCourier
                                ? t("fields.maxWeightForCourier", { weight: String(selectedCourier.max_weight) })
                                : t("fields.optional")
                            }
                          />
                          <FormField
                            label={t("fields.dimensions")}
                            name="dimensions"
                            placeholder="e.g. 1m X 20cm X 20cm"
                            icon={<Ruler className="h-4 w-4" />}
                            value={fields.dimensions}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            hint={t("fields.optional")}
                          />
                        </div>
                        <FormField
                          label={t("fields.items")}
                          name="items"
                          placeholder="e.g. Shoes, Jeans, Jacket"
                          icon={<List className="h-4 w-4" />}
                          value={fields.items}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          hint={t("fields.commaSeparated")}
                        />
                      </div>
                    </FormSection>

                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-4 justify-end mt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => router.push("/merchant")}
                      className="text-muted-foreground rounded-2xl h-12 px-6"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={couriersLoading || couriers.length === 0}
                      className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30"
                    >
                      Review Shipment Details
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* REVIEW / CONFIRMATION STEP */}
            {!createdShipment && step === "review" && (
              <motion.div
                key="review-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Review Shipment Details</h1>
                  </div>
                  <p className="text-muted-foreground ml-12 text-sm">
                    Please review all options and inputs carefully before confirming.
                  </p>
                </div>

                <div className="rounded-[2.5rem] border border-border/40 bg-card/35 backdrop-blur-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] divide-y divide-border/25 overflow-hidden">
                  
                  {/* Courier Summary Card */}
                  <div className="p-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      Assigned Courier Partner
                    </h3>
                    
                    <div className="flex items-center gap-4 bg-background/40 border border-border/30 rounded-3xl p-5 shadow-inner">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                        {selectedCourier?.company_name.charAt(0) || "C"}
                      </div>
                      <div>
                        <span className="font-extrabold text-foreground text-lg block">{selectedCourier?.company_name}</span>
                        <span className="text-xs text-muted-foreground font-semibold">Max Weight: {selectedCourier?.max_weight} kg</span>
                      </div>
                      <div className="ml-auto text-right">
                        <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">Estimated Fee</span>
                        <span className="font-extrabold text-primary text-xl">
                          {tDashboard("latestDeparture.currency")}{selectedCourier?.base_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route Summary Card */}
                  <div className="p-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Delivery Route
                    </h3>

                    <div className="relative pl-8 border-l border-dashed border-border/60 ml-4 py-1 space-y-8">
                      {/* Origin Dot */}
                      <div className="relative">
                        <span className="absolute -left-[41px] top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border/60 shadow-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-border" />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Pickup Location</span>
                          <p className="text-sm font-semibold text-foreground">{fields.start_address}</p>
                          {fields.start_subcity && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                              {fields.start_subcity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Destination Dot */}
                      <div className="relative">
                        <span className="absolute -left-[41px] top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-primary/40 shadow-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">Destination</span>
                          <p className="text-sm font-bold text-foreground">{fields.end_address}</p>
                          {fields.end_subcity && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {fields.end_subcity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recipient summary card */}
                  <div className="p-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Recipient Information
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-background/30 border border-border/30 rounded-2xl p-4 flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground/60" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Name</span>
                          <span className="text-sm font-bold text-foreground">{fields.recipient_name}</span>
                        </div>
                      </div>

                      <div className="bg-background/30 border border-border/30 rounded-2xl p-4 flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground/60" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Phone</span>
                          <span className="text-sm font-mono font-bold text-foreground">{fields.recipient_phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package & details summary */}
                  <div className="p-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Package Specification
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-background/30 border border-border/30 rounded-2xl p-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Details & Description</span>
                        <p className="text-sm font-medium text-foreground leading-relaxed">{fields.description}</p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-background/30 border border-border/30 rounded-2xl p-4 flex items-center gap-3">
                          <Weight className="h-4 w-4 text-muted-foreground/60" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Weight</span>
                            <span className="text-sm font-bold text-foreground">{fields.weight_kg ? `${fields.weight_kg} kg` : "—"}</span>
                          </div>
                        </div>

                        <div className="bg-background/30 border border-border/30 rounded-2xl p-4 flex items-center gap-3">
                          <Ruler className="h-4 w-4 text-muted-foreground/60" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Dimensions</span>
                            <span className="text-sm font-bold text-foreground truncate max-w-[200px] block">{fields.dimensions || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {fields.items && (
                        <div className="bg-background/30 border border-border/30 rounded-2xl p-5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">Itemized Contents</span>
                          <div className="flex flex-wrap gap-2">
                            {fields.items.split(",").map((item, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                                {item.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Submit / edit controls */}
                <div className="flex items-center gap-4 justify-end mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("form")}
                    className="rounded-2xl h-12 px-6 border-border/40 bg-card/40 font-bold gap-2 text-foreground/80"
                    disabled={isSubmitting}
                  >
                    <Edit3 className="h-4 w-4" />
                    Go Back & Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="rounded-2xl h-12 px-8 font-extrabold shadow-lg shadow-primary/25 hover:shadow-primary/35 gap-2 min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Confirm & Book Delivery
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </main>
      </div>
    </AuthGuard>
  );
}

// ── Form helpers components ──

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shadow-inner">
          {icon}
        </div>
        <span className="text-sm font-extrabold uppercase tracking-widest text-foreground">{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function FormField({
  label,
  required,
  name,
  placeholder,
  icon,
  value,
  error,
  hint,
  onChange,
  onBlur,
  type = "text",
  multiline = false,
  step,
  min,
}: {
  label: string;
  required?: boolean;
  name: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  error?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  multiline?: boolean;
  step?: string;
  min?: string;
}) {
  const hasError = !!error;
  const inputCls = `w-full ${icon ? "pl-12" : "pl-5"} pr-5 ${multiline ? "rounded-3xl py-3.5" : "rounded-full h-12"} border text-sm bg-background/30 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    hasError
      ? "border-destructive/40 bg-destructive/5 focus:ring-destructive/10"
      : "border-border/40 focus:border-primary/40 focus:bg-background/50"
  }`;

  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 pl-1">
        {label}{" "}
        {required && <span className="text-destructive font-bold">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none z-10">
            {icon}
          </span>
        )}
        {multiline ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            rows={3}
            className={`${inputCls} resize-none`}
            style={icon ? { paddingLeft: "3rem" } : {}}
          />
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            step={step}
            min={min}
            className={inputCls}
          />
        )}
      </div>

      {hasError && <FieldError message={error} />}
      {!hasError && hint && (
        <p className="text-[10px] font-medium text-muted-foreground/60 mt-1.5 pl-1">{hint}</p>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 mt-2 pl-1">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <p className="text-xs font-semibold text-destructive">{message}</p>
    </div>
  );
}
