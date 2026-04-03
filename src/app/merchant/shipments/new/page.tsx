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
  return /^[+\d\s\-().]{7,20}$/.test(phone.trim());
}

function validate(
  fields: FormFields,
  selectedCourier: CourierProfile | null
): FormErrors {
  const errors: FormErrors = {};

  if (!fields.courier_company_id || parseInt(fields.courier_company_id, 10) <= 0)
    errors.courier_company_id = "Please select a valid partner courier.";


  if (!fields.start_address.trim())
    errors.start_address = "Pickup address is required.";

  if (!fields.end_address.trim())
    errors.end_address = "Destination address is required.";

  if (!fields.recipient_name.trim())
    errors.recipient_name = "Recipient name is required.";

  if (!fields.recipient_phone.trim()) {
    errors.recipient_phone = "Recipient phone number is required.";
  } else if (!isValidPhone(fields.recipient_phone)) {
    errors.recipient_phone = "Enter a valid phone number.";
  }

  if (!fields.description.trim())
    errors.description = "Package description is required.";

  if (fields.weight_kg) {
    const w = parseFloat(fields.weight_kg);
    if (isNaN(w) || w <= 0) {
      errors.weight_kg = "Weight must be a positive number.";
    } else if (selectedCourier && w > selectedCourier.max_weight) {
      errors.weight_kg = `Weight exceeds ${selectedCourier.company_name}'s maximum of ${selectedCourier.max_weight} kg.`;
    }
  }



  return errors;
}

export default function NewShipmentPage() {
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
          err instanceof Error ? err.message : "Failed to load partner couriers.";
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
      const errs = validate(updated, selectedCourier);
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
    [selectedCourier, touched]
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
      const errs = validate(updated, selectedCourier);
      setErrors((prev) => ({
        ...prev,
        [name]: errs[name as keyof FormErrors],
      }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(fields, selectedCourier);
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

    const errs = validate(fields, selectedCourier);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      // Build description: include recipient info
      const fullDescription = [
        fields.description.trim(),
        `Recipient: ${fields.recipient_name.trim()}`,
        `Phone: ${fields.recipient_phone.trim()}`,
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
      toast.success("Shipment created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
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
                  Merchant / New Shipment
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
              <h1 className="text-2xl font-bold tracking-tight">New Shipment</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Fill in the details below to book a new delivery.
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
                  <p className="font-semibold text-foreground">Shipment Created!</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Your shipment has been booked with status{" "}
                    <span className="font-medium text-foreground capitalize">
                      {createdShipment.status}
                    </span>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    Shipment ID:{" "}
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
                  New Shipment
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/merchant")}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* ── Form card ──────────────────────────────────── */}
          {!createdShipment && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm divide-y divide-border/30 overflow-hidden">

                {/* ── Section: Courier ── */}
                <FormSection title="Courier" icon={<Truck className="h-4 w-4 text-primary" />}>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Partner courier <span className="text-destructive">*</span>
                    </label>
                    {couriersLoading ? (
                      <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-border/40 bg-background/40">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50" />
                        <span className="text-sm text-muted-foreground/60">Loading partner couriers…</span>
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
                                ? "No partner couriers yet"
                                : "-- Choose a partner courier --"}
                            </option>
                            {couriers.map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                {c.company_name} — max {c.max_weight} kg
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                        </div>
                        {couriers.length === 0 ? (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Add carriers as partners on the{" "}
                            <Link
                              href="/merchant/couriers"
                              className="font-medium text-primary underline-offset-2 hover:underline"
                            >
                              Couriers
                            </Link>{" "}
                            page to assign shipments to them.
                          </p>
                        ) : null}
                      </div>
                    )}
                    <FieldError message={errors.courier_company_id} />
                    {selectedCourier && (
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Base price ${selectedCourier.base_price.toFixed(2)} · Max weight {selectedCourier.max_weight} kg
                      </p>
                    )}
                  </div>
                </FormSection>

                {/* ── Section: Addresses ── */}
                <FormSection title="Addresses" icon={<MapPin className="h-4 w-4 text-primary" />}>
                  <div className="space-y-4">
                    <FormField
                      label="Pickup Address"
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
                      label="Destination Address"
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
                <FormSection title="Recipient" icon={<User className="h-4 w-4 text-primary" />}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      label="Recipient Name"
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
                      label="Recipient Phone"
                      required
                      name="recipient_phone"
                      placeholder="+251 911 000 000"
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
                <FormSection title="Package Details" icon={<Package className="h-4 w-4 text-primary" />}>
                  <div className="space-y-4">
                    <FormField
                      label="Package Description"
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
                        label="Weight (kg)"
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
                            ? `Max ${selectedCourier.max_weight} kg for this courier`
                            : "Optional"
                        }
                      />
                      <FormField
                        label="Dimensions"
                        name="dimensions"
                        placeholder="e.g. 1m X 20cm X 20cm"
                        icon={<Ruler className="h-3.5 w-3.5" />}
                        value={fields.dimensions}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        hint="Optional"
                      />
                    </div>
                    <FormField
                      label="Items"
                      name="items"
                      placeholder="Item 1, Item 2, Item 3"
                      icon={<List className="h-3.5 w-3.5" />}
                      value={fields.items}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      hint="Comma-separated list of items. Optional."
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || couriersLoading || couriers.length === 0}
                  className="gap-2 min-w-[150px] shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      Create Shipment
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
          <span className="text-xs text-muted-foreground/50 ml-auto mr-6">Optional</span>
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
