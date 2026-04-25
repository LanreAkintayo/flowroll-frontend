"use client";

import { useMutation } from "@tanstack/react-query";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { Zap, ShieldCheck, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  APPCHAIN_COSMOS_ID, 
  TESTNET_COSMOS_ID, 
  APPCHAIN_CONFIG, 
  TESTNET_CONFIG,
  TESTNET_EVM
} from "@/lib/interwoven";
import { flowLog } from "@/lib/utils";

interface AutoSignToggleProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function AutoSignToggle({ variant = 'compact', className = '' }: AutoSignToggleProps) {
  const { autoSign, address } = useInterwovenKit();
  const currentEvmChainId = useChainId();

  flowLog("Current EVM Chain ID:", currentEvmChainId);

  // Map EVM chain ID to Cosmos config for interwoven auto-sign
  const isTestnet = currentEvmChainId === TESTNET_EVM.id;
  const chainId = isTestnet ? TESTNET_COSMOS_ID : APPCHAIN_COSMOS_ID;
  const chainName = isTestnet ? TESTNET_CONFIG.pretty_name : APPCHAIN_CONFIG.pretty_name;

  const enable = useMutation({
    mutationFn: () => autoSign.enable(chainId),
    onSuccess: () => toast.success(`1-Click Protocol Enabled on ${chainName}`),
    onError: (error: any) => toast.error(error.message || "Activation failed"),
  });

  const disable = useMutation({
    mutationFn: () => autoSign.disable(chainId),
    onSuccess: () => toast.info(`1-Click Mode Offline for ${chainName}`),
    onError: (error: any) => toast.error(error.message || "Deactivation failed"),
  });

  if (!autoSign || !address) return null;

