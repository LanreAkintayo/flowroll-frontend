import React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertOctagon, ArrowUpRight, X } from "lucide-react"

export type TxState = "idle" | "review" | "processing" | "success" | "error"

export interface TransactionDetail {
  label: string;
  value: string | React.ReactNode;
}

interface TransactionModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  status: TxState
  title?: string

  // The Universal Payload
  summaryAmount?: string
  summaryLabel?: string
  details?: TransactionDetail[]

  // Post-Execution Data
  hash?: string
  errorMessage?: string

  // Actions
  onConfirm: () => void
  onClose: () => void
}

export function TransactionModal({
  isOpen,
  setIsOpen,
  status,
  title = "Review Transaction",
  summaryAmount,
  summaryLabel = "Total Amount",
  details = [],
  hash,
  errorMessage,
  onConfirm,
  onClose
}: TransactionModalProps) {

  // Prevent closing the modal by clicking outside if it's currently processing
  const handleOpenChange = (open: boolean) => {
    if (status === "processing") return
    setIsOpen(open)
    if (!open) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent // 1. THIS MAKES IT PERSISTENT (Prevents clicking outside to close)
        onInteractOutside={(e) => e.preventDefault()}

        // 2. THIS DISABLES THE ESCAPE KEY (Optional, but good for total persistence)
        onEscapeKeyDown={(e) => e.preventDefault()}

        // 3. The `[&>button]:hidden` class completely hides the default Shadcn 'X' button
        className="sm:max-w-md bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 p-0 overflow-hidden gap-0 rounded-[1.5rem] shadow-2xl">
        {/* Hidden title for screen readers to satisfy Shadcn accessibility */}

        
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="p-6 sm:p-8">

          {/* --- STATE 1: REVIEW (The Universal Receipt) --- */}
          {status === "review" && (
            <div className="flex flex-col animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                {title}
              </h2>

              <div className=" border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 mb-6">

                {/* Optional Big Summary Number */}
                {summaryAmount && (
                  <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 text-center">
                      {summaryLabel}
                    </p>
                    <p className="text-3xl font-medium text-slate-900 dark:text-white tabular-nums text-center tracking-tighter">
                      {summaryAmount}
                    </p>
                  </div>
                )}

                {/* Dynamic Key-Value Receipt */}
                {details.length > 0 && (
                  <div className={`space-y-3 ${summaryAmount ? 'pt-5 border-t border-slate-200 dark:border-slate-800/80' : ''}`}>
                    {details.map((detail, index) => (
                      <div key={index} className="flex justify-between items-center gap-4">
                        <span className="text-xs font-bold text-slate-500 flex-shrink-0 uppercase">
                          {detail.label}
                        </span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white text-right truncate">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-md"
                  onClick={onConfirm}
                >
                  Sign & Execute
                </Button>
              </div>
            </div>
          )}

          {/* --- STATE 2: PROCESSING --- */}
          {status === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative mb-8">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
                <Loader2 className="w-16 h-16 text-slate-900 dark:text-white animate-spin absolute top-0 left-0" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Executing Transaction</h2>
              <p className="text-sm font-medium text-slate-500 text-center max-w-[250px] leading-relaxed">
                Please confirm the prompt in your wallet and wait for network confirmation.
              </p>
            </div>
          )}

          {/* --- STATE 3: SUCCESS --- */}
          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Transaction Successful</h2>
              <p className="text-sm font-medium text-slate-500 text-center mb-6">
                Your action has been confirmed on the blockchain.
              </p>

              {hash && (
                <a
                  href={`https://scan.testnet.initia.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline mb-8 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors"
                >
                  View on Explorer <ArrowUpRight className="w-3 h-3" />
                </a>
              )}

              <Button
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          )}

          {/* --- STATE 4: ERROR --- */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-6">
                <AlertOctagon className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Transaction Failed</h2>
              <p className="text-sm font-medium text-slate-500 text-center mb-8 max-w-[250px] leading-relaxed">
                {errorMessage || "The transaction was rejected or dropped by the network. Please try again."}
              </p>
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold"
                onClick={() => handleOpenChange(false)}
              >
                Dismiss
              </Button>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}