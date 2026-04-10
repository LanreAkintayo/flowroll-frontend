"use client";

import { useMutation } from "@tanstack/react-query";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { Zap, ShieldCheck, Loader2, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { COSMOS_CHAIN_ID } from "@/lib/interwoven";

interface Props {
  variant?: 'full' | 'compact';
  className?: string;
}

export function AutoSignToggle({ variant = 'compact', className = '' }: Props) {
  const { autoSign, address } = useInterwovenKit();

  const chainId = COSMOS_CHAIN_ID; 

  const enable = useMutation({
    mutationFn: () => autoSign.enable(chainId),
    onSuccess: () => toast.success("1-Click Mode Enabled! ⚡"),
    onError: (error: any) => toast.error(error.message || "Failed to enable 1-Click Mode"),
  });

  const disable = useMutation({
    mutationFn: () => autoSign.disable(chainId),
    onSuccess: () => toast.info("1-Click Mode Disabled."),
    onError: (error: any) => toast.error(error.message || "Failed to disable"),
  });

  // Guard clauses
  if (!autoSign || !address) return null;

  const isEnabled = autoSign.isEnabledByChain[chainId];
  const isLoading = autoSign.isLoading || enable.isPending || disable.isPending;

  return (
    <Popover>
      {/* --- 1. THE TRIGGER BUTTON --- */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`relative overflow-hidden transition-all duration-300 font-semibold ${
            isEnabled
              ? " hover:bg-emerald-100 border-emerald-200 text-emerald-700 shadow-xs"
              : "hover:bg-slate-50 border-slate-200 text-slate-700"
          } ${variant === 'compact' ? 'h-9 px-3' : 'h-11 px-5'} ${className}`}
        >
          {/* Subtle green glow if active */}
          {isEnabled && (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 animate-shimmer" />
          )}
          
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isEnabled ? (
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
          ) : (
            <Zap className="w-4 h-4 mr-2 text-amber-500" />
          )}

          {variant === 'full' ? (
            isEnabled ? "1-Click Active" : "Enable 1-Click Mode"
          ) : (
            isEnabled ? "Active" : "1-Click"
          )}

          {/* Active Ping Indicator */}
          {/* {isEnabled && (
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )} */}
        </Button>
      </PopoverTrigger>

      {/* --- 2. THE EDUCATIONAL DROPDOWN --- */}
      <PopoverContent 
        align="end" 
        className="w-[320px] p-0 rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border-slate-100"
      >
        {/* Header Section */}
        <div className="bg-slate-50 p-5 border-b border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-white border border-slate-200 shadow-sm text-amber-500'}`}>
              {isEnabled ? <ShieldCheck className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-slate-900 leading-tight">
                1-Click Trading
              </h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Powered by Initia Auto-Sign
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-5 bg-white">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Sign transactions instantly without MetaMask popups. Ideal for rapid payroll staging and batch executions.
          </p>

          <ul className="space-y-2.5 mb-5">
            <li className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Skip repetitive wallet approvals
            </li>
            <li className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Session auto-expires for security
            </li>
          </ul>

          {/* --- 3. THE ACTUAL TOGGLE SWITCH --- */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                {isEnabled ? "Auto-Sign Active" : "Enable Auto-Sign"}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                {isLoading ? "Processing..." : isEnabled ? "Secure Session" : "Requires Signature"}
              </span>
            </div>
            
            <Switch
              checked={isEnabled}
              disabled={isLoading}
              onCheckedChange={(checked) => {
                if (checked) enable.mutate();
                else disable.mutate();
              }}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}