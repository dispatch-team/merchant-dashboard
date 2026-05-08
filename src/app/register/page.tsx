"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Package, Truck, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { registerMerchant, type AuthError } from "@/lib/auth";
import { useI18n } from "@/intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

const isValidPhone = (phone: string) => /^\+251\d{9}$/.test(phone.trim());

export default function RegisterPage() {
  const t = useI18n("register");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    companyAddress: "",
    industry: "",
    description: "",
    phone: "",
    email: "",
    websiteUrl: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.firstName.trim()) errors.firstName = t("validation.firstName");
    if (!formData.lastName.trim()) errors.lastName = t("validation.lastName");
    if (!formData.companyName.trim()) errors.companyName = t("validation.businessName");
    if (!formData.companyAddress.trim()) errors.companyAddress = t("validation.address");
    if (!formData.industry.trim()) errors.industry = t("validation.industry");
    if (!formData.phone.trim()) {
      errors.phone = t("validation.phoneRequired");
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = t("validation.phoneInvalid");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = t("validation.emailInvalid");
    }

    if (formData.password.length < 8) {
      errors.password = t("validation.passwordShort");
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("validation.passwordMismatch");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload: Record<string, string> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName,
        company_address: formData.companyAddress,
        industry: formData.industry,
        phone_number: formData.phone,
        email: formData.email,
        password: formData.password,
      };
      if (formData.description) payload.description = formData.description;
      if (formData.websiteUrl) payload.website_url = formData.websiteUrl;

      const resp = await registerMerchant(payload);
      const merchantData = resp?.data ?? resp;
      toast.success(t("success"), {
        description: `Merchant ID: ${merchantData?.id ?? 'N/A'} · Status: ${merchantData?.status ?? 'PENDING'}. Redirecting to login...`,
      });
      setTimeout(() => router.push("/login/merchant"), 2000);
    } catch (err) {
      const authErr = err as AuthError;
      const msg = authErr.message || "Something went wrong. Please try again.";
      
      if (msg === "a user with this email already exists" || msg.toLowerCase().includes("email")) {
        setFieldErrors({ email: msg });
      } else if (msg.toLowerCase().includes("password")) {
        setFieldErrors({ password: msg });
      } else if (msg.toLowerCase().includes("phone")) {
        setFieldErrors({ phone: msg });
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { icon: Package, title: t("steps.account.title"), desc: t("steps.account.desc") },
    { icon: Truck, title: t("steps.courier.title"), desc: t("steps.courier.desc") },
    { icon: BarChart3, title: t("steps.shipping.title"), desc: t("steps.shipping.desc") },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative max-w-md text-center px-8">
          <img src={dispatchLogo.src} alt="Dispatch" className="h-32 w-auto mx-auto mb-10 drop-shadow-[0_0_30px_hsl(270,70%,60%,0.2)]" />
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            {t("subtitle")}
          </p>
          <div className="space-y-4 text-left">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-4 bg-card/40 rounded-xl border border-border/30 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex max-h-screen overflow-y-auto items-start justify-center p-6 relative">
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {useI18n("login")("back")}
          </Link>
          <div className="flex items-center gap-0.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="w-full max-w-sm mt-12 mb-12">
          <Link href="/" className="lg:hidden flex justify-center mb-8">
            <img src={dispatchLogo.src} alt="Dispatch" className="h-24 w-auto" />
          </Link>

          <h1 className="text-xl font-bold text-foreground mb-1 tracking-tight">{t("headline")}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t("subheadline")}
          </p>

          {error && (
            <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 mb-6 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs text-muted-foreground">{t("fields.firstName")}</Label>
                <Input id="firstName" placeholder={t("placeholders.firstName")} value={formData.firstName} onChange={handleChange("firstName")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.firstName ? "border-destructive/60" : ""}`} />
                {fieldErrors.firstName && <p className="text-xs text-destructive">{fieldErrors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs text-muted-foreground">{t("fields.lastName")}</Label>
                <Input id="lastName" placeholder={t("placeholders.lastName")} value={formData.lastName} onChange={handleChange("lastName")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.lastName ? "border-destructive/60" : ""}`} />
                {fieldErrors.lastName && <p className="text-xs text-destructive">{fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs text-muted-foreground">{t("fields.businessName")}</Label>
              <Input id="companyName" placeholder={t("placeholders.businessName")} value={formData.companyName} onChange={handleChange("companyName")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.companyName ? "border-destructive/60" : ""}`} />
              {fieldErrors.companyName && <p className="text-xs text-destructive">{fieldErrors.companyName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress" className="text-xs text-muted-foreground">{t("fields.address")}</Label>
              <Input id="companyAddress" placeholder={t("placeholders.address")} value={formData.companyAddress} onChange={handleChange("companyAddress")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.companyAddress ? "border-destructive/60" : ""}`} />
              {fieldErrors.companyAddress && <p className="text-xs text-destructive">{fieldErrors.companyAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-xs text-muted-foreground">{t("fields.industry")}</Label>
                <Input id="industry" placeholder={t("placeholders.industry")} value={formData.industry} onChange={handleChange("industry")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.industry ? "border-destructive/60" : ""}`} />
                {fieldErrors.industry && <p className="text-xs text-destructive">{fieldErrors.industry}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs text-muted-foreground">{t("fields.phone")}</Label>
                <Input id="phone" type="tel" placeholder={t("placeholders.phone")} value={formData.phone} onChange={handleChange("phone")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.phone ? "border-destructive/60" : ""}`} />
                {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">{t("fields.email")}</Label>
              <Input id="email" type="email" placeholder={t("placeholders.email")} value={formData.email} onChange={handleChange("email")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.email ? "border-destructive/60" : ""}`} />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-xs text-muted-foreground">{t("fields.website")}</Label>
              <Input id="websiteUrl" type="url" placeholder={t("placeholders.website")} value={formData.websiteUrl} onChange={handleChange("websiteUrl")} className="h-11 rounded-xl bg-card border-border/60 focus:border-primary/40" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs text-muted-foreground">{t("fields.description")}</Label>
              <textarea id="description" placeholder={t("placeholders.description")} value={formData.description} onChange={handleChange("description")} className="w-full flex min-h-[80px] rounded-xl bg-card border border-border/60 focus:border-primary/40 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs text-muted-foreground">{t("fields.password")}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange("password")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 pr-10 ${fieldErrors.password ? "border-destructive/60" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">{t("fields.confirmPassword")}</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} className={`h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 ${fieldErrors.confirmPassword ? "border-destructive/60" : ""}`} />
                {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl mt-4" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("creating")}
                </span>
              ) : (
                t("button")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login/merchant" className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
