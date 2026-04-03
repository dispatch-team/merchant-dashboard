"use client";

import { useCallback, useEffect, useState } from "react";
import { Key, Plus, Copy, Check, AlertTriangle, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { useAuth } from "@/context/AuthContext";
import { getAPIKeys, generateAPIKey, verifyAPIKey, deleteAPIKey, APIKeyMetadata, GeneratedAPIKey } from "@/lib/api-keys";
import { useToast } from "@/components/ui/use-toast";
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
        setError("User not authenticated");
        return;
      }
      const data = await getAPIKeys(token);
      setKeys(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load API keys:", err);
      setError(err.message || "Failed to load API keys");
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
        title: "API Key Generated",
        description: "Your new API key has been created successfully.",
      });
    } catch (err: any) {
      console.error("Failed to generate API key:", err);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err.message || "Could not generate a new API key.",
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
        title: "Verification Error",
        description: err.message || "Could not verify the API key.",
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
        title: "API Key Deleted",
        description: `Key #${keyToDelete.ID} was removed successfully.`,
      });
      setIsDeleteConfirmOpen(false);
      fetchKeys(); // Refresh the list
    } catch (err: any) {
      console.error("Failed to delete API key:", err);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err.message || "Could not delete the API key.",
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
        title: "Copied",
        description: "API key copied to clipboard.",
      });
    }
  };

  const columns: any[] = [
    {
      key: "ID",
      header: "Key ID",
      render: (item: APIKeyMetadata) => (
        <span className="font-mono text-[10px] text-muted-foreground uppercase opacity-70">
          #{item.ID}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: APIKeyMetadata) => {
        const isRevoked = !!item.DeletedAt;
        return (
          <Badge 
            variant={isRevoked ? "destructive" : "default"} 
            className="capitalize h-5 px-2 text-[10px]"
          >
            {isRevoked ? "revoked" : "active"}
          </Badge>
        );
      },
    },
    {
      key: "last_used_at",
      header: "Last Used",
      render: (item: APIKeyMetadata) => {
        const neverUsed = item.last_used_at.startsWith("0001-01-01");
        return (
          <span className="text-[11px] text-muted-foreground">
            {neverUsed ? "Never" : new Date(item.last_used_at).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: "CreatedAt",
      header: "Created",
      render: (item: APIKeyMetadata) => (
        <span className="text-[11px] text-muted-foreground">
          {new Date(item.CreatedAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
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
            Verify
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
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Security & Integration</p>
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">API Keys</h1>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              Generate and manage secure keys to authenticate your external applications with the Dispatch platform.
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
               Refresh
             </Button>
             <Button 
               size="lg" 
               onClick={handleGenerate} 
               disabled={isGenerating}
               className="rounded-2xl gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
             >
               <Plus className="h-4 w-4" />
               Generate New Key
             </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                <Key className="h-3 w-3" />
                <span>Authorized Credentials</span>
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-mono">
                {keys.length} Keys total
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
            emptyMessage={isLoading ? "Loading keys..." : "No API keys found. Generate one to get started."}
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
            <DialogTitle className="text-center text-2xl font-bold">API Key Generated</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Please copy your new API key now. For security reasons, you won't be able to see it again.
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
              <AlertTitle className="text-xs font-bold uppercase tracking-wider mb-1">Critical Warning</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed opacity-80">
                This key is only displayed once. If you lose it, you will need to generate a new one and update your integrations. Store it securely in a password manager or vault.
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
              I've saved the key
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
            <DialogTitle className="text-center text-2xl font-bold">Verify API Key</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Paste an API key string below to check if it is still valid and active.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6 relative z-10">
            <div className="space-y-2">
              <label htmlFor="verify-key" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">API Key String</label>
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
                    {verificationResult.is_valid ? "Key is Valid" : "Invalid Key"}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {verificationResult.is_valid 
                      ? "This API key is active and can be used for integrations." 
                      : "This key is either incorrect or has been revoked."}
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
              {isVerifying ? "Verifying..." : "Check Validity"}
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
            <DialogTitle className="text-center text-2xl font-bold text-destructive">Delete API Key</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete Key <span className="font-mono font-bold">#{keyToDelete?.ID}</span>? This action is permanent and cannot be undone.
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
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="w-full rounded-xl h-12 font-semibold hover:bg-muted/50"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
