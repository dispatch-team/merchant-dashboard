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
  Mail, 
  Globe, 
  Camera,
  Loader2,
  Save,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  const router = useRouter();
  
  const [profile, setProfile] = useState<NormalizedMerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If user picked a new file locally → show data URL preview
  // Otherwise → build the API URL and attach token query param for secure image fetch
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
      toast.error("Failed to load profile");
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

      const formData = new FormData();
      
      const fields = [
        "first_name",
        "last_name",
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
        toast.success(t("success"));
        setLogoFile(null);
        fetchProfile();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(merchantApiErrorMessage(errorData) || t("error"));
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(t("error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["merchant"]} loginPath="/login/merchant">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Background blobs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[350px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        {/* Header */}
        <header className="relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
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
                  Merchant
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                      <Input 
                        id="first_name" 
                        className="pl-9 bg-background/50"
                        value={profile?.first_name || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, first_name: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                      <Input 
                        id="last_name" 
                        className="pl-9 bg-background/50"
                        value={profile?.last_name || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, last_name: e.target.value } : null)}
                      />
                    </div>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/40 pt-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/40">
                      {displayedLogoUrl ? (
                        <img src={displayedLogoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="h-10 w-10 text-primary/40" />
                      )}
                      <div 
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
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
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-sm font-medium">{t("companyLogo")}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Recommended: Square JPG or PNG, max 2MB.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8"
                    >
                      {logoPreview ? t("changeLogo") : t("uploadLogo")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">{t("companyName")}</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                      <Input 
                        id="company_name" 
                        className="pl-9 bg-background/50"
                        value={profile?.company_name || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, company_name: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">{t("industry")}</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                      <Input 
                        id="industry" 
                        className="pl-9 bg-background/50"
                        value={profile?.industry || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, industry: e.target.value } : null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_address">{t("companyAddress")}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                    <Input 
                      id="company_address" 
                      className="pl-9 bg-background/50"
                      value={profile?.company_address || ""} 
                      onChange={(e) => setProfile(p => p ? { ...p, company_address: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                    <Textarea 
                      id="description" 
                      className="pl-9 bg-background/50 min-h-[100px]"
                      value={profile?.description || ""} 
                      onChange={(e) => setProfile(p => p ? { ...p, description: e.target.value } : null)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">{t("phoneNumber")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                      <Input 
                        id="phone_number" 
                        type="tel"
                        inputMode="tel"
                        placeholder="+251 9xx xxx xxx"
                        className="pl-9 bg-background/50"
                        value={profile?.phone_number || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, phone_number: e.target.value } : null)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website_url">{t("websiteUrl")}</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                      <Input 
                        id="website_url" 
                        type="url"
                        className="pl-9 bg-background/50"
                        value={profile?.website_url || ""} 
                        onChange={(e) => setProfile(p => p ? { ...p, website_url: e.target.value } : null)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/40 flex justify-end gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.push("/merchant")}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="rounded-lg gap-2 shadow-lg shadow-primary/20 min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t("saveChanges")}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
