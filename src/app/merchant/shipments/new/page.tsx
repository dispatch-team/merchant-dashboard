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
  Link2,
  List,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getPartnerCouriers, CourierProfile } from "@/lib/couriers";
import { createShipment } from "@/lib/shipments";
import { toast } from "sonner";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { useI18n } from "@/intl";

interface FormFields {
  courier_company_id: string;
  start_address: string;
  end_address: string;
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


function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

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

  // Load partner couriers only (merchants may ship via partnered carriers)
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

  // Re-validate on field change if field was touched
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

  // Also re-run weight validation when courier changes
  useEffect(() => {
    if (touched.weight_kg) {
      revalidate(fields);
    }
    // Also revalidate courier field on change
    if (touched.courier_company_id) {
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
      // Recompute errors for the changed field immediately
      const errs = validate(updated, selectedCourier, t);
      setErrors((prev) => ({
        ...prev,
        [name]: errs[name as keyof FormErrors],
      }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(fields, selectedCourier, t);
    setErrors((prev) => ({
      ...prev,
      [name]: errs[name as keyof FormErrors],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Touch all fields to surface errors
    const allTouched: Partial<Record<keyof FormFields, boolean>> = {};
    (Object.keys(fields) as (keyof FormFields)[]).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    const errs = validate(fields, selectedCourier, t);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error(tAuth("sessionExpired"));
        return;
      }

      // Build description: include recipient info
      const fullDescription = [
        fields.description.trim(),
        `${t("fields.recipient")}: ${fields.recipient_name.trim()}`,
        `${t("fields.phone")}: ${fields.recipient_phone.trim()}`,
      ]
        .filter(Boolean)
        .join(" | ");

      // Parse items
      const items = fields.items
        ? fields.items
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [];

      const courierId = parseInt(fields.courier_company_id, 10);
      const payload: Record<string, unknown> = {
        courier_company_id: courierId,
        CourierCompanyID: courierId, // Extra safety: some backend versions expect PascalCase
        merchant_user_id: user?.sub ?? "",
        start_address: fields.start_address.trim(),
        end_address: fields.end_address.trim(),
        description: fullDescription,
        items,
      };


      if (fields.weight_kg) payload.weight_kg = parseFloat(fields.weight_kg);
      if (fields.dimensions.trim()) payload.dimensions = fields.dimensions.trim();


      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <header className="relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/merchant")}
                className="h-8 w-8 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={dispatchLogo.src} alt="Dispatch" className="h-7 w-auto" />
                <span className="text-xs text-muted-foreground/50 font-medium uppercase tracking-widest hidden sm:block">
                  {t("breadcrumb")}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-6 py-10">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              {t("subtitle")}
            </p>
          </div>

          {/* ── Success banner ─────────────────────────────── */}
          {createdShipment && (
            <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t("successTitle")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t("successDesc", { status: createdShipment.status })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {t("shipmentId")}:{" "}
                    <span className="text-foreground font-semibold">
                      {createdShipment.id}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 ml-14 sm:ml-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  onClick={() => {
                    setCreatedShipment(null);
                    setFields(INITIAL_FIELDS);
                    setErrors({});
                    setTouched({});
                  }}
                >
                  {t("title")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/merchant")}
                >
                  {t("dashboard")}
                </Button>
              </div>
            </div>
          )}

          {/* ── Form card ──────────────────────────────────── */}
          {!createdShipment && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm divide-y divide-border/30 overflow-hidden">

                {/* ── Section: Courier ── */}
                <FormSection title={t("sections.courier")} icon={<Truck className="h-4 w-4 text-primary" />}>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      {t("fields.partnerCourier")} <span className="text-destructive">*</span>
                    </label>
                    {couriersLoading ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-border/40 bg-background/40">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                        <span className="text-sm text-muted-foreground/60">{t("fields.loadingCouriers")}</span>
                      </div>
                    ) : couriersError ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-destructive/30 bg-destructive/5">
                        <AlertCircle className="h-4 w-4 text-destructive/70" />
                        <span className="text-sm text-destructive/80">{couriersError}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <select
                            name="courier_company_id"
                            value={fields.courier_company_id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={couriers.length === 0}
                            className={`w-full appearance-none h-10 pl-3 pr-10 rounded-xl border text-sm bg-background/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 ${
                              errors.courier_company_id
                                ? "border-destructive/50 bg-destructive/5"
                                : "border-border/40 focus:border-primary/40"
                            }`}
                          >
                            <option value="">
                              {couriers.length === 0
                                ? t("fields.noCouriers")
                                : t("fields.chooseCourier")}
                            </option>
                            {couriers.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                {c.company_name} — {t("fields.maxWeightHint", { weight: c.max_weight })}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                        </div>
                        {couriers.length === 0 ? (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {t("noCouriersDesc_part1")}
                            <Link
                              href="/merchant/couriers"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              {tNav("couriers")}
                            </Link>
                            {t("noCouriersDesc_part2")}
                          </p>
                        ) : null}
                      </div>
                    )}
                    <FieldError message={errors.courier_company_id} />
                    {selectedCourier && (
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        {t("fields.basePrice")} {tDashboard("latestDeparture.currency")}{selectedCourier.base_price.toFixed(2)} · {t("fields.maxWeight")} {selectedCourier.max_weight} kg
                      </p>
                    )}
                  </div>
                </FormSection>

                {/* ── Section: Addresses ── */}
                <FormSection title={t("sections.addresses")} icon={<MapPin className="h-4 w-4 text-primary" />}>
                  <div className="space-y-4">
                    <FormField
                      label={t("fields.pickupAddress")}
                      required
                      name="start_address"
                      placeholder="e.g. Bole Road, Addis Ababa"
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      value={fields.start_address}
                      error={errors.start_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <FormField
                      label={t("fields.destinationAddress")}
                      required
                      name="end_address"
                      placeholder="e.g. Piassa, Addis Ababa"
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      value={fields.end_address}
                      error={errors.end_address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </FormSection>

                {/* ── Section: Recipient ── */}
                <FormSection title={t("sections.recipient")} icon={<User className="h-4 w-4 text-primary" />}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      label={t("fields.recipientName")}
                      required
                      name="recipient_name"
                      placeholder="Full name"
                      icon={<User className="h-3.5 w-3.5" />}
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
                      icon={<Phone className="h-3.5 w-3.5" />}
                      value={fields.recipient_phone}
                      error={errors.recipient_phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      type="tel"
                    />
                  </div>
                </FormSection>

                {/* ── Section: Package ── */}
                <FormSection title={t("sections.package")} icon={<Package className="h-4 w-4 text-primary" />}>
                  <div className="space-y-4">
                    <FormField
                      label={t("fields.packageDescription")}
                      required
                      name="description"
                      placeholder="Describe what's being shipped"
                      icon={<FileText className="h-3.5 w-3.5" />}
                      value={fields.description}
                      error={errors.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      multiline
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        label={t("fields.weight")}
                        name="weight_kg"
                        placeholder="e.g. 3.5"
                        icon={<Weight className="h-3.5 w-3.5" />}
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
                        icon={<Ruler className="h-3.5 w-3.5" />}
                        value={fields.dimensions}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        hint={t("fields.optional")}
                      />
                    </div>
                    <FormField
                      label={t("fields.items")}
                      name="items"
                      placeholder="Item 1, Item 2, Item 3"
                      icon={<List className="h-3.5 w-3.5" />}
                      value={fields.items}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hint={t("fields.commaSeparated")}
                    />
                  </div>
                </FormSection>


              </div>

              {/* ── Submit ── */}
              <div className="mt-6 flex items-center gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/merchant")}
                  className="text-muted-foreground"
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || couriersLoading || couriers.length === 0}
                  className="gap-2 min-w-[150px] shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      {t("create")}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

// ── Sub-components ────────────────────────────────────────────

function FormSection({
  title,
  icon,
  children,
  collapsible = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const t = useI18n("newShipment");
  const [open, setOpen] = useState(!collapsible);

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={`flex items-center gap-2.5 mb-5 w-full text-left ${collapsible ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {collapsible && (
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground/50 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
        {collapsible && !open && (
          <span className="text-xs text-muted-foreground/50 ml-auto mr-6">{t("fields.optional")}</span>
        )}
      </button>
      {open && <div>{children}</div>}
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
  const inputCls = `w-full ${icon ? "pl-9" : "pl-3"} pr-3 rounded-xl border text-sm bg-background/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
    hasError
      ? "border-destructive/50 bg-destructive/5 focus:ring-destructive/20"
      : "border-border/40 focus:border-primary/40"
  }`;

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        {label}{" "}
        {required && <span className="text-destructive">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none">
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
            className={`${inputCls} py-2.5 resize-none`}
            style={icon ? { paddingLeft: "2.25rem" } : {}}
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
            className={`${inputCls} h-10`}
          />
        )}
      </div>

      {hasError && <FieldError message={error} />}
      {!hasError && hint && (
        <p className="text-xs text-muted-foreground/60 mt-1">{hint}</p>
      )}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
      <p className="text-xs text-destructive">{message}</p>
    </div>
  );
}
