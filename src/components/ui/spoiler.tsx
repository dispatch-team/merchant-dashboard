"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SpoilerProps {
  children: React.ReactNode;
  className?: string;
}

export function Spoiler({ children, className }: SpoilerProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed(!revealed)}
      className={cn(
        "relative inline-block cursor-pointer transition-all duration-300 rounded px-1",
        !revealed && "bg-muted-foreground/20 text-transparent select-none hover:bg-muted-foreground/30",
        revealed && "bg-transparent text-inherit",
        className
      )}
    >
      <span className={cn(
        "transition-all duration-300",
        !revealed && "blur-[4px] opacity-40",
        revealed && "blur-0 opacity-100"
      )}>
        {children}
      </span>
      {!revealed && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter opacity-0 hover:opacity-100 transition-opacity">
          Reveal
        </span>
      )}
    </button>
  );
}
