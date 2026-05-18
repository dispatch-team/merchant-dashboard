"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Briefcase, 
  FileText, 
  Phone, 
  Globe, 
  Camera,
  Loader2,
  Save,
  User,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/intl/IntlProvider";
import { toast } from "sonner";
import dispatchLogo from "@/assets/dispatch-logo.png";
import {
  type NormalizedMerchantProfile,
  buildMerchantLogoProxyUrl,
  mergeMerchantProfileWithJwtUser,
  merchantApiErrorMessage,
} from "@/lib/merchantProfile";
import { motion } from "framer-motion";

const DEFAULT_MERCHANT_COUNTRY_CODE = "251";

const formatPhoneNumberToE164 = (value: string | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D+/g, "");
  if (!digits) return "";

  if (trimmed.startsWith("+")) {
    return `+${digits}`;
  }

  if (trimmed.startsWith("00")) {
    const withoutLeadingZeros = digits.replace(/^0+/, "");
    return withoutLeadingZeros ? `+${withoutLeadingZeros}` : "";
  }

  if (digits.length >= 11) {
    return `+${digits}`;
  }

  const localPart = digits.replace(/^0+/, "");
  const normalizedLocal = localPart || digits;
  return `+${DEFAULT_MERCHANT_COUNTRY_CODE}${normalizedLocal}`;
};

