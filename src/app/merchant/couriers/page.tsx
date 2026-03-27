"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Truck, 
  Star, 
  ShieldCheck, 
  CircleDollarSign, 
  Scale, 
  ExternalLink, 
  Plus, 
  Check, 
  Loader2,
  Search,
  Filter,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { getAvailableCouriers, getPartnerCouriers, addPartnerCourier, CourierProfile } from "@/lib/couriers";
import { toast } from "sonner";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function CouriersPage() {
  const { getValidAccessToken } = useAuth();
  const router = useRouter();
  
  const [availableCouriers, setAvailableCouriers] = useState<CourierProfile[]>([]);
  const [partnerIds, setPartnerIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const [available, partners] = await Promise.all([
        getAvailableCouriers(token),
        getPartnerCouriers(token).catch(() => []) // Merchant service might not have this yet or error
      ]);

      setAvailableCouriers(available || []);
      setPartnerIds(new Set(partners.map(p => p.id)));
    } catch (err) {
      console.error("Failed to fetch couriers:", err);
      toast.error("Failed to load couriers. Please check if services are running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = async (courierId: number) => {
    setIsProcessing(courierId);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      await addPartnerCourier(token, courierId);
      setPartnerIds(prev => new Set(prev).add(courierId));
      toast.success("Courier added to your partners!");
    } catch (err: any) {
      console.error("Failed to add partner:", err);
      toast.error(err.message || "Failed to add courier to partners.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredCouriers = (availableCouriers || []).filter(c => 
    c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
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
                  Merchant / Couriers
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Available Couriers</h1>
              <p className="text-muted-foreground mt-1">Discover and partner with top-tier delivery networks.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input 
                  placeholder="Search couriers..." 
                  className="pl-9 bg-card/40 border-border/40 focus:bg-card/60 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 border-border/40 bg-card/40">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading courier network...</p>
            </div>
          ) : filteredCouriers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/20 rounded-3xl bg-card/20 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-medium">No couriers found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCouriers.map((courier) => (
                <CourierCard 
                  key={courier.id} 
                  courier={courier} 
                  isPartner={partnerIds.has(courier.id)}
                  isProcessing={isProcessing === courier.id}
                  onAddPartner={() => handleAddPartner(courier.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

function CourierCard({ 
  courier, 
  isPartner, 
  isProcessing,
  onAddPartner 
}: { 
  courier: CourierProfile, 
  isPartner: boolean,
  isProcessing: boolean,
  onAddPartner: () => void 
}) {
  return (
    <Card className="group border-border/40 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-xl overflow-hidden flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shadow-inner">
              {courier.company_logo_id ? (
                <img 
                  src={`/api/couriers/logo/${courier.company_logo_id}`} 
                  alt={courier.company_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                courier.company_name[0].toUpperCase()
              )}
            </div>
            <div>
              <CardTitle className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                {courier.company_name}
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none hover:bg-emerald-500/20 px-2 py-0 text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <div className="flex items-center text-amber-400 text-xs font-medium bg-amber-400/10 px-2 py-0 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 mr-1" />
                  {courier.rating_aggregate > 0 ? (courier.rating_aggregate / 1).toFixed(1) : "5.0"}
                </div>
              </div>
            </div>
          </div>
          {courier.website_url && (
            <a href={courier.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/40 hover:text-primary transition-colors mt-1">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background/40 p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Base Price</span>
            </div>
            <p className="text-base font-bold text-foreground">${courier.base_price.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-background/40 p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Max Weight</span>
            </div>
            <p className="text-base font-bold text-foreground">{courier.max_weight}kg</p>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Distance Rate</span>
            <span className="font-medium text-foreground">${courier.distance_rate.toFixed(2)}/km</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Weight Rate</span>
            <span className="font-medium text-foreground">${courier.weight_rate.toFixed(2)}/kg</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/10 bg-muted/10">
        <Button 
          className={`w-full gap-2 rounded-xl h-11 transition-all duration-300 ${
            isPartner 
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20" 
              : "shadow-lg shadow-primary/20 hover:shadow-primary/30"
          }`}
          disabled={isPartner || isProcessing}
          onClick={onAddPartner}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPartner ? (
            <>
              <Check className="h-4 w-4" />
              Partnered
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add as Partner
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
