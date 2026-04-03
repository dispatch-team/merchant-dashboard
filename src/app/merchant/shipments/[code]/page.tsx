"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  deleteShipment,
  getShipmentDetails,
  ShipmentResponse,
  ShipmentUpdatePayload,
  updateShipment,
} from "@/lib/shipments";

type FormValues = {
  start_address: string;
  end_address: string;
  description: string;
  recipient_name: string;
  recipient_phone: string;
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

export default function ShipmentDetailsPage({ params }: ShipmentDetailsPageProps) {
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    start_address: "",
    end_address: "",
    description: "",
    recipient_name: "",
    recipient_phone: "",
  });

  const formatTimestamp = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "—";

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
      });
    } catch (err: any) {
      console.error("Failed to load shipment details:", err);
      if (err.status === 404) {
        setNotFound(true);
        setFetchError(null);
        return;
      }
      setFetchError(err.message || "Failed to load shipment details");
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
    setIsUpdating(true);
    setStatusMessage(null);
    setActionError(null);

    try {
      const token = await getValidAccessToken();
      if (!token) return;

      const payload: ShipmentUpdatePayload = {};

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

      if (Object.keys(payload).length === 0) {
        setStatusMessage("No changes detected.");
        return;
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
      });
      setStatusMessage("Shipment updated successfully.");
    } catch (err: any) {
      console.error("Failed to update shipment:", err);
      setActionError(err.message || "Failed to update shipment details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!shipment) return;
    const confirmed = window.confirm("This will permanently delete the shipment. Continue?");
    if (!confirmed) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      await deleteShipment(token, shipmentCode);
      router.push("/merchant/shipments");
    } catch (err: any) {
      console.error("Failed to delete shipment:", err);
      setActionError(err.message || "Failed to delete shipment.");
    } finally {
      setIsDeleting(false);
    }
  };

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
              <p className="text-xs uppercase tracking-widest text-muted-foreground/70">Shipment</p>
              <h1 className="text-lg font-semibold">
        Details for {shipmentCode.toUpperCase()}
              </h1>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading shipment details...</p>
            </div>
          ) : fetchError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
              <p className="text-sm text-destructive font-medium">{fetchError}</p>
              <Button className="mt-4" onClick={refreshShipment}>
                Retry
              </Button>
            </div>
          ) : notFound ? (
            <div className="rounded-2xl border border-border/40 bg-card/70 p-6 text-center space-y-3">
              <h3 className="text-lg font-semibold">Shipment not found</h3>
              <p className="text-sm text-muted-foreground">We couldn't locate that shipment code.</p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => router.push("/merchant/shipments")}>
                  Back to list
                </Button>
                <Button variant="outline" onClick={refreshShipment}>
                  Retry
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
                        <CardTitle className="text-xl">Shipment snapshot</CardTitle>
                        <CardDescription className="flex items-center gap-3">
                          <span>Shipment status</span>
                          <Badge variant={badgeVariant} className="text-xs px-2 py-1 uppercase font-bold">
                            {shipment.status || "pending"}
                          </Badge>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Shipment code</p>
                        <p className="font-mono text-sm">{shipment.code || shipment.id}</p>
                      </div>
                      <div className="grid gap-4 border-t border-border/40 pt-4 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground">Created</p>
                          <p>{createdTimestamp}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-muted-foreground">Last updated</p>
                          <p>{lastUpdatedTimestamp}</p>
                        </div>
                        {merchantInfo?.company_name && (
                          <div className="flex items-center justify-between">
                            <p className="text-muted-foreground">Merchant</p>
                            <p className="text-sm text-foreground">{merchantInfo.company_name}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-end space-x-3">
                      <Button variant="ghost" size="sm" onClick={refreshShipment}>
                        Refresh
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting…" : "Delete shipment"}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">Locations</CardTitle>
                        <CardDescription>Pickup and delivery addresses</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start justify-between">
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-right text-foreground max-w-[280px]">{shipment.start_address || "—"}</p>
                      </div>
                      <div className="flex items-start justify-between border-t border-border/30 pt-3">
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="text-right text-foreground max-w-[280px]">{shipment.end_address || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">Package & recipient</CardTitle>
                        <CardDescription>Items, weight, dimensions, and recipient contact</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid gap-1">
                        <p className="text-xs font-semibold text-muted-foreground">Recipient</p>
                        <p>{formValues.recipient_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p>{formValues.recipient_phone || "—"}</p>
                      </div>
                      <div className="grid gap-1 border-t border-border/30 pt-3">
                        <p className="text-xs font-semibold text-muted-foreground">Notes</p>
                        <p>{formValues.description || "—"}</p>
                      </div>
                      <div className="grid gap-1 border-t border-border/30 pt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Items</span>
                          <span className="text-foreground">{formattedItems}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Weight</span>
                          <span className="text-foreground">{shipment.weight_kg ? `${shipment.weight_kg} kg` : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Dimensions</span>
                          <span className="text-foreground">{shipment.dimensions || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Total fee</span>
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
                        <CardTitle className="text-xl">Courier partner</CardTitle>
                        <CardDescription>Assigned courier provider</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-foreground">{courierCompany?.company_name || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <p>Address</p>
                        <p className="text-right max-w-[220px]">{courierCompany?.company_address || "—"}</p>
                      </div>
                      <div className="grid gap-1 border-t border-border/30 pt-3 text-xs text-muted-foreground">
                        <p>Phone: {courierCompany?.phone_number || "—"}</p>
                        <p>Email: {courierCompany?.email || "—"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-xl">Update details</CardTitle>
                        <CardDescription>Change the pickup, delivery, recipient, or description.</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-3">
                        <label className="text-xs text-muted-foreground">Pickup address</label>
                        <Input
                          value={formValues.start_address}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, start_address: event.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-3">
                        <label className="text-xs text-muted-foreground">Destination address</label>
                        <Input
                          value={formValues.end_address}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, end_address: event.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-3">
                        <label className="text-xs text-muted-foreground">Recipient name</label>
                        <Input
                          value={formValues.recipient_name}
                          onChange={(event) =>
                            setFormValues((prev) => ({ ...prev, recipient_name: event.target.value }))
                          }
                        />
                      </div>
                      <div className="grid gap-3">
                        <label className="text-xs text-muted-foreground">Recipient phone</label>
                        <Input
                          value={formValues.recipient_phone}
                          onChange={(event) =>
                            setFormValues((prev) => ({
                              ...prev,
                              recipient_phone: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-3">
                        <label className="text-xs text-muted-foreground">Description</label>
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
                        Last updated {lastUpdatedTimestamp}
                      </div>
                      <Button variant="outline" onClick={handleUpdate} disabled={isUpdating}>
                        {isUpdating ? "Saving..." : "Save changes"}
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="space-y-4">
                    <CardHeader>
                      <CardTitle className="text-lg">Actions</CardTitle>
                      <CardDescription>Use these to refresh status or delete the shipment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full" onClick={refreshShipment} variant="secondary">
                        Refresh details
                      </Button>
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => router.push("/merchant/shipments/new")}
                        disabled={isUpdating || isDeleting}
                      >
                        Create new shipment
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/70">
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                      <CardDescription>You can delete the shipment if it's no longer needed.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      Deleting a shipment will remove it from your dashboard and cancel any active delivery requests.
                    </CardContent>
                  </Card>
                </section>
              </div>
            )
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
