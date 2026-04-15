"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useInterwovenKit } from "@initia/interwovenkit-react";

import { useOnboardingQueries } from "@/hooks/onboarding/useOnboardingQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { Button } from "../ui/button";
import { RoleSelectionModal } from "./RoleSelectionModal";
import WalletConnectButton from "./WalletConnectButton";

export default function SmartHomeCTA() {
  const router = useRouter();
  const { initiaAddress } = useInterwovenKit();
  const { address: evmAddress } = useContractClient();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const { balances, isLoadingBalances } = useOnboardingQueries(evmAddress);

  if (!initiaAddress) {
    return <WalletConnectButton />;
  }

  const isOnboarded = balances.gas > 0 && balances.usdc > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block">
        <WalletConnectButton variant="compact" />
      </div>

      <Button
        onClick={() => (isOnboarded ? setIsRoleModalOpen(true) : router.push("/onboarding"))}
        disabled={isLoadingBalances}
        className="group relative h-10 px-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm transition-all duration-300 hover:bg-slate-950 hover:-translate-y-0 border-none shadow-none cursor-pointer"
      >
        {isLoadingBalances ? (
          "Checking..."
        ) : isOnboarded ? (
          <span className="flex items-center gap-2">
            Launch App <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Complete Setup <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
          </span>
        )}
      </Button>

      <RoleSelectionModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
    </div>
  );
}