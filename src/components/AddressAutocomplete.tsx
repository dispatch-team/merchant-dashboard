"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { autocompleteAddress, AutocompleteResult } from "@/lib/addresses";
import { useAuth } from "@/context/AuthContext";

interface AddressAutocompleteProps {
  label: string;
  required?: boolean;
  name: string;
  placeholder?: string;
  icon?: React.ReactNode;
  value: string;
  error?: string;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSelect: (result: AutocompleteResult) => void;
}

export function AddressAutocomplete({
  label,
  required,
  name,
  placeholder,
  icon,
  value,
  error,
  hint,
  onChange,
  onBlur,
  onSelect,
}: AddressAutocompleteProps) {
  const { getValidAccessToken } = useAuth();
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query || query.length < 3) return;
      
      setIsLoading(true);
      try {
        const token = await getValidAccessToken();
        if (!token) return;
        const response = await autocompleteAddress(token, query);
        setSuggestions(response.results || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Autocomplete error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [getValidAccessToken]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    const query = e.target.value;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 400);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (result: AutocompleteResult) => {
    onSelect(result);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const hasError = !!error;
  const inputCls = `w-full ${icon ? "pl-12" : "pl-5"} pr-12 rounded-full border text-sm bg-background/30 backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    hasError
      ? "border-destructive/40 bg-destructive/5 focus:ring-destructive/10"
      : "border-border/40 focus:border-primary/40 focus:bg-background/50"
  }`;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 pl-1">
        {label} {required && <span className="text-destructive font-bold">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none z-10" style={{ left: "1.25rem" }}>
            {icon}
          </span>
        )}
        <Input
          type="text"
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          className={`${inputCls} h-12`}
          autoComplete="off"
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary/50" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground/30" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 overflow-hidden rounded-xl border border-border/50 bg-card/95 backdrop-blur-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <ul className="max-h-[240px] overflow-y-auto py-1">
            {suggestions.map((result, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-primary/10 transition-colors group"
                >
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/20 transition-colors">
                    <MapPin className="h-3.5 w-3.5 text-primary/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.name}
                    </p>
                    {result.subcity && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.subcity}
                      </p>
                    )}
                  </div>
                  {result.category && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded flex-shrink-0 self-center">
                      {result.category}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasError && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
      {!hasError && hint && (
        <p className="text-xs text-muted-foreground/60 mt-1">{hint}</p>
      )}
    </div>
  );
}
