"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAPIKeys, APIKeyMetadata } from "@/lib/api-keys";
import { computeAPIUsageMetrics, APIUsageMetrics } from "@/lib/analytics";
import { useI18n } from "@/intl";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { 
  Zap, 
  Activity, 
  Key, 
  Clock, 
  AlertCircle,
  Loader2,
  ShieldCheck,
  RefreshCcw,
  Calendar
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function APIUsagePage() {
  const t = useI18n("apiUsage");
  const { getValidAccessToken } = useAuth();
  const [apiKeys, setApiKeys] = useState<APIKeyMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: "unauthorized" | "error" | "none" }>({ 
    message: "", 
    type: "none" 
  });
  const [timeRange, setTimeRange] = useState("24h");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError({ message: "", type: "none" });
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError({ message: t("unauthorized"), type: "unauthorized" });
        return;
      }
      const keys = await getAPIKeys(token);
      setApiKeys(keys);
    } catch (err: any) {
      console.error(err);
      if (err.status === 401 || err.status === 403) {
        setError({ message: t("unauthorized"), type: "unauthorized" });
      } else {
        setError({ message: t("error"), type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [getValidAccessToken, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredKeys = useMemo(() => {
    let days = 30;
    if (timeRange === "24h") days = 1;
    if (timeRange === "7d") days = 7;
    if (timeRange === "30d") days = 30;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return apiKeys.filter(k => k.last_used_at && new Date(k.last_used_at) >= cutoff);
  }, [apiKeys, timeRange]);

  const metrics = useMemo(() => {
    let days = 30;
    if (timeRange === "24h") days = 1;
    if (timeRange === "7d") days = 7;
    if (timeRange === "30d") days = 30;
    return computeAPIUsageMetrics(filteredKeys, days);
  }, [filteredKeys, timeRange]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Retrieving usage data...</p>
        </div>
      </div>
    );
  }

  if (error.type !== "none") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-6 max-w-md mx-auto text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            {error.type === "unauthorized" ? "Access Restricted" : "Something went wrong"}
          </h3>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="rounded-2xl px-8 py-6 h-auto text-base font-bold gap-2">
          <RefreshCcw className="h-5 w-5" />
          Try again
        </Button>
      </div>
    );
  }

  if (apiKeys.length === 0 || metrics.totalRequests === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <EmptyState
          icon={<Zap className="h-12 w-12 text-primary" />}
          title={t("empty")}
          description={t("noData")}
          actionLabel="Manage API Keys"
          onAction={() => window.location.href = "/merchant/api-keys"}
          className="mt-12 bg-card/30 backdrop-blur-xl border-border/40 rounded-[2.5rem]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filters */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground font-medium">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-card/50 border-border/40 font-bold shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <SelectValue placeholder={t("filters.last24Hours")} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40 p-1">
              <SelectItem value="24h" className="rounded-xl font-medium">{t("filters.last24Hours")}</SelectItem>
              <SelectItem value="7d" className="rounded-xl font-medium">{t("filters.last7Days")}</SelectItem>
              <SelectItem value="30d" className="rounded-xl font-medium">{t("filters.last30Days")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title={t("metrics.totalRequests")}
          value={metrics.totalRequests.toLocaleString()}
          icon={Activity}
          className="rounded-[2rem] bg-card/30 backdrop-blur-xl border-border/40 shadow-lg hover:shadow-primary/5 transition-all"
        />
        <StatsCard
          title={t("metrics.activeKeys")}
          value={apiKeys.filter(k => k.last_used_at && !k.last_used_at.startsWith("0001")).length}
          icon={Key}
          className="rounded-[2rem] bg-card/30 backdrop-blur-xl border-border/40 shadow-lg hover:shadow-primary/5 transition-all"
        />
        <StatsCard
          title={t("metrics.healthScore")}
          value={metrics.totalRequests > 0 ? "100%" : "N/A"}
          icon={ShieldCheck}
          changeType="positive"
          change={t("metrics.last24h")}
          className="rounded-[2rem] bg-card/30 backdrop-blur-xl border-border/40 shadow-lg hover:shadow-primary/5 transition-all"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Requests Over Time */}
        <Card className="rounded-[3rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden lg:col-span-2 hover:border-primary/20 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              {t("metrics.requestsOverTime")}
            </CardTitle>
            <CardDescription className="font-medium">{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.requestsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md p-4 shadow-2xl">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                            {payload[0].payload.date}
                          </p>
                          <p className="text-lg font-extrabold text-primary">
                            {payload[0].value} <span className="text-xs font-bold">{t("metrics.requests")}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                  strokeWidth={4}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown by Key */}
        <Card className="rounded-[3rem] border-border/40 bg-card/30 backdrop-blur-xl shadow-xl overflow-hidden hover:border-primary/20 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
               <div className="p-2 rounded-xl bg-accent/10">
                <Key className="h-5 w-5 text-accent" />
              </div>
              {t("metrics.breakdownByKey")}
            </CardTitle>
            <CardDescription className="font-medium">{t("metrics.usagePerCredential")}</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.breakdownByApiKey} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border)/0.3)" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis 
                  dataKey="keyId" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }}
                  width={80}
                />
                <Tooltip
                   cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                   content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md p-4 shadow-2xl">
                          <p className="text-sm font-bold text-foreground mb-1">Key ID: {payload[0].payload.keyId}</p>
                          <p className="text-lg font-extrabold text-accent">{payload[0].value} <span className="text-xs font-bold">Requests</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 8, 8, 0]} 
                  barSize={32}
                  animationDuration={1500}
                >
                  {metrics.breakdownByApiKey.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
