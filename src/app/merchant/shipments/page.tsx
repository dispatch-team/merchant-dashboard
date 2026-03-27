"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Search, ChevronLeft, ChevronRight, Loader2, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getShipments, ShipmentListResponse, ShipmentResponse } from "@/lib/shipments";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import dispatchLogo from "@/assets/dispatch-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";

export default function ShipmentsListPage() {
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<ShipmentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  useEffect(() => {
    fetchShipments(page);
  }, [page]);

  const fetchShipments = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const response = await getShipments(token, {
        page: currentPage,
        page_size: pageSize,
        merchant_user_id: user?.sub,
      });
      setData(response);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load shipments:", err);
      setError(err.message || "Failed to load shipments");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil((data.total || 0) / (data.page_size || 10))) : 1;

  const columns = [
    {
      key: "id",
      header: "Shipment ID",
      render: (item: ShipmentResponse) => {
        const idStr = String(item.id ?? "N/A");
        return <span className="font-mono text-xs">{idStr.length > 8 ? idStr.slice(0, 8) + "..." : idStr}</span>;
      },
    },
    {
      key: "start_address",
      header: "Pickup",
      className: "truncate max-w-[150px]",
    },
    {
      key: "end_address",
      header: "Destination",
      className: "truncate max-w-[150px]",
    },
    {
      key: "status",
      header: "Status",
      render: (item: ShipmentResponse) => {
        let variant = "default";
        if (item.status === "Pending") variant = "warning";
        else if (item.status === "Delivered") variant = "success";
        else if (item.status === "Cancelled") variant = "destructive";
        
        return (
          <Badge variant={variant as any} className="capitalize font-medium text-[10px] px-2 py-0">
            {item.status || "Pending"}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      header: "Created At",
      render: (item: ShipmentResponse) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

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
                  Merchant / Shipments
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <List className="h-4 w-4 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
              </div>
              <p className="text-muted-foreground mt-1 ml-12">Track and manage all your delivery requests.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                <Input 
                  placeholder="Search tracking ID..." 
                  className="pl-9 bg-card/40 border-border/40 focus:bg-card/60 transition-all"
                />
              </div>
              <Button 
                onClick={() => router.push("/merchant/shipments/new")} 
                className="gap-2 shadow-sm shadow-primary/20 hover:shadow-primary/30"
              >
                <Package className="h-4 w-4" />
                New Shipment
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading shipments...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-destructive/20 rounded-3xl bg-destructive/5 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-destructive/60" />
              </div>
              <h3 className="text-lg font-medium text-destructive">Failed to load shipments</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{error}</p>
              <Button onClick={() => fetchShipments(page)} variant="outline" className="border-destructive/20 hover:bg-destructive/10">
                Try Again
              </Button>
            </div>
          ) : !data || !data.shipments || data.shipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/20 rounded-3xl bg-card/20 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-medium">No shipments found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't created any shipments yet.</p>
              <Button onClick={() => router.push("/merchant/shipments/new")} variant="outline">
                Book your first shipment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <DataTable
                columns={columns}
                data={data.shipments || []}
                keyExtractor={(item) => item.id}
              />
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {((data.page - 1) * data.page_size) + 1} to {Math.min(data.page * data.page_size, data.total)} of {data.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 gap-1 pl-2.5 bg-card/40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </Button>
                    <div className="text-sm font-medium px-4">
                      {page} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="h-8 gap-1 pr-2.5 bg-card/40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
