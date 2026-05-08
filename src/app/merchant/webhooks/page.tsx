"use client";

import { useCallback, useEffect, useState } from "react";
import { Webhook, Plus, Copy, Check, AlertTriangle, RefreshCcw, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { getWebhooks, registerWebhook, deleteWebhook, type Webhook as WebhookType, type WebhookRegistrationResponse } from "@/lib/webhooks";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

export default function WebhooksPage() {
  const t = useI18n("webhooks");
  const tApiKeys = useI18n("apiKeys");
  const tNewShipment = useI18n("newShipment");
  const tAuth = useI18n("auth");
  const tDetails = useI18n("shipmentDetails");
  const tShipments = useI18n("shipments");
  const { getValidAccessToken } = useAuth();
  const { toast } = useToast();

  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // Creation result state
  const [newWebhook, setNewWebhook] = useState<WebhookRegistrationResponse | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);

  // Deletion State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(tAuth("sessionExpired"));
        return;
      }
      const data = await getWebhooks(token);
      setWebhooks(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load webhooks:", err);
      setError(err.message || tDetails("errorUpdate"));
    } finally {
      setIsLoading(false);
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleRegister = async () => {
    if (!webhookUrl.trim()) {
      toast({
        variant: "destructive",
        title: tNewShipment("validation.required"),
      });
      return;
    }

    setIsRegistering(true);
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      
      const registered = await registerWebhook(token, webhookUrl);
      setNewWebhook(registered);
      setIsRegistering(false);
      setIsRegisterDialogOpen(false);
      setIsSuccessDialogOpen(true);
      setWebhookUrl("");
      fetchWebhooks(); // Refresh the list
      
      toast({
        title: t("successCreate"),
      });
    } catch (err: any) {
      console.error("Failed to register webhook:", err);
      toast({
        variant: "destructive",
        title: useI18n("shipmentDetails")("errorUpdate"),
        description: err.message,
      });
      setIsRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!webhookToDelete) return;
    setIsDeleting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      await deleteWebhook(token, webhookToDelete.ID);
      toast({
        title: t("successDelete"),
      });
      setIsDeleteConfirmOpen(false);
      fetchWebhooks(); // Refresh the list
    } catch (err: any) {
      console.error("Failed to delete webhook:", err);
      toast({
        variant: "destructive",
        title: useI18n("shipmentDetails")("errorUpdate"),
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copySigningKey = () => {
    if (newWebhook?.signing_key) {
      navigator.clipboard.writeText(newWebhook.signing_key);
      setHasCopiedKey(true);
      setTimeout(() => setHasCopiedKey(false), 2000);
      toast({
        title: tApiKeys("copy"),
      });
    }
  };

  const columns: any[] = [
    {
      key: "ID",
      header: "ID",
      render: (item: WebhookType) => (
        <span className="font-mono text-[10px] text-muted-foreground uppercase opacity-70">
          #{item.ID}
        </span>
      ),
    },
    {
      key: "url",
      header: t("table.url"),
      render: (item: WebhookType) => (
        <div className="flex items-center gap-2 max-w-[300px]">
          <span className="text-sm truncate font-medium">{item.url}</span>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      key: "status",
      header: t("table.status"),
      render: (item: WebhookType) => (
        <Badge 
          variant={item.is_active ? "default" : "secondary"} 
          className="capitalize h-5 px-2 text-[10px] rounded-lg"
        >
          {item.is_active ? tApiKeys("active") : tApiKeys("revoked")}
        </Badge>
      ),
    },
    {
      key: "CreatedAt",
      header: tApiKeys("table.created"),
      render: (item: WebhookType) => (
        <span className="text-[11px] text-muted-foreground">
          {new Date(item.CreatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      className: "text-right",
      render: (item: WebhookType) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              setWebhookToDelete(item);
              setIsDeleteConfirmOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-3xl p-8 shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 p-8 opacity-5 font-bold italic rotate-12 select-none pointer-events-none">
           <Webhook size={140} strokeWidth={1} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">{tNewShipment("sections.courier")}</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">{t("title")}</h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               size="lg" 
               onClick={fetchWebhooks}
               disabled={isLoading}
               className="rounded-2xl gap-2 border-border/40 hover:bg-muted/50"
             >
               <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
               {tShipments("refresh")}
             </Button>
             <Button 
               size="lg" 
               onClick={() => setIsRegisterDialogOpen(true)} 
               disabled={isLoading}
               className="rounded-2xl gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
             >
               <Plus className="h-4 w-4" />
               {t("addWebhook")}
             </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                <Webhook className="h-3 w-3" />
                <span>{t("activeCallbacks")}</span>
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
                {t("totalWebhooks", { count: String(webhooks.length) })}
            </span>
        </div>

        <div className="rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-xl p-3 shadow-xl overflow-hidden shadow-black/10">
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-2xl border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={webhooks as any}
            keyExtractor={(item: any) => item.ID}
            emptyMessage={isLoading ? tShipments("loading") : t("empty")}
            emptyContent={
              <EmptyState 
                icon={<Webhook />}
                title={t("empty")}
                description={t("emptyDesc")}
                actionLabel={t("addWebhook")}
                onAction={() => setIsRegisterDialogOpen(true)}
                isLoading={isLoading}
              />
            }
          />
        </div>
      </section>

      {/* Register Webhook Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="pt-2 relative z-10">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Plus className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">{t("dialogs.register.title")}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("dialogs.register.desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4 relative z-10">
            <div className="space-y-2">
              <label htmlFor="webhook-url" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("urlLabel")}</label>
              <Input
                id="webhook-url"
                placeholder="https://your-api.com/webhooks/dispatch"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/30"
              />
            </div>
            
            <Alert className="rounded-2xl border-primary/20 bg-primary/5 py-4">
              <ExternalLink className="h-4 w-4 text-primary" />
              <AlertTitle className="text-[10px] font-bold uppercase tracking-wider mb-1">{tApiKeys("warning")}</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed opacity-80">
                {t("dialogs.register.note")}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="sm:justify-center pt-2 relative z-10">
            <Button
              type="button"
              variant="default"
              onClick={handleRegister}
              disabled={isRegistering || !webhookUrl.trim()}
              className="w-full rounded-xl h-11 font-semibold shadow-lg shadow-primary/20"
            >
              {isRegistering ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                  {t("dialogs.register.configuring")}
                </>
              ) : (
                t("dialogs.register.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog (Mirroring API Key hidden behavior) */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="pt-2 relative z-10">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold">{t("dialogs.success.title")}</DialogTitle>
            <DialogDescription className="pt-2 px-4">
              {t("dialogs.success.desc", { id: String(newWebhook?.webhook_id || "") })}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4 relative z-10">
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("dialogs.success.signingKey")}</label>
              <div className="relative group">
                <Input
                  readOnly
                  value={newWebhook?.signing_key || ""}
                  className="pr-12 font-mono text-xs bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/30"
                />
                <div className="absolute right-1 top-1 h-10 w-10">
                  <Button
                      size="icon"
                      variant="ghost"
                      onClick={copySigningKey}
                      className="h-full w-full rounded-lg hover:bg-primary/10 transition-colors"
                  >
                      {hasCopiedKey ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </div>

            <Alert className="rounded-2xl border-amber-500/20 bg-amber-500/5 text-amber-500/90 py-4 text-left">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-xs font-bold uppercase tracking-wider mb-1">{t("dialogs.success.securityWarning")}</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed opacity-80">
                {t("dialogs.success.securityDesc")}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="sm:justify-center pt-2 relative z-10">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsSuccessDialogOpen(false)}
              className="w-full rounded-xl h-11 font-semibold shadow-lg shadow-primary/20"
            >
              {t("dialogs.success.understand")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="pt-2 relative z-10">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-destructive">{t("dialogs.delete.title")}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("dialogs.delete.desc", { id: `#${webhookToDelete?.ID || ""}` })}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-3 relative z-10">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full rounded-xl h-12 font-semibold shadow-lg shadow-destructive/20"
            >
              {isDeleting ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : null}
              {isDeleting ? t("dialogs.delete.deleting") : t("dialogs.delete.confirm")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="rounded-xl h-12 font-semibold hover:bg-muted/50 w-full"
            >
              {tNewShipment("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
