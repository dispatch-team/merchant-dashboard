"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getMerchantShipmentSummary, ShipmentSummaryResponse } from "@/lib/analytics";
import { useI18n } from "@/intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Package, 
  Filter, 
  Calendar,
  AlertCircle,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";

const COLORS = ["#10b981", "#ef4444", "#ec4899", "#f59e0b", "#3b82f6"];

export default function ShipmentAnalyticsPage() {
  const t = useI18n("shipmentAnalytics");
  const { getValidAccessToken, user } = useAuth();
  
  const [summary, setSummary] = useState<ShipmentSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7");
  const [merchantId, setMerchantId] = useState<number | string | null>(null);

  const fetchMerchantProfileAndData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;

      // 1. Fetch Merchant Profile first to get the exact merchant id
      const profileRes = await fetch("/api/merchant/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!profileRes.ok) {
        throw new Error("Could not retrieve merchant profile");
      }
      
      const profile = await profileRes.json();
      if (!profile || !profile.id) {
        throw new Error("Merchant ID is missing from profile");
      }
      
      setMerchantId(profile.id);

      // 2. Fetch the shipment summary from the backend
      const days = parseInt(timeRange) || 7;
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      start.setHours(0, 0, 0, 0); // Start of day to get complete data

      const summaryData = await getMerchantShipmentSummary(token, profile.id, {
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        granularity: "daily"
      });

      setSummary(summaryData);
    } catch (err: any) {
      console.error("Analytics load error:", err);
      setError(err.message || t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantProfileAndData();
  }, [user?.sub, timeRange]);

  const statusDistribution = useMemo(() => {
    if (!summary || !summary.status_breakdown) return [];
    
    return [
      { name: "Delivered", value: summary.status_breakdown.delivered },
      { name: "Failed", value: summary.status_breakdown.failed },
      { name: "Cancelled", value: summary.status_breakdown.cancelled },
      { name: "In Progress", value: summary.status_breakdown.in_progress },
    ].filter(item => item.value > 0);
  }, [summary]);

  const volumeTrendData = useMemo(() => {
    if (!summary || !summary.volume_trend) return [];
    
    return summary.volume_trend.map(item => ({
      date: item.period,
      count: item.count,
      delivered: item.delivered_count,
      failed: item.failed_count,
      other: Math.max(0, item.count - item.delivered_count - item.failed_count)
    }));
  }, [summary]);

  const avgDailyVolume = useMemo(() => {
    if (!summary || summary.total_shipments === 0) return 0;
    const days = parseInt(timeRange) || 7;
    return summary.total_shipments / days;
  }, [summary, timeRange]);

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
        <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
        <p className="text-lg font-medium text-muted-foreground">{error}</p>
        <Button onClick={fetchMerchantProfileAndData} variant="outline" className="rounded-xl">
          Retry Loading
        </Button>
      </div>
    );
  }

  if (!summary || summary.no_data || summary.total_shipments === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] rounded-xl bg-card/50 border-border/40">
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
          icon={<BarChart3 />}
          title={t("noData")}
          description={t("todo.description")}
          className="mt-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filters */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] rounded-xl bg-card/50 border-border/40">
              <Calendar className="mr-2 h-4 w-4 opacity-50" />
              <SelectValue placeholder={t("filters.range")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="1">{t("filters.last24Hours")}</SelectItem>
              <SelectItem value="7">{t("filters.last7Days")}</SelectItem>
              <SelectItem value="30">{t("filters.last30Days")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="rounded-xl border-border/40 bg-card/50" onClick={fetchMerchantProfileAndData}>
            <Filter className="h-4 w-4 opacity-50" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("metrics.totalShipments")}
          value={summary.total_shipments}
          icon={Package}
          className="rounded-3xl bg-card/30 backdrop-blur-xl border-border/40"
        />
        <StatsCard
          title={t("metrics.successRate")}
          value={`${summary.success_rate.toFixed(1)}%`}
          icon={TrendingUp}
          changeType="positive"
          className="rounded-3xl bg-card/30 backdrop-blur-xl border-border/40"
        />
        <StatsCard
          title={t("metrics.avgDeliveryTime")}
          value={summary.avg_delivery_minutes > 0 ? `${(summary.avg_delivery_minutes / 60).toFixed(1)}h` : "—"}
          icon={Clock}
          className="rounded-3xl bg-card/30 backdrop-blur-xl border-border/40"
        />
        <StatsCard
          title={t("metrics.volumeOverTime")}
          value={`${avgDailyVolume.toFixed(1)} / day`}
          icon={BarChart3}
          className="rounded-3xl bg-card/30 backdrop-blur-xl border-border/40"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Volume Trend Line Chart */}
        <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">{t("charts.volumeLine")}</CardTitle>
            <CardDescription>Daily breakdown of created shipments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  dy={10}
                  tickFormatter={(val: string) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border/40 bg-background/80 backdrop-blur-md p-3 shadow-xl">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            {new Date(payload[0].payload.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {payload[0].value} {t("metrics.totalShipments")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">{t("charts.statusDistribution")}</CardTitle>
            <CardDescription>Fulfillment breakdown of all shipments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-border/40 bg-background/80 backdrop-blur-md p-3 shadow-xl">
                            <p className="text-sm font-bold">{payload[0].name}</p>
                            <p className="text-xs text-muted-foreground">{payload[0].value} Shipments</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 w-[40%] pr-4">
              {statusDistribution.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-semibold text-muted-foreground truncate max-w-[100px]">{entry.name}</span>
                  <span className="text-xs font-bold text-foreground ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stacked Performance: Delivered vs Failed Trend Chart */}
        <Card className="rounded-[2.5rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Delivered vs Failed Volume Trend</CardTitle>
            <CardDescription>Daily comparison of successful deliveries against failed operational shipments</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(val: string) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border/40 bg-background/80 backdrop-blur-md p-4 shadow-xl space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            {new Date(payload[0].payload.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-semibold text-emerald-500 flex justify-between gap-4">
                            <span>Delivered:</span>
                            <span className="font-bold">{payload[0].payload.delivered}</span>
                          </p>
                          <p className="text-xs font-semibold text-rose-500 flex justify-between gap-4">
                            <span>Failed:</span>
                            <span className="font-bold">{payload[0].payload.failed}</span>
                          </p>
                          <p className="text-xs font-semibold text-sky-500 flex justify-between gap-4">
                            <span>In-Transit / Other:</span>
                            <span className="font-bold">{payload[0].payload.other}</span>
                          </p>
                          <div className="border-t border-border/40 mt-1 pt-1 flex justify-between gap-4 text-xs font-bold text-foreground">
                            <span>Total Count:</span>
                            <span>{payload[0].payload.count}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="delivered" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} name="Delivered" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} name="Failed" />
                <Bar dataKey="other" stackId="a" fill="#3b82f6" radius={[12, 12, 0, 0]} name="In-Transit / Other" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
