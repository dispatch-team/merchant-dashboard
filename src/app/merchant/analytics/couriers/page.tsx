"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPartnerCouriers, CourierProfile } from "@/lib/couriers";
import { getCourierComparison, CourierComparisonResponse } from "@/lib/analytics";
import { useI18n } from "@/intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { 
  Scale, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Loader2,
  Calendar,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const COLORS = ["#8b5cf6", "#3b82f6", "#ec4899", "#f59e0b", "#10b981"];

export default function CourierComparisonPage() {
  const t = useI18n("courierComparison");
  const { getValidAccessToken, user } = useAuth();
  
  const [comparison, setComparison] = useState<CourierComparisonResponse | null>(null);
  const [partnerCouriers, setPartnerCouriers] = useState<CourierProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive filters
  const [timeRange, setTimeRange] = useState("7");
  const [sortBy, setSortBy] = useState<"total_shipments" | "success_rate" | "avg_delivery_minutes">("success_rate");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      
      // Compute start and end dates
      const days = parseInt(timeRange) || 7;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0); // Start of day to get complete data

      // 1. Fetch partner couriers list (so we can match courier_id to courier company_name)
      // 2. Fetch the courier comparison analytical summary from the backend
      const [partners, comparisonData] = await Promise.all([
        getPartnerCouriers(token),
        getCourierComparison(token, {
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          sort_by: sortBy,
          order: order
        })
      ]);
      
      setPartnerCouriers(partners);
      setComparison(comparisonData);
    } catch (err: any) {
      console.error("Courier comparison error:", err);
      setError(t("error") || "Failed to load comparison metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.sub, timeRange, sortBy, order]);

  // Combine comparison metrics with partner profile info
  const courierData = useMemo(() => {
    if (!comparison || !comparison.couriers) return [];
    
    return comparison.couriers.map((item) => {
      const partner = partnerCouriers.find((p) => p.id.toString() === item.courier_id);
      
      return {
        id: item.courier_id,
        name: partner ? partner.company_name : `Courier ${item.courier_id}`,
        phone: partner?.phone_number || "—",
        shipmentCount: item.total_shipments,
        successRate: item.success_rate,
        avgMinutes: item.avg_delivery_minutes,
        // Convert to hours for charting, fallback to 0 if no deliveries
        avgTime: item.avg_delivery_minutes > 0 ? Number((item.avg_delivery_minutes / 60).toFixed(2)) : 0,
        avgTimeText: item.avg_delivery_minutes > 0 ? `${(item.avg_delivery_minutes / 60).toFixed(1)} h` : "—",
      };
    });
  }, [comparison, partnerCouriers]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-12 w-12 text-warning opacity-50" />
        <p className="text-lg font-medium text-muted-foreground">{error}</p>
        <Button onClick={fetchData} variant="outline" className="rounded-xl">
          Retry Loading
        </Button>
      </div>
    );
  }

  // Handle empty state
  if (!comparison || comparison.no_data || courierData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] rounded-xl bg-card/50 border-border/40 font-bold shadow-sm">
                <Calendar className="mr-2 h-4 w-4 opacity-50" />
                <SelectValue placeholder={t("filters.range")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="1">{t("filters.last24Hours")}</SelectItem>
                <SelectItem value="7">{t("filters.last7Days")}</SelectItem>
                <SelectItem value="30">{t("filters.last30Days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <EmptyState
          icon={<Scale />}
          title="No Courier Data Available"
          description="There are no active shipments found for any couriers in the selected period. Create a new shipment to start tracking performance."
          actionLabel="Book a Shipment"
          onAction={() => window.location.href = "/merchant/shipments/new"}
          className="mt-12"
        />
      </div>
    );
  }

  const isDataIncomplete = courierData.some(c => c.successRate === 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl bg-card/50 border-border/40 font-bold shadow-sm">
              <div className="flex items-center gap-2 text-foreground/70">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder={t("filters.range")} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 p-1">
              <SelectItem value="1" className="rounded-xl font-medium">{t("filters.last24Hours")}</SelectItem>
              <SelectItem value="7" className="rounded-xl font-medium">{t("filters.last7Days")}</SelectItem>
              <SelectItem value="30" className="rounded-xl font-medium">{t("filters.last30Days")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By Filter */}
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-card/50 border-border/40 font-bold shadow-sm">
              <div className="flex items-center gap-2 text-foreground/70">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Sort Metric" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 p-1">
              <SelectItem value="success_rate" className="rounded-xl font-medium">Delivery Success Rate</SelectItem>
              <SelectItem value="total_shipments" className="rounded-xl font-medium">Total Volume</SelectItem>
              <SelectItem value="avg_delivery_minutes" className="rounded-xl font-medium">Avg Delivery Time</SelectItem>
            </SelectContent>
          </Select>

          {/* Order Direction */}
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-2xl border-border/40 bg-card/50 shadow-sm text-foreground/70"
            onClick={() => setOrder(order === "desc" ? "asc" : "desc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isDataIncomplete && (
        <Alert variant="destructive" className="rounded-3xl bg-warning/10 border-warning/30 text-warning-foreground">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">Incomplete Data</AlertTitle>
          <AlertDescription className="text-xs font-medium">
            {t("incompleteWarning")}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Comparison Chart */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Success Rate Comparison */}
        <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("metrics.successRate")}
            </CardTitle>
            <CardDescription>Comparison of delivery completion rates</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courierData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10 }}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border/40 bg-background/80 backdrop-blur-md p-3 shadow-xl">
                          <p className="text-sm font-bold">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-primary">
                            {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}% {t("metrics.success")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="successRate" radius={[12, 12, 0, 0]} barSize={50}>
                  {courierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Avg Delivery Time Comparison */}
        <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              {t("metrics.avgTime")}
            </CardTitle>
            <CardDescription>Average time from pickup to delivery</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courierData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10 }}
                  unit="h"
                  domain={[0, 'auto']}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border/40 bg-background/80 backdrop-blur-md p-3 shadow-xl">
                          <p className="text-sm font-bold">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-accent">
                            {payload[0].payload.avgTimeText}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgTime" radius={[12, 12, 0, 0]} barSize={50}>
                  {courierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Detailed Metrics Table</CardTitle>
          <CardDescription>Side-by-side performance data breakdown</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border/40">
                  <th className="p-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Courier Provider</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Shipments</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Success Rate</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Avg. Delivery Time</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Performance Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {courierData.map((courier, index) => (
                  <tr key={courier.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-background border border-border/40 flex items-center justify-center text-lg font-bold text-primary group-hover:scale-110 transition-transform">
                          {courier.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">{courier.name}</span>
                          <span className="text-[11px] font-semibold text-muted-foreground">ID: {courier.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-sm font-bold text-foreground">{courier.shipmentCount}</span>
                    </td>
                    <td className="p-6 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                        {courier.successRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-sm font-semibold text-muted-foreground">{courier.avgTimeText}</span>
                    </td>
                    <td className="p-6 text-right">
                       <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-xs">
                          #{order === "desc" ? index + 1 : courierData.length - index}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
