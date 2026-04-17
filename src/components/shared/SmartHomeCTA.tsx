"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { useOnboardingQueries } from "@/hooks/onboarding/useOnboardingQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { useTokenBalance } from "@/hooks/token/useTokenQueries";

import { Button } from "../ui/button";
import { RoleSelectionModal } from "./RoleSelectionModal";
import WalletConnectButton from "./WalletConnectButton";

export default function SmartHomeCTA() {
  const router = useRouter();
  
  // Component state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Protocol integrations
  const { initiaAddress } = useInterwovenKit();
  const { address: evmAddress, contracts } = useContractClient();
  
  // Data synchronization
  const { balances, isLoadingBalances } = useOnboardingQueries(evmAddress);
  const { data: usdcTokenBalance } = useTokenBalance(contracts.USDC_ADDRESS);

  if (!initiaAddress) {
    return <WalletConnectButton />;
  }

  // Derived onboarding state
  const hasGas = (balances?.gas ?? 0) > 0;
  const hasUSDC = (usdcTokenBalance ?? 0n) > 0n;
  const isOnboarded = hasGas && hasUSDC;

  return (
    <div className="flex items-center gap-3">
      
      {/* Secondary connect button (hidden on mobile) */}
      <div className="hidden sm:block">
        <WalletConnectButton variant="compact" />
      </div>

      {/* Primary Call to Action */}
      <Button
        onClick={() => (isOnboarded ? setIsRoleModalOpen(true) : router.push("/onboarding"))}
        disabled={isLoadingBalances}
        className="group relative h-10 px-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-all duration-300 hover:bg-slate-800 dark:hover:bg-slate-200 border-none shadow-none cursor-pointer"
      >
        {isLoadingBalances ? (
          "Checking..."
        ) : isOnboarded ? (
          <span className="flex items-center gap-2">
            Launch App 
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Complete Setup 
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </Button>

      {/* Application router portal */}
      <RoleSelectionModal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
      />
      
    </div>
  );
}