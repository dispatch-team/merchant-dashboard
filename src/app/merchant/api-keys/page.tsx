"use client";

import { useCallback, useEffect, useState } from "react";
import { Key, Plus, Copy, Check, AlertTriangle, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { getAPIKeys, generateAPIKey, verifyAPIKey, deleteAPIKey, APIKeyMetadata, GeneratedAPIKey } from "@/lib/api-keys";
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function APIKeysPage() {
  const t = useI18n("apiKeys");
  const tNewShipment = useI18n("newShipment");
  const tShipments = useI18n("shipments");
  const tAuth = useI18n("auth");
  const tDetails = useI18n("shipmentDetails");
  const tWebhooks = useI18n("webhooks");
  const { getValidAccessToken } = useAuth();
  const { toast } = useToast();

  const [keys, setKeys] = useState<APIKeyMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newKey, setNewKey] = useState<GeneratedAPIKey | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Verification State
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verifyKeyInput, setVerifyKeyInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ is_valid: boolean } | null>(null);

  // Deletion State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<APIKeyMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getValidAccessToken();
      if (!token) {
        setError(tAuth("sessionExpired"));
        return;
      }
      const data = await getAPIKeys(token);
      setKeys(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load API keys:", err);
      setError(err.message || tDetails("errorUpdate"));
    } finally {
      setIsLoading(false);
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      
      const generated = await generateAPIKey(token);
      setNewKey(generated);
      setIsDialogOpen(true);
      setHasCopied(false);
      fetchKeys(); // Refresh the list
      
      toast({
        title: t("successCreate"),
      });
    } catch (err: any) {
      console.error("Failed to generate API key:", err);
      toast({
        variant: "destructive",
        title: tDetails("errorUpdate"),
        description: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyKeyInput.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      const result = await verifyAPIKey(token, verifyKeyInput);
      setVerificationResult(result);
    } catch (err: any) {
      console.error("Failed to verify API key:", err);
      toast({
        variant: "destructive",
        title: tDetails("errorUpdate"),
        description: err.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!keyToDelete) return;
    setIsDeleting(true);
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      await deleteAPIKey(token, keyToDelete.ID);
      toast({
        title: t("successDelete"),
      });
      setIsDeleteConfirmOpen(false);
      fetchKeys(); // Refresh the list
    } catch (err: any) {
      console.error("Failed to delete API key:", err);
      toast({
        variant: "destructive",
        title: tDetails("errorUpdate"),
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = () => {
    if (newKey?.api_key) {
      navigator.clipboard.writeText(newKey.api_key);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      toast({
        title: t("copy"),
      });
    }
  };

  const columns: any[] = [
    {
      key: "ID",
      header: t("table.name"),
      render: (item: APIKeyMetadata) => (
        <span className="font-mono text-[10px] text-muted-foreground uppercase opacity-70">
          #{item.ID}
        </span>
      ),
    },
    {
      key: "status",
      header: t("table.status"),
      render: (item: APIKeyMetadata) => {
        const isRevoked = !!item.DeletedAt;
        return (
          <Badge 
            variant={isRevoked ? "destructive" : "default"} 
            className="capitalize h-5 px-2 text-[10px]"
          >
            {isRevoked ? t("revoked") : t("active")}
          </Badge>
        );
      },
    },
    {
      key: "last_used_at",
      header: t("table.created"),
      render: (item: APIKeyMetadata) => {
        const neverUsed = item.last_used_at.startsWith("0001-01-01");
        return (
          <span className="text-[11px] text-muted-foreground">
            {neverUsed ? "—" : new Date(item.last_used_at).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "CreatedAt",
      header: t("table.created"),
      render: (item: APIKeyMetadata) => (
        <span className="text-[11px] text-muted-foreground">
          {new Date(item.CreatedAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      className: "text-right",
      render: (item: APIKeyMetadata) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase tracking-wider gap-2 hover:bg-primary/10 hover:text-primary transition-colors rounded-xl"
            onClick={(e) => {
              e.stopPropagation();
              setVerifyKeyInput("");
              setVerificationResult(null);
              setIsVerifyDialogOpen(true);
            }}
          >
            <ShieldCheck className="h-3 w-3" />
            {t("verifyTitle")}
          </Button>
          {!item.DeletedAt && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl"
              onClick={(e) => {
                e.stopPropagation();
                setKeyToDelete(item);
                setIsDeleteConfirmOpen(true);
              }}
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-3xl p-8 shadow-2xl shadow-black/40">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ShieldCheck size={120} strokeWidth={1} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">{useI18n("newShipment")("sections.courier")}</p>
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
               onClick={fetchKeys}
               disabled={isLoading}
               className="rounded-2xl gap-2 border-border/40 hover:bg-muted/50"
             >
               <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
               {tShipments("refresh")}
             </Button>
             <Button 
               size="lg" 
               onClick={handleGenerate} 
               disabled={isGenerating}
               className="rounded-2xl gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
             >
               <Plus className="h-4 w-4" />
               {t("newKey")}
             </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                <Key className="h-3 w-3" />
                <span>{t("authorizedCredentials")}</span>
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
                {t("totalKeys", { count: String(keys.length) })}
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
            data={keys as any}
            keyExtractor={(item: any) => item.ID}
            emptyMessage={isLoading ? tShipments("loading") : tShipments("empty")}
          />
        </div>
      </section>

      {/* Key Display Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="pt-2 relative z-10">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">{t("successCreate")}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("criticalDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4 relative z-10">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <label htmlFor="api-key" className="sr-only">API Key</label>
                <div className="relative group">
                  <Input
                    id="api-key"
                    readOnly
                    value={newKey?.api_key || ""}
                    className="pr-12 font-mono text-sm bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/30"
                  />
                  <div className="absolute right-1 top-1 h-10 w-10">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={copyToClipboard}
                        className="h-full w-full rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="rounded-2xl border-amber-500/20 bg-amber-500/5 text-amber-500/90 py-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-xs font-bold uppercase tracking-wider mb-1">{t("criticalWarning")}</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed opacity-80">
                {t("criticalDesc")}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="sm:justify-center pt-2 relative z-10">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsDialogOpen(false)}
              className="w-full rounded-xl h-11 font-semibold shadow-lg shadow-primary/20"
            >
              {t("savedKey")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="pt-2 relative z-10">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Key className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">{t("verifyTitle")}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("verifyDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6 relative z-10">
            <div className="space-y-2">
              <label htmlFor="verify-key" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">{t("verifyLabel")}</label>
              <Input
                id="verify-key"
                placeholder="dsp_..."
                value={verifyKeyInput}
                onChange={(e) => {
                  setVerifyKeyInput(e.target.value);
                  setVerificationResult(null);
                }}
                className="font-mono text-sm bg-muted/30 border-border/50 rounded-xl h-12 focus-visible:ring-primary/30"
              />
            </div>

            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "rounded-2xl p-4 flex items-center gap-4 border",
                  verificationResult.is_valid 
                    ? "bg-green-500/10 border-green-500/20 text-green-500" 
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                  verificationResult.is_valid ? "bg-green-500/20" : "bg-destructive/20"
                )}>
                  {verificationResult.is_valid ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {verificationResult.is_valid ? t("isValid") : t("isInvalid")}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {verificationResult.is_valid 
                      ? t("validDesc") 
                      : t("invalidDesc")}
                  </p>
                </div>
              </motion.div>
            )}

            <Button
              onClick={handleVerify}
              disabled={isVerifying || !verifyKeyInput.trim()}
              className="w-full rounded-xl h-12 font-semibold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
            >
              {isVerifying ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : null}
              {isVerifying ? tNewShipment("creating") : t("verifyTitle")}
            </Button>
          </div>
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
            <DialogTitle className="text-center text-2xl font-bold text-destructive">{t("delete")}</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {t("confirmDelete")}
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
              {isDeleting ? t("deleting") : t("confirm")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full rounded-xl h-12 font-semibold hover:bg-muted/50"
            >
              {tNewShipment("cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
