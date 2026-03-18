"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Package, Truck, BarChart3 } from "lucide-react";
import dispatchLogo from "@/assets/dispatch-logo.png";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/merchant");
  };

  const steps = [
    { icon: Package, title: "Create your account", desc: "Register with your business details" },
    { icon: Truck, title: "Choose a courier", desc: "Browse and compare courier providers" },
    { icon: BarChart3, title: "Start shipping", desc: "Create shipments and track deliveries" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-primary/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative max-w-md text-center px-8">
          <img src={dispatchLogo.src} alt="Dispatch" className="h-28 w-auto mx-auto mb-10 drop-shadow-[0_0_30px_hsl(270,70%,60%,0.2)]" />
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Join Dispatch</h2>
          <p className="text-muted-foreground leading-relaxed mb-10">
            Register your business and start managing shipments with the best couriers in Addis Ababa.
          </p>
          <div className="space-y-4 text-left">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-4 bg-card/40 rounded-xl border border-border/30 p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute top-6 left-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden flex justify-center mb-8">
            <img src={dispatchLogo.src} alt="Dispatch" className="h-20 w-auto" />
          </Link>

          <h1 className="text-xl font-bold text-foreground mb-1 tracking-tight">Create Merchant Account</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Register your business to start using Dispatch
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-xs text-muted-foreground">Business Name</Label>
              <Input id="businessName" placeholder="Your Company Ltd." value={formData.businessName} onChange={handleChange("businessName")} required className="h-11 rounded-xl bg-card border-border/60 focus:border-primary/40" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <Input id="email" type="email" placeholder="you@business.com" value={formData.email} onChange={handleChange("email")} required className="h-11 rounded-xl bg-card border-border/60 focus:border-primary/40" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+251 9XX XXX XXXX" value={formData.phone} onChange={handleChange("phone")} required className="h-11 rounded-xl bg-card border-border/60 focus:border-primary/40" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange("password")} required className="h-11 rounded-xl bg-card border-border/60 focus:border-primary/40 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} required className="h-11 rounded-xl bg-card border-border/60 focus:border-primary/40" />
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{" "}
            <Link href="/login/merchant" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