  const isEnabled = autoSign.isEnabledByChain[chainId];
  const isLoading = autoSign.isLoading || enable.isPending || disable.isPending;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`group relative rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-500 overflow-hidden shadow-xs ${
            variant === 'compact' ? 'h-10 px-3 sm:px-4' : 'h-12 px-4 sm:px-6'
          } ${className}`}
        >
          <div className="relative z-10 flex items-center gap-2 sm:gap-2.5">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />
            ) : (
              <div className="relative flex items-center justify-center shrink-0">
                {isEnabled ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Zap className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                )}
              </div>
            )}

            <span className={`text-xs sm:text-sm font-bold tracking-tight ${isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              {variant === 'full' ? (isEnabled ? "1-Click Active" : "1-Click Mode") : (isEnabled ? "Active" : "1-Click")}
            </span>
            
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 shrink-0 ${isEnabled ? 'rotate-0' : '-rotate-90'}`} />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end" 
        sideOffset={12}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] sm:w-[340px] z-[250] p-0 rounded-[2rem] overflow-hidden bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        <div className="relative p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/50">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
              isEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
            }`}>
              {isEnabled ? <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /> : <Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div>
              <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tighter">1-Click Protocol</h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automated Signing</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Authorize transactions instantly without manual wallet prompts. Perfect for fast-paced payroll staging and batch operations.
          </p>

          <ul className="space-y-2.5 sm:space-y-3">
            <li className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Zero-Prompt Batching
            </li>
            <li className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Session-based Security
            </li>
          </ul>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 sm:p-4 border border-slate-100 dark:border-slate-800/50 flex items-center justify-between transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                {isEnabled ? "Active Session" : "Secure Sign"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 line-clamp-1">
                {isLoading ? "Processing..." : isEnabled ? `Live on ${chainName}` : "Requires Sig"}
              </span>
            </div>
            
            <Switch
              checked={isEnabled}
              disabled={isLoading}
              onCheckedChange={(checked) => checked ? enable.mutate() : disable.mutate()}
              className="data-[state=checked]:bg-emerald-500 scale-100 sm:scale-110 cursor-pointer shrink-0 ml-2"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


// "use client";

// import { useMutation } from "@tanstack/react-query";
// import { useInterwovenKit } from "@initia/interwovenkit-react";
// import { Zap, ShieldCheck, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
// import { toast } from "sonner";

// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";
// import { COSMOS_CHAIN_ID, CUSTOM_APP_CHAIN } from "@/lib/interwoven";

// interface AutoSignToggleProps {
//     variant?: 'full' | 'compact';
//     className?: string;
// }

// export function AutoSignToggle({ variant = 'compact', className = '' }: AutoSignToggleProps) {
//     // Protocol integrations
//     const { autoSign, address } = useInterwovenKit();
//     const chainId = COSMOS_CHAIN_ID;
//     const chainName = CUSTOM_APP_CHAIN.chain_name;

//     // Mutators
//     const enable = useMutation({
//         mutationFn: () => autoSign.enable(chainId),
//         onSuccess: () => toast.success("1-Click Protocol Enabled"),
//         onError: (error: any) => toast.error(error.message || "Activation failed"),
//     });

//     const disable = useMutation({
//         mutationFn: () => autoSign.disable(chainId),
//         onSuccess: () => toast.info("1-Click Mode Offline"),
//         onError: (error: any) => toast.error(error.message || "Deactivation failed"),
//     });

//     if (!autoSign || !address) return null;

//     // Derived state
//     const isEnabled = autoSign.isEnabledByChain[chainId];
//     const isLoading = autoSign.isLoading || enable.isPending || disable.isPending;

//     return (
//         <Popover>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="outline"
//                     className={`group relative rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-500 overflow-hidden shadow-xs ${
//                         variant === 'compact' ? 'h-10 px-3 sm:px-4' : 'h-12 px-4 sm:px-6'
//                     } ${className}`}
//                 >
//                     <div className="relative z-10 flex items-center gap-2 sm:gap-2.5">
//                         {isLoading ? (
//                             <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />
//                         ) : (
//                             <div className="relative flex items-center justify-center shrink-0">
//                                 {isEnabled ? (
//                                     <ShieldCheck className="w-4 h-4 text-emerald-500" />
//                                 ) : (
//                                     <Zap className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
//                                 )}
//                             </div>
//                         )}

//                         <span className={`text-xs sm:text-sm font-bold tracking-tight ${isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
//                             {variant === 'full' ? (isEnabled ? "1-Click Active" : "1-Click Mode") : (isEnabled ? "Active" : "1-Click")}
//                         </span>
                        
//                         <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 shrink-0 ${isEnabled ? 'rotate-0' : '-rotate-90'}`} />
//                     </div>
//                 </Button>
//             </PopoverTrigger>

//             <PopoverContent 
//                 align="end" 
//                 sideOffset={12}
//                 collisionPadding={16}
//                 className="w-[calc(100vw-2rem)] sm:w-[340px] z-[250] p-0 rounded-[2rem] overflow-hidden bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-slate-800 shadow-2xl"
//             >
//                 <div className="relative p-5 sm:p-6 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800/50">
//                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
//                     <div className="flex items-center gap-3 sm:gap-4">
//                         <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
//                             isEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400'
//                         }`}>
//                             {isEnabled ? <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /> : <Zap className="w-5 h-5 sm:w-6 sm:h-6" />}
//                         </div>
//                         <div>
//                             <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tighter">1-Click Protocol</h4>
//                             <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Automated Signing</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
//                     <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
//                         Authorize transactions instantly without manual wallet prompts. Perfect for fast-paced payroll staging and batch operations.
//                     </p>

//                     <ul className="space-y-2.5 sm:space-y-3">
//                         <li className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
//                             <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
//                             Zero-Prompt Batching
//                         </li>
//                         <li className="flex items-center gap-3 text-xs font-medium text-slate-700 dark:text-slate-300">
//                             <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
//                             Session-based Security
//                         </li>
//                     </ul>

//                     <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 sm:p-4 border border-slate-100 dark:border-slate-800/50 flex items-center justify-between transition-colors">
//                         <div className="flex flex-col">
//                             <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
//                                 {isEnabled ? "Active Session" : "Secure Sign"}
//                             </span>
//                             <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 line-clamp-1">
//                                 {isLoading ? "Processing..." : isEnabled ? `Live on ${chainName}` : "Requires Sig"}
//                             </span>
//                         </div>
                        
//                         <Switch
//                             checked={isEnabled}
//                             disabled={isLoading}
//                             onCheckedChange={(checked) => checked ? enable.mutate() : disable.mutate()}
//                             className="data-[state=checked]:bg-emerald-500 scale-100 sm:scale-110 cursor-pointer shrink-0 ml-2"
//                         />
//                     </div>
//                 </div>
//             </PopoverContent>
//         </Popover>
//     );
// }