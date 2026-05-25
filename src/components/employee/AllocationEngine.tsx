"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Info,
  Loader2,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
} from "lucide-react";
import { formatUnits, parseUnits } from "viem";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useVaultActions } from "@/hooks/vault/useVaultActions";
import { useAvailableBalance } from "@/hooks/vault/useVaultQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { explorerCosmosTxs } from "@/lib/interwoven";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

type TxState = "idle" | "review" | "processing" | "success" | "error";

export interface PoolEntry {
  pool: `0x${string}`;
  isActive: boolean;
  isStablePair: boolean;
}

export function AllocationEngine() {
  const { address, chainName } = useContractClient();
  const { data: claimableBalance } = useAvailableBalance(address);
  const { claim, claimAndSave } = useVaultActions();

  const [claimInput, setClaimInput] = useState<string>("");
  const [savePct, setSavePct] = useState<number>(0);
  
  // Set default initial state values to 5 minutes for immediate testing loops
  const [durationValue, setDurationValue] = useState<string>("5");
  const [durationType, setDurationType] = useState<string>("minutes");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [txError, setTxError] = useState<string>("");

  const numClaimInput = Number(claimInput) || 0;
  const vaultAmount = numClaimInput * (savePct / 100);
  const liquidAmount = numClaimInput - vaultAmount;

  const formattedMax = claimableBalance
    ? formatUnits(claimableBalance, 6)
    : "0";

  const handleOpenChange = (open: boolean) => {
    if (txState === "processing") return;
    setIsModalOpen(open);
    if (!open) {
      setTxState("idle");
      setTxError("");
      setTxHash("");
    }
  };

  const getDurationInMinutes = (val: number, type: string): number => {
    switch (type) {
      case "minutes": return val;
      case "hours": return val * 60;
      case "days": return val * 1440;
      default: return val;
    }
  };

  const handleDurationChange = (inputValue: string, type: string) => {
    if (inputValue === "") {
      setDurationValue("");
      return;
    }

    const numVal = Number(inputValue);
    if (isNaN(numVal)) return;

    const totalMinutes = getDurationInMinutes(numVal, type);
    
    // Testing Constraint: Absolute cap locked at exactly 1 day (1440 minutes)
    if (totalMinutes <= 1440) {
      setDurationValue(inputValue);
    } else {
      if (type === "minutes") setDurationValue("1440");
      if (type === "hours") setDurationValue("24");
      if (type === "days") setDurationValue("1");
    }
  };

  const executeTransaction = async () => {
    setTxState("processing");
    setTxError("");

    try {
      const amountBigInt = parseUnits(claimInput, 6);
      let hash = "";

      if (savePct === 0) {
        hash = await claim.mutateAsync({ amount: amountBigInt });
      } else {
        let seconds = Number(durationValue);
        if (durationType === "minutes") seconds *= 60;
        if (durationType === "hours") seconds *= 3600;
        if (durationType === "days") seconds *= 86400;

        hash = await claimAndSave.mutateAsync({
          amount: amountBigInt,
          savePct: savePct,
          durationInSeconds: seconds,
        });
      }

      setTxHash(hash);
      setTxState("success");
    } catch (error: any) {
      setTxError(error.message || "Transaction failed or was rejected.");
      setTxState("error");
    }
  };

  return (
    <div className="lg:col-span-7 flex flex-col h-full">
      <div className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col h-full">
        <div className="px-5 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest truncate">
              Allocation Engine
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-6 pb-6 px-5 sm:pt-8 sm:pb-8 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-1 sm:mb-2 text-center">
            You are claiming
          </p>

          <div className="relative group flex items-center justify-center w-full my-2 sm:my-3">
            <div className="flex items-center justify-center max-w-full">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-300 dark:text-slate-700 transition-colors group-focus-within:text-slate-900 dark:group-focus-within:text-white mr-1 sm:mr-1.5 shrink-0">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={claimInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) {
                    if (val === "" || val === ".") {
                      setClaimInput(val);
                      return;
                    }
                    const numVal = parseFloat(val);
                    const maxVal = parseFloat(formattedMax);
                    if (!isNaN(numVal) && !isNaN(maxVal) && numVal <= maxVal) {
                      setClaimInput(val);
                    }
                  }
                }}
                style={{ width: `${(claimInput.length || 4) + 0.5}ch` }}
                className="bg-transparent text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white text-left outline-none tabular-nums tracking-tighter placeholder:text-slate-200 dark:placeholder:text-slate-800 transition-all min-w-0 p-0"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            onClick={() => setClaimInput(formattedMax)}
            className="mt-2 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 sm:px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 max-w-full"
          >
            <span className="truncate">
              Balance: {formatMoney(parseUnits(formattedMax, 6), 6)} USDC
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 shrink-0">
              Max
            </span>
          </button>
        </div>

        <div className="p-5 sm:p-6 lg:p-8 flex flex-col relative z-10 flex-1">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                Routing Split
              </h3>

              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
                {[0, 25, 50, 75, 100].map((pct) => {
                  const isMaxZero = parseFloat(formattedMax) === 0;
                  return (
                    <button
                      key={pct}
                      onClick={() => setSavePct(pct)}
                      disabled={isMaxZero}
                      className={`flex-1 sm:flex-none text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        savePct === pct
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative w-full h-2.5 sm:h-3 bg-slate-100 dark:bg-slate-900 rounded-full mb-6 sm:mb-8 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-slate-900 dark:bg-slate-300 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${savePct}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={savePct}
                onChange={(e) => setSavePct(Number(e.target.value))}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:items-stretch bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-[1rem] sm:rounded-[1.25rem] overflow-hidden">
              <div className="flex-1 p-4 sm:p-5 bg-slate-50 dark:bg-[#0f0f0f] min-w-0">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 sm:mb-2 truncate">
                  <Wallet className="w-3 h-3 shrink-0" /> Liquid
                </p>
                <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0 w-full">
                  <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums leading-none truncate">
                    {formatMoney(parseUnits(liquidAmount.toString(), 6), 6)}
                  </p>
                  <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
                    USDC
                  </span>
                </div>
              </div>

              <div className="w-full h-px sm:w-px sm:h-auto bg-slate-200 dark:bg-slate-800 shrink-0" />

              <div
                className={`flex-1 p-4 sm:p-5 transition-all duration-500 min-w-0 ${
                  savePct > 0
                    ? "bg-emerald-50/50 dark:bg-emerald-500/10"
                    : "bg-white dark:bg-[#0A0A0A]"
                }`}
              >
                <p
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1.5 sm:mb-2 truncate ${savePct > 0 ? "text-slate-600 dark:text-slate-400" : "text-slate-500"}`}
                >
                  <TrendingUp className="w-3 h-3 shrink-0" /> Auto-Save
                </p>
                <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0 w-full">
                  <p
                    className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums leading-none truncate ${savePct > 0 ? "text-slate-700 dark:text-white" : "text-slate-600"}`}
                  >
                    {formatMoney(parseUnits(vaultAmount.toString(), 6), 6)}
                  </p>
                  <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
                    USDC
                  </span>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {savePct > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
                  <div className="flex gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                    <div className="mt-0.5 shrink-0">
                      <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mb-0.5 truncate">
                        Flowroll Vault Enabled
                      </h4>
                      <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-snug">
                        Funds will accrue yield. Lock limits constrained to max 1 day for quick tests.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 block truncate">
                        Duration
                      </label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={durationValue}
                        onChange={(e) => handleDurationChange(e.target.value, durationType)}
                        className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 h-9 sm:h-10 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700 focus-visible:ring-offset-0 tabular-nums w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 block truncate">
                        Time Unit
                      </label>
                      <Select 
                        value={durationType} 
                        onValueChange={(type) => {
                          setDurationType(type);
                          handleDurationChange(durationValue, type);
                        }}
                      >
                        <SelectTrigger className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 h-9 sm:h-10 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 focus:ring-offset-0 w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800">
                          <SelectItem value="minutes" className="cursor-pointer font-medium text-xs sm:text-sm">Minutes</SelectItem>
                          <SelectItem value="hours" className="cursor-pointer font-medium text-xs sm:text-sm">Hours</SelectItem>
                          <SelectItem value="days" className="cursor-pointer font-medium text-xs sm:text-sm">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={() => {
              setTxState("review");
              setIsModalOpen(true);
            }}
            disabled={numClaimInput <= 0}
            className={`w-full h-12 sm:h-14 mt-auto rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              savePct > 0
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md border-none"
                : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-md border-none"
            }`}
          >
            <span className="truncate">
              {savePct > 0
                ? `Execute: Claim & Route (${savePct}%)`
                : "Execute: Liquid Claim"}
            </span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 shrink-0" />
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="sm:max-w-[400px] bg-white dark:bg-[#0B0B0B] border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[1.75rem] shadow-2xl gap-0"
        >
          <DialogTitle className="sr-only">Confirm Allocation Processing</DialogTitle>

          <div className="p-6 sm:p-8">
            {txState === "review" && (
              <div className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">
                    Review Allocation
                  </h3>
                </div>

                <div className="bg-slate-50 dark:bg-[#121212] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 mb-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Total Capital Claiming
                    </p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                      {formatMoney(parseUnits(numClaimInput.toString(), 6), 6)} <span className="text-sm font-bold text-slate-400">USDC</span>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Liquid Wallet</span>
                      <span className="text-sm font-mono font-medium text-slate-800 dark:text-white">
                        {formatMoney(parseUnits(liquidAmount.toString(), 6), 6)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Yield Auto-Save</span>
                      <span className="text-sm font-mono font-medium text-emerald-900 dark:text-emerald-400">
                        {formatMoney(parseUnits(vaultAmount.toString(), 6), 6)} USDC
                      </span>
                    </div>
                    {savePct > 0 && (
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Lock Time</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {durationValue} {durationType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-md border-none text-sm transition-all"
                  onClick={executeTransaction}
                >
                  Execute Transaction
                </Button>
              </div>
            )}

            {txState === "processing" && (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-full border-[3px] border-slate-100 dark:border-slate-800/40" />
                  <Loader2 className="w-14 h-14 text-slate-900 dark:text-white animate-spin absolute top-0 left-0 stroke-[2.5]" />
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1.5">Processing Allocation</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
                  Wait a moment. The allocation is currently being processed. Confirm on your wallet if need be.
                </p>
              </div>
            )}

            {txState === "success" && (
              <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 stroke-[2.5]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">Split Successful</h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[260px] leading-relaxed mb-6">
                  Your capital split has completed execution and is now generating yield.
                </p>

                {txHash && (
                  <a
                    href={`${explorerCosmosTxs(chainName)}${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 px-4 h-11 rounded-xl transition-colors mb-4"
                  >
                    <span className="font-mono truncate max-w-[220px]">Tx: {txHash}</span>
                    <span className="flex items-center gap-1 shrink-0 text-blue-500">
                      Explorer <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </a>
                )}

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm"
                    onClick={() => handleOpenChange(false)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    asChild
                    className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold border-none text-sm shadow-sm"
                  >
                    <Link href="/vault">
                      View Active Vaults
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {txState === "error" && (
              <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-5">
                  <AlertOctagon className="w-7 h-7 text-red-500 stroke-[2.5]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">Execution Rejected</h2>
                <p className="text-xs font-medium text-red-500/90 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl p-3 mb-6 w-full text-left font-mono text-[11px] max-h-[120px] overflow-y-auto break-all">
                  {txError || "The transaction was dropped by consensus channels or manually rejected."}
                </p>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm"
                  onClick={() => handleOpenChange(false)}
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Wallet,
//   ShieldCheck,
//   ArrowRight,
//   TrendingUp,
//   Info,
//   Loader2,
//   CheckCircle2,
//   AlertOctagon,
//   ArrowUpRight,
//   X,
// } from "lucide-react";
// import { formatUnits, parseUnits } from "viem";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// import { useVaultActions } from "@/hooks/vault/useVaultActions";
// import { useAvailableBalance } from "@/hooks/vault/useVaultQueries";
// import { useContractClient } from "@/hooks/useContractClient";
// import { explorerCosmosTxs } from "@/lib/interwoven";
// import { formatMoney } from "@/lib/utils";
// import Link from "next/link";

// type TxState = "idle" | "review" | "processing" | "success" | "error";

// export interface PoolEntry {
//   pool: `0x${string}`;
//   isActive: boolean;
//   isStablePair: boolean;
// }

// export function AllocationEngine() {
//   const { address, chainName } = useContractClient();
//   const { data: claimableBalance } = useAvailableBalance(address);
//   const { claim, claimAndSave } = useVaultActions();

//   const [claimInput, setClaimInput] = useState<string>("");
//   const [savePct, setSavePct] = useState<number>(0);
//   const [durationValue, setDurationValue] = useState<string>("30");
//   const [durationType, setDurationType] = useState<string>("days");

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [txState, setTxState] = useState<TxState>("idle");
//   const [txHash, setTxHash] = useState<string>("");
//   const [txError, setTxError] = useState<string>("");

//   const numClaimInput = Number(claimInput) || 0;
//   const vaultAmount = numClaimInput * (savePct / 100);
//   const liquidAmount = numClaimInput - vaultAmount;

//   const formattedMax = claimableBalance
//     ? formatUnits(claimableBalance, 6)
//     : "0";

//   const handleOpenChange = (open: boolean) => {
//     if (txState === "processing") return;
//     setIsModalOpen(open);
//     if (!open) {
//       setTxState("idle");
//       setTxError("");
//       setTxHash("");
//     }
//   };

//   const executeTransaction = async () => {
//     setTxState("processing");
//     setTxError("");

//     try {
//       const amountBigInt = parseUnits(claimInput, 6);
//       let hash = "";

//       if (savePct === 0) {
//         hash = await claim.mutateAsync({ amount: amountBigInt });
//       } else {
//         let seconds = Number(durationValue);
//         if (durationType === "minutes") seconds *= 60;
//         if (durationType === "hours") seconds *= 3600;
//         if (durationType === "days") seconds *= 86400;
//         if (durationType === "months") seconds *= 2592000;

//         hash = await claimAndSave.mutateAsync({
//           amount: amountBigInt,
//           savePct: savePct,
//           durationInSeconds: seconds,
//         });
//       }

//       setTxHash(hash);
//       setTxState("success");
//     } catch (error: any) {
//       setTxError(error.message || "Transaction failed or was rejected.");
//       setTxState("error");
//     }
//   };

//   return (
//     <div className="lg:col-span-7 flex flex-col h-full">
//       <div className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col h-full">
//         <div className="px-5 sm:px-6 lg:px-8 pt-5 sm:pt-6 lg:pt-8 flex items-center justify-between relative z-10">
//           <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
//             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
//               <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white" />
//             </div>
//             <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest truncate">
//               Allocation Engine
//             </h2>
//           </div>
//         </div>

//         <div className="flex flex-col items-center justify-center pt-6 pb-6 px-5 sm:pt-8 sm:pb-8 sm:px-8 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
//           <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-1 sm:mb-2 text-center">
//             You are claiming
//           </p>

//           <div className="relative group flex items-center justify-center w-full my-2 sm:my-3">
//             <div className="flex items-center justify-center max-w-full">
//               <span className="text-4xl sm:text-5xl lg:text-6xl font-light text-slate-300 dark:text-slate-700 transition-colors group-focus-within:text-slate-900 dark:group-focus-within:text-white mr-1 sm:mr-1.5 shrink-0">
//                 $
//               </span>
//               <input
//                 type="text"
//                 inputMode="decimal"
//                 value={claimInput}
//                 onChange={(e) => {
//                   const val = e.target.value;
//                   if (/^\d*\.?\d*$/.test(val)) {
//                     if (val === "" || val === ".") {
//                       setClaimInput(val);
//                       return;
//                     }
//                     const numVal = parseFloat(val);
//                     const maxVal = parseFloat(formattedMax);
//                     if (!isNaN(numVal) && !isNaN(maxVal) && numVal <= maxVal) {
//                       setClaimInput(val);
//                     }
//                   }
//                 }}
//                 style={{ width: `${(claimInput.length || 4) + 0.5}ch` }}
//                 className="bg-transparent text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white text-left outline-none tabular-nums tracking-tighter placeholder:text-slate-200 dark:placeholder:text-slate-800 transition-all min-w-0 p-0"
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           <button
//             onClick={() => setClaimInput(formattedMax)}
//             className="mt-2 sm:mt-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 sm:px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 max-w-full"
//           >
//             <span className="truncate">
//               Balance: {formatMoney(parseUnits(formattedMax, 6), 6)} USDC
//             </span>
//             <span className="text-[8px] sm:text-[9px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 shrink-0">
//               Max
//             </span>
//           </button>
//         </div>

//         <div className="p-5 sm:p-6 lg:p-8 flex flex-col relative z-10 flex-1">
//           <div className="mb-6 sm:mb-8">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
//               <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
//                 Routing Split
//               </h3>

//               <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
//                 {[0, 25, 50, 75, 100].map((pct) => {
//                   const isMaxZero = parseFloat(formattedMax) === 0;
//                   return (
//                     <button
//                       key={pct}
//                       onClick={() => setSavePct(pct)}
//                       disabled={isMaxZero}
//                       className={`flex-1 sm:flex-none text-[10px] font-bold px-2 sm:px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
//                         savePct === pct
//                           ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
//                           : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
//                       }`}
//                     >
//                       {pct}%
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             <div className="relative w-full h-2.5 sm:h-3 bg-slate-100 dark:bg-slate-900 rounded-full mb-6 sm:mb-8 border border-slate-200 dark:border-slate-800 overflow-hidden">
//               <div
//                 className="absolute top-0 left-0 h-full bg-slate-900 dark:bg-slate-300 rounded-full transition-all duration-300 ease-out"
//                 style={{ width: `${savePct}%` }}
//               />
//               <input
//                 type="range"
//                 min="0"
//                 max="100"
//                 step="1"
//                 value={savePct}
//                 onChange={(e) => setSavePct(Number(e.target.value))}
//                 className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
//               />
//             </div>

//             <div className="flex flex-col sm:flex-row w-full sm:items-stretch bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-[1rem] sm:rounded-[1.25rem] overflow-hidden">
//               <div className="flex-1 p-4 sm:p-5 bg-slate-50 dark:bg-[#0f0f0f] min-w-0">
//                 <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5 sm:mb-2 truncate">
//                   <Wallet className="w-3 h-3 shrink-0" /> Liquid
//                 </p>
//                 <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0 w-full">
//                   <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums leading-none truncate">
//                     {formatMoney(parseUnits(liquidAmount.toString(), 6), 6)}
//                   </p>
//                   <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
//                     USDC
//                   </span>
//                 </div>
//               </div>

//               <div className="w-full h-px sm:w-px sm:h-auto bg-slate-200 dark:bg-slate-800 shrink-0" />

//               <div
//                 className={`flex-1 p-4 sm:p-5 transition-all duration-500 min-w-0 ${
//                   savePct > 0
//                     ? "bg-emerald-50/50 dark:bg-emerald-500/10"
//                     : "bg-white dark:bg-[#0A0A0A]"
//                 }`}
//               >
//                 <p
//                   className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1.5 sm:mb-2 truncate ${savePct > 0 ? "text-slate-600 dark:text-slate-400" : "text-slate-500"}`}
//                 >
//                   <TrendingUp className="w-3 h-3 shrink-0" /> Auto-Save
//                 </p>
//                 <div className="flex items-baseline gap-1 sm:gap-1.5 min-w-0 w-full">
//                   <p
//                     className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums leading-none truncate ${savePct > 0 ? "text-slate-700 dark:text-white" : "text-slate-600"}`}
//                   >
//                     {formatMoney(parseUnits(vaultAmount.toString(), 6), 6)}
//                   </p>
//                   <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
//                     USDC
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <AnimatePresence>
//             {savePct > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: "auto" }}
//                 exit={{ opacity: 0, height: 0 }}
//                 className="overflow-hidden"
//               >
//                 <div className="bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8">
//                   <div className="flex gap-2.5 sm:gap-3 mb-4 sm:mb-5">
//                     <div className="mt-0.5 shrink-0">
//                       <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
//                     </div>
//                     <div className="min-w-0">
//                       <h4 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white mb-0.5 truncate">
//                         Flowroll Vault Enabled
//                       </h4>
//                       <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 leading-snug">
//                         Funds will be locked and accrue APY until the duration expires.
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
//                     <div className="min-w-0">
//                       <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 block truncate">
//                         Duration
//                       </label>
//                       <Input
//                         type="text"
//                         inputMode="decimal"
//                         value={durationValue}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           if (/^\d*\.?\d*$/.test(val)) setDurationValue(val);
//                         }}
//                         className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 h-9 sm:h-10 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700 focus-visible:ring-offset-0 tabular-nums w-full"
//                       />
//                     </div>
//                     <div className="min-w-0">
//                       <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 block truncate">
//                         Time Unit
//                       </label>
//                       <Select value={durationType} onValueChange={setDurationType}>
//                         <SelectTrigger className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 h-9 sm:h-10 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 focus:ring-offset-0 w-full">
//                           <SelectValue placeholder="Select unit" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800">
//                           <SelectItem value="minutes" className="cursor-pointer font-medium text-xs sm:text-sm">Minutes</SelectItem>
//                           <SelectItem value="hours" className="cursor-pointer font-medium text-xs sm:text-sm">Hours</SelectItem>
//                           <SelectItem value="days" className="cursor-pointer font-medium text-xs sm:text-sm">Days</SelectItem>
//                           <SelectItem value="months" className="cursor-pointer font-medium text-xs sm:text-sm">Months</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <Button
//             onClick={() => {
//               setTxState("review");
//               setIsModalOpen(true);
//             }}
//             disabled={numClaimInput <= 0}
//             className={`w-full h-12 sm:h-14 mt-auto rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
//               savePct > 0
//                 ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md border-none"
//                 : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-md border-none"
//             }`}
//           >
//             <span className="truncate">
//               {savePct > 0
//                 ? `Execute: Claim & Route (${savePct}%)`
//                 : "Execute: Liquid Claim"}
//             </span>
//             <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2 shrink-0" />
//           </Button>
//         </div>
//       </div>

//       <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
//         <DialogContent
//           onInteractOutside={(e) => e.preventDefault()}
//           onEscapeKeyDown={(e) => e.preventDefault()}
//           className="sm:max-w-[400px] bg-white dark:bg-[#0B0B0B] border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[1.75rem] shadow-2xl gap-0"
//         >
//           <DialogTitle className="sr-only">Confirm Allocation Processing</DialogTitle>

//           {/* {txState !== "processing" && (
//             <button
//               onClick={() => handleOpenChange(false)}
//               className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-50"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           )} */}

//           <div className="p-6 sm:p-8">
//             {txState === "review" && (
//               <div className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
//                 <div className="mb-6">
//                   <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">
//                     Review Allocation
//                   </h3>
//                 </div>

//                 <div className="bg-slate-50 dark:bg-[#121212] rounded-2xl p-4 border border-slate-100 dark:border-slate-800/60 mb-6 space-y-4">
//                   <div>
//                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
//                       Total Capital Claiming
//                     </p>
//                     <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
//                       {formatMoney(parseUnits(numClaimInput.toString(), 6), 6)} <span className="text-sm font-bold text-slate-400">USDC</span>
//                     </p>
//                   </div>

//                   <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2.5">
//                     <div className="flex justify-between items-center gap-4">
//                       <span className="text-[10px] font-bold text-slate-400 uppercase">Liquid Wallet</span>
//                       <span className="text-sm font-mono font-medium text-slate-800 dark:text-white">
//                         {formatMoney(parseUnits(liquidAmount.toString(), 6), 6)} USDC
//                       </span>
//                     </div>
//                     <div className="flex justify-between items-center gap-4">
//                       <span className="text-[10px] font-bold text-slate-400 uppercase">Yield Auto-Save</span>
//                       <span className="text-sm font-mono font-medium text-emerald-900 dark:text-emerald-400">
//                         {formatMoney(parseUnits(vaultAmount.toString(), 6), 6)} USDC
//                       </span>
//                     </div>
//                     {savePct > 0 && (
//                       <div className="flex justify-between items-center gap-4">
//                         <span className="text-[10px] font-bold text-slate-400 uppercase">Lock Time</span>
//                         <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
//                           {durationValue} {durationType}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <Button
//                   className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-md border-none text-sm transition-all"
//                   onClick={executeTransaction}
//                 >
//                   Execute Transaction
//                 </Button>
//               </div>
//             )}

//             {txState === "processing" && (
//               <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in-95 duration-200">
//                 <div className="relative mb-6">
//                   <div className="w-14 h-14 rounded-full border-[3px] border-slate-100 dark:border-slate-800/40" />
//                   <Loader2 className="w-14 h-14 text-slate-900 dark:text-white animate-spin absolute top-0 left-0 stroke-[2.5]" />
//                 </div>
//                 <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1.5">Processing Allocation</h2>
//                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed">
//                   Wait a moment. The allocation is currently being processed. Confirm on your wallet if need be.
//                 </p>
//               </div>
//             )}

//            {txState === "success" && (
//               <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
//                 <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5">
//                   <CheckCircle2 className="w-7 h-7 text-emerald-500 stroke-[2.5]" />
//                 </div>
//                 <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">Split Successful</h2>
//                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-[260px] leading-relaxed mb-6">
//                   Your capital split has completed execution and is now generating yield.
//                 </p>

//                 {txHash && (
//                   <a
//                     href={`${explorerCosmosTxs(chainName)}${txHash}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="w-full flex items-center justify-between gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 px-4 h-11 rounded-xl transition-colors mb-4"
//                   >
//                     <span className="font-mono truncate max-w-[220px]">Tx: {txHash}</span>
//                     <span className="flex items-center gap-1 shrink-0 text-blue-500">
//                       Explorer <ArrowUpRight className="w-3 h-3" />
//                     </span>
//                   </a>
//                 )}

//                 {/* Dual navigation layout engine */}
//                 <div className="flex gap-3 w-full">
//                   <Button
//                     variant="outline"
//                     className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm"
//                     onClick={() => handleOpenChange(false)}
//                   >
//                     Dismiss
//                   </Button>
//                   <Button
//                     asChild
//                     className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold border-none text-sm shadow-sm"
//                   >
//                     <Link href="/vault">
//                       View Active Vaults
//                     </Link>
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {txState === "error" && (
//               <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
//                 <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-5">
//                   <AlertOctagon className="w-7 h-7 text-red-500 stroke-[2.5]" />
//                 </div>
//                 <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">Execution Rejected</h2>
//                 <p className="text-xs font-medium text-red-500/90 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl p-3 mb-6 w-full text-left font-mono text-[11px] max-h-[120px] overflow-y-auto break-all">
//                   {txError || "The transaction was dropped by consensus channels or manually rejected."}
//                 </p>
//                 <Button
//                   variant="outline"
//                   className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm"
//                   onClick={() => handleOpenChange(false)}
//                 >
//                   Return to Dashboard
//                 </Button>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
