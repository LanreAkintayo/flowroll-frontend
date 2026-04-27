"use client";

import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { NetworkSwitcher } from "@/components/shared/NetworkSwitcher";
import WalletConnectButton from "../shared/WalletConnectButton";

interface ConnectWalletProps {
  isComplete: boolean;
  evmAddress?: `0x${string}`;
}

export function ConnectWallet({ isComplete, evmAddress }: ConnectWalletProps) {
  // If we have an address but it's not marked complete, they are on the wrong network
  const isWrongNetwork = !!evmAddress && !isComplete;

  return (
    <div
      className={`relative rounded-[2rem] p-6 sm:p-8 transition-colors duration-300 bg-white dark:bg-[#0a0a0a] border flex flex-col gap-6 ${
        isComplete
          ? "border-emerald-500/10"
          : isWrongNetwork
            ? "border-amber-500/30"
            : "border-slate-300 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex gap-5 items-start">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
              isComplete
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                : isWrongNetwork
                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            }`}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isWrongNetwork ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <Wallet className="w-6 h-6" />
            )}
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isComplete
                ? "Wallet Connected"
                : isWrongNetwork
                  ? "Switch Network"
                  : "Connect Wallet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md">
              {isComplete
                ? "Your wallet is securely connected to the correct network."
                : isWrongNetwork
                  ? "Please switch to the Flowroll Appchain or Initia Testnet to proceed."
                  : "Connect your EVM wallet to start the setup process."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Only show the network switcher if they are connected but on the wrong network */}
          {isWrongNetwork && <NetworkSwitcher />}

          {/* Only show the connect button if they are not connected at all */}
          {!isComplete && !isWrongNetwork && (
            <WalletConnectButton variant="compact" />
          )}
        </div>
      </div>
    </div>
  );
}
