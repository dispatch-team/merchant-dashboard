"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, Filter, List, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button as UiButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { getShipments, ShipmentListResponse, ShipmentResponse } from "@/lib/shipments";

const pageSize = 10;

function statusVariant(status?: string) {
  if (!status) return "secondary";
  const normalized = status.toLowerCase();
  if (normalized.includes("delivered")) return "default";
  if (normalized.includes("cancelled") || normalized.includes("failed")) return "destructive";
  if (normalized.includes("pending")) return "secondary";
  return "secondary";
}

export default function ShipmentsListPage() {
  const { user, getValidAccessToken } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<ShipmentListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchShipments = useCallback(
    async (currentPage: number) => {
      setIsLoading(true);
      try {
        const token = await getValidAccessToken();
        if (!token || !user?.sub) {
          setError("Missing authentication context");
          return;
        }

        const response = await getShipments(token, {
          page: currentPage,
          page_size: pageSize,
          merchant_user_id: user.sub,
        });
        setData(response);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load shipments:", err);
        setError(err.message || "Unable to load shipments");
      } finally {
        setIsLoading(false);
      }
    },
    [getValidAccessToken, user?.sub]
  );

  useEffect(() => {
    fetchShipments(page);
  }, [page, fetchShipments]);

  const filteredShipments = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data.shipments;
    return data.shipments.filter((shipment) =>
      (shipment.code || shipment.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalPages = data ? Math.max(1, Math.ceil((data.total || 0) / (data.page_size || pageSize))) : 1;

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (item: ShipmentResponse) => (
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em]">
          {item.code || item.id}
        </span>
      ),
    },
    {
      key: "start_address",
      header: "Pickup",
      className: "truncate max-w-[140px]",
    },
    {
      key: "end_address",
      header: "Destination",
      className: "truncate max-w-[140px]",
    },
    {
      key: "status",
      header: "Status",
      render: (item: ShipmentResponse) => (
        <Badge variant={statusVariant(item.status)} className="capitalize">
          {item.status || "Pending"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (item: ShipmentResponse) => (
        <span className="text-[11px] text-muted-foreground">
          {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item: ShipmentResponse) => (
        <UiButton
          variant="ghost"
          size="sm"
          className="text-xs font-semibold"
          onClick={() => router.push(`/merchant/shipments/${encodeURIComponent(item.code ?? item.id)}`)}
        >
          View Details
        </UiButton>
      ),
    },
  ];

  const stats = useMemo(() => {
    if (!data) {
      return [
        { label: "Total shipments", value: "—" },
        { label: "Active dispatches", value: "—" },
        { label: "Pending review", value: "—" },
      ];
    }

    const active = data.shipments.filter(
      (shipment) =>
        shipment.status &&
        !["delivered", "cancelled", "failed"].includes(shipment.status.toLowerCase())
    ).length;
    const pending = data.shipments.filter(
      (shipment) => shipment.status?.toLowerCase() === "pending"
    ).length;

    return [
      { label: "Total shipments", value: data.total ?? 0 },
      { label: "Active dispatches", value: active },
      { label: "Pending review", value: pending },
    ];
  }, [data]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/50 bg-card/60 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground/80">
              Shipments
            </p>
            <h1 className="text-3xl font-semibold">Manage deliveries</h1>
            <p className="text-sm text-muted-foreground">
              Track shipments, filter statuses, and drill into every fulfillment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UiButton
              variant="outline"
              onClick={() => router.push("/merchant/shipments/new")}
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              New shipment
            </UiButton>
            <UiButton variant="ghost" className="gap-2" onClick={() => fetchShipments(page)}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </UiButton>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/30 bg-background/60 backdrop-blur-md p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 rounded-2xl border border-border/20 bg-background/60 backdrop-blur-md px-3 py-2 text-xs text-muted-foreground transition hover:border-primary/50">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search by code or description"
              className="border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filters coming soon</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>Shipments overview</span>
          </div>
          <span>
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/60 p-4 shadow-xl shadow-black/20">
          {error && (
            <div className="mb-4 rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
          <DataTable
            columns={columns}
            data={filteredShipments}
            keyExtractor={(item) => item.code ?? item.id}
            onRowClick={(item) =>
              router.push(`/merchant/shipments/${encodeURIComponent(item.code ?? item.id)}`)
            }
            emptyMessage={
              isLoading
                ? "Loading shipments..."
                : "No shipments found. Create a shipment to get started."
            }
          />
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing {filteredShipments.length} of {data?.total ?? 0} shipments
            </div>
            <div className="flex items-center gap-2">
              <UiButton
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </UiButton>
              <UiButton
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </UiButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
