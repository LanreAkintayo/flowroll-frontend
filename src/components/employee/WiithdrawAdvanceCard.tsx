'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, ArrowDownCircle, CheckCircle2 } from 'lucide-react'
import { formatUnits, parseUnits } from 'viem'
import { toast } from "sonner"

import { useContractClient } from '@/hooks/useContractClient'
import { useAdvanceInfo } from '@/hooks/flowroll/useFlowrollQueries'
import { useFlowrollActions } from '@/hooks/flowroll/useFlowrollActions'
import { useAllowance } from '@/hooks/token/useTokenQueries' // Assuming this exists
import { useTokenActions } from '@/hooks/token/useTokenActions'   // Assuming this exists
import { formatMoney, flowLog } from '@/lib/utils'

type ActionTab = 'withdraw' | 'repay'

export function WithdrawAdvanceCard() {
    const { address: evmAddress, contracts } = useContractClient()
    
    // 1. DATA FETCHING
    const { data: advanceInfo, isLoading: isLoadingAdvance } = useAdvanceInfo()
    const { requestSalary, repayDebt } = useFlowrollActions(evmAddress)
    
    // 2. TOKEN QUERIES & ACTIONS (For Repayment)
    const { data: allowance  } = useAllowance(
        contracts.USDC_ADDRESS,
        contracts.FLOWROLL_CREDIT_ADDRESS 
    )
    const { approveToken } = useTokenActions(contracts.USDC_ADDRESS)
    
    const USDC_DECIMALS = 6

    // 3. LOCAL STATE
    const [activeTab, setActiveTab] = useState<ActionTab>('withdraw')
    const [rawAmount, setRawAmount] = useState<string>('')

    // 4. DERIVED LOGIC
    const currentDebtRaw = advanceInfo?.currentDebt ?? 0n
    const availableToRequestRaw = advanceInfo?.maxAvailableToDraw ?? 0n
    const feeBps = Number(advanceInfo?.currentFeeBps ?? 0n)
    const isDebtActive = currentDebtRaw > 0n
    const isWithdraw = activeTab === 'withdraw'
    const maxContextualAmount = isWithdraw ? availableToRequestRaw : currentDebtRaw

    let numericAmountRaw = 0n
    try {
        if (rawAmount && !isNaN(Number(rawAmount))) {
            numericAmountRaw = parseUnits(rawAmount, USDC_DECIMALS)
        }
    } catch (e) { numericAmountRaw = 0n }

    // const needsApproval = !isWithdraw && allowance && allowance < numericAmountRaw
    const needsApproval = !isWithdraw && (allowance ?? 0n) < numericAmountRaw;
    const exceedsMax = numericAmountRaw > maxContextualAmount
    const isInputActive = numericAmountRaw > 0n

    // Switch back to withdraw if debt is fully cleared
    useEffect(() => {
        if (!isDebtActive && activeTab === 'repay') setActiveTab('withdraw')
    }, [isDebtActive, activeTab])

    // ============================================================================
    // 5. THE UPDATED ACTION HANDLER (With Approval Orchestration)
    // ============================================================================
    const handleAction = async () => {
        if (!evmAddress) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (numericAmountRaw <= 0n || exceedsMax) return;

        const toastId = isWithdraw ? "withdraw-advance-tx" : "repay-debt-tx";
        
        try {
            if (isWithdraw) {
                toast.loading("Preparing withdrawal...", { id: toastId });
                await requestSalary.mutateAsync(numericAmountRaw);
                toast.success("Liquidity secured! Funds sent to wallet.", { id: toastId });
            } else {

                flowLog("Needs approval: ", needsApproval);
                // --- REPAYMENT FLOW ---
                if (needsApproval) {
                    toast.loading("Approving USDC spend...", { id: toastId });
                    await approveToken.mutateAsync({
                        spender: contracts.FLOWROLL_CREDIT_ADDRESS as `0x${string}`,
                        amount: numericAmountRaw
                    });
                    toast.loading("Approval successful! Settling debt...", { id: toastId });
                } else {
                    toast.loading("Preparing repayment...", { id: toastId });
                }

                await repayDebt.mutateAsync({ 
                    employee: evmAddress, 
                    amountInBaseUnits: numericAmountRaw 
                });
                
                toast.success("Debt settled! Your credit health has improved.", { id: toastId });
            }

            setRawAmount('');

        } catch (error: any) {
            flowLog('Action Error:', error);
            const errorMessage = error?.shortMessage || error?.message || "Transaction failed.";
            toast.error(errorMessage, { id: toastId });
        }
    };

    const handlePercentageClick = (percent: number) => {
        if (maxContextualAmount <= 0n) return;
        const calculated = (maxContextualAmount * BigInt(percent)) / 100n
        setRawAmount(formatUnits(calculated, USDC_DECIMALS))
    }

    return (
        <div className="lg:col-span-7 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 dark:from-slate-800/30 to-transparent pointer-events-none" />

            <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                            {isWithdraw ? <Zap className="w-5 h-5 text-emerald-500" /> : <ArrowDownCircle className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {isWithdraw ? "Withdraw Advance" : "Repay Active Debt"}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {isWithdraw ? "Access earned liquidity instantly." : "Settle your credit balance early."}
                            </p>
                        </div>
                    </div>

                    {isDebtActive && (
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 w-fit">
                            <button onClick={() => setActiveTab('withdraw')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isWithdraw ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Withdraw</button>
                            <button onClick={() => setActiveTab('repay')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isWithdraw ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Repay</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-8 space-y-8 flex-1 flex flex-col relative z-10">
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{isWithdraw ? "Amount to Draw" : "Amount to Repay"}</label>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {isWithdraw ? "Available: " : "Debt Balance: "}
                            <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {isLoadingAdvance ? '...' : `${formatMoney(maxContextualAmount, USDC_DECIMALS)} USDC`}
                            </span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {[25, 50, 75, 100].map((percent) => (
                            <button key={percent} onClick={() => handlePercentageClick(percent)} disabled={maxContextualAmount <= 0n || isLoadingAdvance} className="flex-1 py-3 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-800 disabled:opacity-50 uppercase tracking-widest">{percent === 100 ? 'MAX' : `${percent}%`}</button>
                        ))}
                    </div>

                    <div className={`relative flex items-center bg-white dark:bg-[#0d1117] border rounded-2xl transition-all duration-200 ${exceedsMax ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600'}`}>
                        <input type="text" inputMode="decimal" value={rawAmount} onChange={(e) => setRawAmount(e.target.value)} placeholder="0.00" autoComplete="off" className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-2xl font-bold tabular-nums py-5 pl-6 pr-20 ${exceedsMax ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`} />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">USDC</span>
                        </div>
                    </div>
                </div>  

                {isInputActive && !exceedsMax && (
                    <div className="flex-1 min-h-[160px]">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="bg-slate-50/50 dark:bg-[#0d1117]/50 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-6 space-y-4">
                                    {isWithdraw ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Gross Request</span>
                                                <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{formatMoney(numericAmountRaw, USDC_DECIMALS)} USDC</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Protocol Fee</span>
                                                <span className="font-mono text-sm font-medium text-rose-500">-{formatMoney((numericAmountRaw * BigInt(feeBps)) / 10000n, USDC_DECIMALS)} USDC</span>
                                            </div>
                                            <div className="h-px w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Net Receive</span>
                                                <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{formatMoney(numericAmountRaw - (numericAmountRaw * BigInt(feeBps)) / 10000n, USDC_DECIMALS)} USDC</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Current Debt</span>
                                                <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">{formatMoney(currentDebtRaw, USDC_DECIMALS)} USDC</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Repayment</span>
                                                <span className="font-mono text-sm font-medium text-blue-500">-{formatMoney(numericAmountRaw, USDC_DECIMALS)} USDC</span>
                                            </div>
                                            <div className="h-px w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Remaining</span>
                                                <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formatMoney(currentDebtRaw - numericAmountRaw, USDC_DECIMALS)} USDC</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                    </AnimatePresence>
                </div>
                )}
                

                <div className="pt-4 mt-auto">
                    <button
                        onClick={handleAction}
                        disabled={numericAmountRaw <= 0n || exceedsMax || requestSalary.isPending || repayDebt.isPending || approveToken.isPending}
                        className={`w-full h-14 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm uppercase tracking-widest ${isWithdraw ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {requestSalary.isPending || repayDebt.isPending || approveToken.isPending ? (
                            <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {isWithdraw ? "Sign & Withdraw" : needsApproval ? "Approve & Repay" : "Sign & Repay Debt"}
                                <Zap className="w-4 h-4 ml-1 opacity-70" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}


// 'use client'

// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Zap, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
// import { formatUnits, parseUnits } from 'viem'
// import { toast } from "sonner"

// import { useContractClient } from '@/hooks/useContractClient'
// import { useAdvanceInfo } from '@/hooks/flowroll/useFlowrollQueries'
// import { useFlowrollActions } from '@/hooks/flowroll/useFlowrollActions'
// import { formatMoney, flowLog } from '@/lib/utils'

// type ActionTab = 'withdraw' | 'repay'

// export function WithdrawAdvanceCard() {
//     const { address: evmAddress } = useContractClient()
//     const { data: advanceInfo, isLoading: isLoadingAdvance } = useAdvanceInfo()
//     const { requestSalary, repayDebt } = useFlowrollActions(evmAddress)
    
//     const USDC_DECIMALS = 6

//     // ============================================================================
//     // 1. LOCAL STATE
//     // ============================================================================
//     const [activeTab, setActiveTab] = useState<ActionTab>('withdraw')
//     const [rawAmount, setRawAmount] = useState<string>('')

//     // ============================================================================
//     // 2. DERIVED LOGIC
//     // ============================================================================
//     const currentDebtRaw = advanceInfo?.currentDebt ?? 0n
//     const availableToRequestRaw = advanceInfo?.maxAvailableToDraw ?? 0n
//     const feeBps = Number(advanceInfo?.currentFeeBps ?? 0n)
    
//     const isDebtActive = currentDebtRaw > 0n

//     // Switch logic based on active tab
//     const isWithdraw = activeTab === 'withdraw'
//     const maxContextualAmount = isWithdraw ? availableToRequestRaw : currentDebtRaw

//     // Parse input
//     let numericAmountRaw = 0n
//     try {
//         if (rawAmount && !isNaN(Number(rawAmount))) {
//             numericAmountRaw = parseUnits(rawAmount, USDC_DECIMALS)
//         }
//     } catch (e) {
//         numericAmountRaw = 0n
//     }

//     // Calculations for Withdraw mode
//     const feeAmountRaw = (numericAmountRaw * BigInt(feeBps)) / 10000n
//     const netReceiveRaw = numericAmountRaw - feeAmountRaw

//     // Validation
//     const exceedsMax = numericAmountRaw > maxContextualAmount
//     const isInputActive = numericAmountRaw > 0n

//     // Auto-switch tab if debt is cleared
//     useEffect(() => {
//         if (!isDebtActive && activeTab === 'repay') {
//             setActiveTab('withdraw')
//         }
//     }, [isDebtActive, activeTab])

//     // ============================================================================
//     // 3. ACTION HANDLERS
//     // ============================================================================
//     const handleAction = async () => {
//         if (!evmAddress) {
//             toast.error("Please connect your wallet first");
//             return;
//         }

//         if (numericAmountRaw <= 0n || exceedsMax) return;

//         const toastId = isWithdraw ? "withdraw-advance-tx" : "repay-debt-tx";
        
//         try {
//             toast.loading(isWithdraw ? "Preparing withdrawal..." : "Preparing repayment...", { id: toastId });

//             if (isWithdraw) {
//                 await requestSalary.mutateAsync(numericAmountRaw);
//                 toast.success("Liquidity secured! Funds sent to wallet.", { id: toastId });
//             } else {
//                 await repayDebt.mutateAsync({ employee: evmAddress, amountInBaseUnits: numericAmountRaw });
//                 toast.success("Debt settled! Your credit health has improved.", { id: toastId });
//             }

//             setRawAmount('');

//         } catch (error: any) {
//             flowLog('Action Error:', error);
//             const errorMessage = error?.shortMessage || error?.message || "Transaction failed.";
//             toast.error(errorMessage, { id: toastId });
//         }
//     };

//     const handlePercentageClick = (percent: number) => {
//         if (maxContextualAmount <= 0n) return;
//         const calculated = (maxContextualAmount * BigInt(percent)) / 100n
//         setRawAmount(formatUnits(calculated, USDC_DECIMALS))
//     }

//     return (
//         <div className="lg:col-span-7 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col h-full">
//             <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 dark:from-slate-800/30 to-transparent pointer-events-none" />

//             {/* Header Section */}
//             <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
//                     <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
//                             {isWithdraw ? (
//                                 <Zap className="w-5 h-5 text-emerald-500" />
//                             ) : (
//                                 <ArrowDownCircle className="w-5 h-5 text-blue-500" />
//                             )}
//                         </div>
//                         <div>
//                             <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
//                                 {isWithdraw ? "Withdraw Advance" : "Repay Active Debt"}
//                             </h3>
//                             <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
//                                 {isWithdraw ? "Access earned liquidity instantly." : "Settle your credit balance early."}
//                             </p>
//                         </div>
//                     </div>

//                     {/* Tab Switcher */}
//                     {isDebtActive && (
//                         <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 w-fit">
//                             <button
//                                 onClick={() => setActiveTab('withdraw')}
//                                 className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isWithdraw ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                             >
//                                 Withdraw
//                             </button>
//                             <button
//                                 onClick={() => setActiveTab('repay')}
//                                 className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isWithdraw ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
//                             >
//                                 Repay
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Main Interaction Area */}
//             <div className="p-8 space-y-8 flex-1 flex flex-col relative z-10">
//                 <div className="space-y-4">
//                     <div className="flex justify-between items-end px-1">
//                         <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
//                             {isWithdraw ? "Amount to Draw" : "Amount to Repay"}
//                         </label>
//                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                             {isWithdraw ? "Available: " : "Debt Balance: "}
//                             <span className="text-slate-700 dark:text-slate-300 font-mono">
//                                 {isLoadingAdvance ? '...' : `${formatMoney(maxContextualAmount, USDC_DECIMALS)} USDC`}
//                             </span>
//                         </span>
//                     </div>

//                     {/* Percentage Presets */}
//                     <div className="flex items-center gap-2">
//                         {[25, 50, 75, 100].map((percent) => (
//                             <button
//                                 key={percent}
//                                 onClick={() => handlePercentageClick(percent)}
//                                 disabled={maxContextualAmount <= 0n || isLoadingAdvance}
//                                 className="flex-1 py-3 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-800 disabled:opacity-50 uppercase tracking-widest"
//                             >
//                                 {percent === 100 ? 'MAX' : `${percent}%`}
//                             </button>
//                         ))}
//                     </div>

//                     <div className={`relative flex items-center bg-white dark:bg-[#0d1117] border rounded-2xl transition-all duration-200 ${exceedsMax ? 'border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.1)]' : 'border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600'}`}>
//                         <input
//                             type="text"
//                             inputMode="decimal"
//                             value={rawAmount}
//                             onChange={(e) => setRawAmount(e.target.value)}
//                             placeholder="0.00"
//                             autoComplete="off"
//                             className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-2xl font-bold tabular-nums py-5 pl-6 pr-20 ${exceedsMax ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`}
//                         />
//                         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
//                             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">USDC</span>
//                         </div>
//                     </div>

//                     {exceedsMax && (
//                         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 px-1 mt-1">
//                             <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
//                             <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">Exceeds contextual limit</p>
//                         </motion.div>
//                     )}
//                 </div>

//                 {/* Receipt Section */}
//                 <div className="flex-1 min-h-[160px]">
//                     <AnimatePresence mode="wait">
//                         {isInputActive && !exceedsMax && (
//                             <motion.div
//                                 key={activeTab} // Forces re-animation on tab switch
//                                 initial={{ opacity: 0, y: 10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 exit={{ opacity: 0, y: -10 }}
//                             >
//                                 <div className="bg-slate-50/50 dark:bg-[#0d1117]/50 rounded-2xl border border-slate-100 dark:border-slate-800/60 p-6 space-y-4">
//                                     {isWithdraw ? (
//                                         <>
//                                             <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
//                                                 <span>Gross Request</span>
//                                                 <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
//                                                     {formatMoney(numericAmountRaw, USDC_DECIMALS)} USDC
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
//                                                 <span className="flex items-center gap-2">Protocol Fee ({(feeBps / 100).toFixed(1)}%)</span>
//                                                 <span className="font-mono text-sm font-medium text-rose-500">
//                                                     -{formatMoney(feeAmountRaw, USDC_DECIMALS)} USDC
//                                                 </span>
//                                             </div>
//                                             <div className="h-px w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
//                                             <div className="flex justify-between items-end">
//                                                 <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Net Receive</span>
//                                                 <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
//                                                     {formatMoney(netReceiveRaw, USDC_DECIMALS)} USDC
//                                                 </span>
//                                             </div>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
//                                                 <span>Current Debt</span>
//                                                 <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
//                                                     {formatMoney(currentDebtRaw, USDC_DECIMALS)} USDC
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
//                                                 <span>Repayment Amount</span>
//                                                 <span className="font-mono text-sm font-medium text-blue-500">
//                                                     -{formatMoney(numericAmountRaw, USDC_DECIMALS)} USDC
//                                                 </span>
//                                             </div>
//                                             <div className="h-px w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
//                                             <div className="flex justify-between items-end">
//                                                 <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Remaining</span>
//                                                 <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
//                                                     {formatMoney(currentDebtRaw - numericAmountRaw, USDC_DECIMALS)} USDC
//                                                 </span>
//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </div>

//                 {/* Main Action Button */}
//                 <div className="pt-4 mt-auto">
//                     <button
//                         onClick={handleAction}
//                         disabled={numericAmountRaw <= 0n || exceedsMax || requestSalary.isPending || repayDebt.isPending}
//                         className={`w-full h-14 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm uppercase tracking-widest ${isWithdraw ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
//                     >
//                         {requestSalary.isPending || repayDebt.isPending ? (
//                             <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
//                         ) : (
//                             <>
//                                 {isWithdraw ? "Sign & Withdraw" : "Sign & Repay Debt"}
//                                 <Zap className="w-4 h-4 ml-1 opacity-70" />
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// 'use client'

// import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import { Zap, AlertTriangle } from 'lucide-react'
// import { formatUnits, parseUnits } from 'viem'
// import { useAdvanceInfo } from '@/hooks/flowroll/useFlowrollQueries'
// import { flowLog, formatMoney } from '@/lib/utils'
// import { toast } from 'sonner'
// import { useFlowrollActions } from '@/hooks/flowroll/useFlowrollActions'
// import { useContractClient } from '@/hooks/useContractClient'

// export function WithdrawAdvanceCard() {
//     // ============================================================================
//     //  DATA FETCHING
//     // ============================================================================
//     const { data: advanceInfo, isLoading: isLoadingAdvance } = useAdvanceInfo()
//     const { address: evmAddress } = useContractClient()

//     const { requestSalary } = useFlowrollActions(evmAddress)


//     const USDC_DECIMALS = 6

//     // ============================================================================
//     //  LOCAL STATE
//     // ============================================================================
//     const [rawRequestAmount, setRawRequestAmount] = useState<string>('')
//     const [isSubmitting, setIsSubmitting] = useState(false)

//     // ============================================================================
//     // DERIVED LOGIC
//     // ============================================================================
//     const availableToRequestRaw = advanceInfo?.maxAvailableToDraw ?? 0n
//     const feeBps = Number(advanceInfo?.currentFeeBps ?? 0n)

//     // Convert input string to bigint for accurate contract math
//     let numericRequestAmountRaw = 0n
//     try {
//         if (rawRequestAmount && !isNaN(Number(rawRequestAmount))) {
//             numericRequestAmountRaw = parseUnits(rawRequestAmount, USDC_DECIMALS)
//         }
//     } catch (e) {
//         numericRequestAmountRaw = 0n
//     }

//     const feeAmountRaw = (numericRequestAmountRaw * BigInt(feeBps)) / 10000n
//     const netAmountRaw = numericRequestAmountRaw - feeAmountRaw

//     const exceedsMax = numericRequestAmountRaw > availableToRequestRaw
//     const isInputActive = numericRequestAmountRaw > 0n

//     // ============================================================================
//     // 4. ACTION HANDLERS
//     // ============================================================================
//     const handleConfirmRequest = async () => {
//         if (!evmAddress) {
//             toast.error("Please connect your wallet first");
//             return;
//         }

//         if (numericRequestAmountRaw <= 0n || exceedsMax) return;

//         const toastId = "withdraw-advance-tx";

//         try {
//             toast.loading("Preparing withdrawal request...", { id: toastId });

//             await requestSalary.mutateAsync(numericRequestAmountRaw);

//             toast.success("Liquidity secured! Funds are on the way.", { id: toastId });
//             setRawRequestAmount('');

//         } catch (error: any) {
//             flowLog('Withdraw Error:', error);

//             const errorMessage = error?.shortMessage || error?.message || "Transaction failed. Please try again.";
//             toast.error(errorMessage, { id: toastId });
//         }
//     };
//     const handlePercentageClick = (percent: number) => {
//         if (availableToRequestRaw <= 0n) return;
//         const calculated = (availableToRequestRaw * BigInt(percent)) / 100n
//         // Format back to string for the input field
//         setRawRequestAmount(formatUnits(calculated, USDC_DECIMALS))
//     }

//     return (
//         <div className="lg:col-span-7 bg-white dark:bg-[#0a0c10] border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xs relative overflow-hidden flex flex-col h-full">

//             {/* Subtle Header Background */}
//             <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50 dark:from-slate-800/30 to-transparent pointer-events-none" />

//             {/* Header Section */}
//             <div className="p-8 border-b border-slate-100 dark:border-slate-800/80 relative z-10 flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
//                         <Zap className="w-5 h-5 text-emerald-500" />
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Withdraw Advance</h3>
//                         <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Draw liquidity instantly from your locked accrual.</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Interaction Area */}
//             <div className="p-8 space-y-8 flex-1 flex flex-col relative z-10">
//                 <div className="space-y-4">
//                     <div className="flex justify-between items-end px-1">
//                         <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Amount to Draw</label>
//                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//                             Available: <span className="text-slate-700 dark:text-slate-300">
//                                 {isLoadingAdvance ? '...' : `${formatMoney(availableToRequestRaw, USDC_DECIMALS)} USDC`}
//                             </span>
//                         </span>
//                     </div>

//                     {/* DeFi Percentage Presets */}
//                     <div className="flex items-center gap-2">
//                         {[25, 50, 75, 100].map((percent) => (
//                             <button
//                                 key={percent}
//                                 onClick={() => handlePercentageClick(percent)}
//                                 disabled={availableToRequestRaw <= 0n || isLoadingAdvance}
//                                 className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
//                             >
//                                 {percent === 100 ? 'MAX' : `${percent}%`}
//                             </button>
//                         ))}
//                     </div>

//                     {/* The Sturdy, Minimal Input Container */}
//                     <div className={`relative flex items-center bg-white dark:bg-[#0d1117] border rounded-2xl transition-all duration-200 ${exceedsMax ? 'border-rose-500 shadow-[0_0_0_1px_rgba(244,63,94,0.1)]' : 'border-slate-200 dark:border-slate-800 focus-within:border-slate-400 dark:focus-within:border-slate-600'}`}>
//                         <input
//                             type="text"
//                             inputMode="decimal"
//                             value={rawRequestAmount}
//                             onChange={(e) => setRawRequestAmount(e.target.value)}
//                             placeholder="0.00"
//                             autoComplete="off"
//                             className={`w-full bg-transparent border-none focus:ring-0 focus:outline-none text-2xl font-bold tabular-nums py-5 pl-6 pr-20 ${exceedsMax ? 'text-rose-600 dark:text-rose-500' : 'text-slate-900 dark:text-white'}`}
//                         />
//                         <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
//                             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">USDC</span>
//                         </div>
//                     </div>

//                     {/* Error State */}
//                     {exceedsMax && (
//                         <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 px-1 mt-1">
//                             <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
//                             <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wide">Exceeds available limit</p>
//                         </motion.div>
//                     )}
//                 </div>

//                 {/* Dynamic Receipt (The Ledger Style) */}
//                 {isInputActive && !exceedsMax && <>
//                     <div className="flex-1 min-h-[140px]">
//                         <AnimatePresence mode="wait">
//                             <motion.div
//                                 initial={{ opacity: 0, scale: 0.98, y: 10 }}
//                                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                                 exit={{ opacity: 0, scale: 0.98, y: 10 }}
//                             >
//                                 <div className="bg-slate-50/50 dark:bg-[#0d1117]/50 rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 space-y-4">
//                                     <div className="space-y-3">
//                                         <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
//                                             <span>Gross Request</span>
//                                             <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
//                                                 {formatMoney(numericRequestAmountRaw, USDC_DECIMALS)}
//                                                 <span className="font-sans text-slate-400 text-[10px] ml-1.5">USDC</span>
//                                             </span>
//                                         </div>

//                                         <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
//                                             <span className="flex items-center gap-2">
//                                                 Protocol Fee
//                                                 <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold tracking-normal">
//                                                     {(feeBps / 100).toFixed(1)}%
//                                                 </span>
//                                             </span>
//                                             <span className="font-mono text-sm font-medium text-rose-500">
//                                                 -{formatMoney(feeAmountRaw, USDC_DECIMALS)}
//                                                 <span className="font-sans text-rose-400/70 text-[10px] ml-1.5">USDC</span>
//                                             </span>
//                                         </div>
//                                     </div>

//                                     <div className="relative h-px w-full">
//                                         <div className="absolute inset-0 border-t border-dashed border-slate-200 dark:border-slate-700"></div>
//                                     </div>

//                                     <div className="flex justify-between items-end pt-1">
//                                         <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Net Receipt</span>
//                                         <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
//                                             {formatMoney(netAmountRaw, USDC_DECIMALS)}
//                                             <span className="font-sans text-emerald-600/60 dark:text-emerald-500/60 text-sm font-bold ml-1.5">USDC</span>
//                                         </span>
//                                     </div>
//                                 </div>
//                             </motion.div>
//                         </AnimatePresence>
//                     </div>
//                 </>}


//                 {/* Main Action Button */}
//                 <div className="pt-4 mt-auto">
//                     <button
//                         onClick={handleConfirmRequest}
//                         disabled={numericRequestAmountRaw <= 0n || exceedsMax || availableToRequestRaw <= 0n || isSubmitting}
//                         className="w-full h-14 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm uppercase tracking-widest"
//                     >
//                         {isSubmitting ? (
//                             <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
//                         ) : (
//                             <>Sign & Withdraw <Zap className="w-4 h-4 ml-1 opacity-70" /></>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }