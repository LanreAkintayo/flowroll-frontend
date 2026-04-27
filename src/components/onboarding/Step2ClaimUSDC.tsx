"use client";

import { HandCoins, CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useOnboardingActions } from "@/hooks/onboarding/useOnboardingActions";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { formatMoney } from "@/lib/utils";
import { parseUnits } from "viem";

interface Step2ClaimProps {
  isComplete: boolean;
  isUnlocked: boolean;
  evmAddress?: `0x${string}`;
}

export function Step2ClaimUSDC({
  isComplete,
  isUnlocked,
  evmAddress,
}: Step2ClaimProps) {
  const { claimUSDC } = useOnboardingActions(evmAddress);
  const { openConnect } = useInterwovenKit();

  const amountToClaim = 2000; // Amount of mock USDC to claim, can be adjusted as needed
  const parsedAmount = parseUnits(amountToClaim.toString(), 6); // Assuming USDC has 6 decimals

  const handleClaimAction = async () => {
    if (!evmAddress) {
      openConnect();
      return;
    }

    if (claimUSDC.isPending) return;

    const toastId = toast.loading("Minting test USDC...");

    try {
      await claimUSDC.mutateAsync();
      toast.success("USDC claimed successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Claim simulation failed:", error);
      toast.error(error.message || "Claim failed. Please try again.", {
        id: toastId,
      });
    }
  };

  return (
    <div
      className={`relative rounded-[2rem] p-6 sm:p-8 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] border flex flex-col gap-6 ${
        !isUnlocked
          ? "opacity-50 pointer-events-none border-slate-100 dark:border-slate-900 grayscale"
          : isComplete
            ? "border-emerald-500/10"
            : "border-slate-300 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex gap-5 items-start">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
              !isUnlocked
                ? "bg-slate-50 dark:bg-slate-900/50 text-slate-400"
                : isComplete
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            {!isUnlocked ? (
              <Lock className="w-6 h-6" />
            ) : isComplete ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <HandCoins className="w-6 h-6" />
            )}
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Claim Testnet USDC
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
              Claim {formatMoney(parsedAmount, 6)} USDC to test out Flowroll&apos;s
              yield routing and payroll execution.
            </p>
          </div>
        </div>

        <Button
          onClick={handleClaimAction}
          disabled={!isUnlocked || isComplete || claimUSDC.isPending}
          className={`w-full sm:w-auto shrink-0 h-12 px-8 rounded-xl font-bold cursor-pointer transition-colors duration-300 border-none shadow-sm ${
            !isUnlocked
              ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 shadow-none"
              : isComplete
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 opacity-80 shadow-none cursor-default"
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
          }`}
        >
          {claimUSDC.isPending && (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          )}
          {!isUnlocked ? "Locked" : isComplete ? "Claimed" : `Claim ${formatMoney(parsedAmount, 6)} USDC`}
        </Button>
      </div>
    </div>
  );
}