export default function ProfilePage() {
  const { user, getValidAccessToken } = useAuth();
  const t = useI18n("profile");
  const tValidation = useI18n("newShipment");
  const router = useRouter();
  
  const [profile, setProfile] = useState<NormalizedMerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayedLogoUrl =
    logoPreview ??
    buildMerchantLogoProxyUrl(profile?.company_logo_id, accessToken);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setProfile((p) => {
      if (!p) return p;
      if (p.first_name.trim() || p.last_name.trim()) return p;
      return mergeMerchantProfileWithJwtUser(p, user);
    });
  }, [user?.sub, user?.given_name, user?.family_name, user?.name]);

  const fetchProfile = async () => {
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      setAccessToken(token);

      const res = await fetch("/api/merchant/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(mergeMerchantProfileWithJwtUser(data, user));
        if (data.company_logo_id) {
          setLogoPreview(null);
        }
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(merchantApiErrorMessage(body));
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error(t("errorLoad") || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const phone = profile.phone_number?.trim();
      if (phone && !/^\+251\d{9}$/.test(phone)) {
        toast.error(tValidation("validation.phoneInvalid"));
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      
      const fields = [
        "company_name", 
        "company_address", 
        "industry", 
        "description", 
        "phone_number", 
        "website_url"
      ] as const;

      fields.forEach(field => {
        let value = profile[field];
        if (field === "phone_number") {
          value = formatPhoneNumberToE164(value);
        }

        if (value && value.trim() !== "") {
          formData.append(field, value);
        }
      });
      
      if (logoFile) {
        formData.append("company_logo", logoFile);
      }

      const email = (profile.email || user?.email || "").trim();
      if (email) {
        formData.append("email", email);
      }

      const res = await fetch("/api/merchant/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast.success(t("successUpdate"));
        setLogoFile(null);
        fetchProfile();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(merchantApiErrorMessage(errorData) || t("errorUpdate"));
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(t("errorUpdate"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-60" />
        <span className="text-sm font-semibold text-muted-foreground/65">Loading profile...</span>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["merchant"]} loginPath="/login/merchant">
      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden pb-16">
        {/* Soft layout background glows */}
        <div className="absolute top-[-10%] left-[25%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
          
          {/* CURVY INLINE HEADER (STICKY HEADER BAR REMOVED) */}
          <div className="flex items-center gap-4 mb-2 px-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/merchant")}
              className="rounded-full h-12 w-12 border-border/30 bg-background/30 hover:bg-muted/80 backdrop-blur-md shrink-0 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </Button>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 block w-fit mb-1.5 shadow-sm">
                {t("title")}
              </span>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {t("title")}
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* CARD 1: PERSONAL & COMPANY PROFILE INFO */}
            <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/65 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
              
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 mb-1">
                <User className="h-5 w-5 text-primary" />
                {t("personalInfo")}
              </h2>
              <p className="text-xs text-muted-foreground mb-6 pl-1">{t("subtitle")}</p>

              {/* Logo dropzone upload portal */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border/10 mb-6">
                <div className="relative group/logo cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-[1.75rem] bg-background/40 border-2 border-dashed border-primary/25 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover/logo:border-primary/60 shadow-inner">
                    {displayedLogoUrl ? (
                      <img
                        src={displayedLogoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover group-hover/logo:scale-105 transition-transform duration-300"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = dispatchLogo.src;
                        }}
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-primary/40" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <h3 className="text-sm font-extrabold text-foreground">{t("companyLogo")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("logoRecommended")}
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full h-9 px-4 border-border/40 font-bold shadow-sm"
                  >
                    {logoPreview ? t("changeLogo") : t("uploadLogo")}
                  </Button>
                </div>
              </div>

              {/* Input grid */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 pl-1">{t("companyName")}</Label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        id="company_name" 
                        className="rounded-full h-12 pl-11 pr-5 bg-background/30 border-border/45 focus-visible:ring-primary/20 font-bold"
                        value={profile?.company_name || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, company_name: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 pl-1">{t("industry")}</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                        id="industry" 
                        className="rounded-full h-12 pl-11 pr-5 bg-background/30 border-border/45 focus-visible:ring-primary/20 font-bold"
                        value={profile?.industry || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, industry: e.target.value } : null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 pl-1">{t("companyAddress")}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="company_address" 
                      className="rounded-full h-12 pl-11 pr-5 bg-background/30 border-border/45 focus-visible:ring-primary/20 font-bold"
                      value={profile?.company_address || ""} 
                      onChange={(e) => setProfile(p => p ? { ...p, company_address: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 pl-1">{t("description")}</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/40" />
                    <Textarea 
                      id="description" 
                      className="rounded-[1.75rem] pl-11 pr-5 py-3 bg-background/30 border-border/45 focus-visible:ring-primary/20 min-h-[120px] font-semibold"
                      value={profile?.description || ""} 
                      onChange={(e) => setProfile(p => p ? { ...p, description: e.target.value } : null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: BUSINESS CONTACT CHANNELS */}
            <div className="rounded-[2.25rem] border border-border/35 bg-card/40 hover:bg-card/65 backdrop-blur-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] relative overflow-hidden group hover:border-border/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
              
              <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2 mb-1">
                <Phone className="h-5 w-5 text-primary" />
                {t("businessInfo")}
              </h2>
              <p className="text-xs text-muted-foreground mb-6 pl-1">Configure your corporate web URLs and contact details below.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 pl-1">{t("phoneNumber")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="phone_number" 
                      type="tel"
                      inputMode="tel"
                      placeholder={t("phonePlaceholder") || "+2519xxxxxxxx"}
                      className="rounded-full h-12 pl-11 pr-5 bg-background/30 border-border/45 focus-visible:ring-primary/20 font-mono font-bold"
                      value={profile?.phone_number || ""} 
                      onChange={(e) => setProfile(p => p ? { ...p, phone_number: e.target.value } : null)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website_url" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 pl-1">{t("websiteUrl")}</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/40" />
                    <Input 
                      id="website_url" 
                      type="url"
                      className="rounded-full h-12 pl-11 pr-5 bg-background/30 border-border/45 focus-visible:ring-primary/20 font-bold"
                      value={profile?.website_url || ""} 
                      onChange={(e) => setProfile(p => p ? { ...p, website_url: e.target.value } : null)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Glass Actions Footer */}
              <div className="mt-8 border-t border-border/10 pt-6 flex justify-end gap-3.5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.push("/merchant")}
                  className="rounded-full h-12 px-6 border border-border/30 font-bold hover:bg-muted/50 transition-colors text-xs"
                >
                  {t("cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="rounded-full h-12 px-8 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/10 hover:scale-105 transition-all duration-300 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      {t("saveChanges")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
