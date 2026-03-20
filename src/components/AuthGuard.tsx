"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  loginPath: string;
}

export function AuthGuard({ children, allowedRoles, loginPath }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  // Prevent calling router.replace() more than once during a single render cycle
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (hasRedirected.current) return;

    if (!isAuthenticated) {
      hasRedirected.current = true;
      router.replace(loginPath);
      return;
    }

    // Only enforce role check if roles are actually populated.
    // If roles are empty (e.g. CLIENT_ID env var missing), skip the check
    // to avoid bouncing an authenticated user back to login.
    if (
      allowedRoles &&
      user &&
      user.roles.length > 0 &&
      !user.roles.some((r) => allowedRoles.includes(r))
    ) {
      hasRedirected.current = true;
      // Redirect to home, NOT back to loginPath — prevents bounce loop
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, loginPath, router]);

  // Reset the redirect guard when auth state loads fresh
  useEffect(() => {
    if (!isLoading) {
      hasRedirected.current = false;
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (
    allowedRoles &&
    user &&
    user.roles.length > 0 &&
    !user.roles.some((r) => allowedRoles.includes(r))
  ) {
    return null;
  }

  return <>{children}</>;
}
