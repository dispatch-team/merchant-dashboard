"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  isLoading = false,
}: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20 px-6 text-center", className)}>
        <div className="w-16 h-16 rounded-3xl bg-muted/20 animate-pulse mb-6" />
        <div className="h-6 w-32 bg-muted/20 animate-pulse rounded-full mb-3" />
        <div className="h-4 w-48 bg-muted/20 animate-pulse rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        className
      )}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-8 shadow-2xl shadow-primary/5"
      >
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { 
              size: 40, 
              strokeWidth: 1.5 
            }) 
          : icon}
      </motion.div>

      <h3 className="text-xl font-bold tracking-tight mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-[280px] text-sm leading-relaxed mb-8 opacity-80">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-2xl px-8 shadow-lg shadow-primary/20 font-semibold"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
