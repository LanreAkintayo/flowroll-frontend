'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ShieldCheck, ArrowRight, TrendingUp, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatUnits, parseUnits } from 'viem'
import { useVaultActions } from '@/hooks/vault/useVaultActions'
import { TransactionModal, TxState } from '@/components/shared/TransactionModal'
import { useAvailableBalance } from '@/hooks/vault/useVaultQueries'
import { useContractClient } from '@/hooks/useContractClient'



export function AllocationEngine() {

    const { address } = useContractClient()
    const { data: claimableBalance } = useAvailableBalance(address)
    // --- UI State ---
    const [claimInput, setClaimInput] = useState<string>("")
    const [savePct, setSavePct] = useState<number>(0)
    const [durationValue, setDurationValue] = useState<string>("30")
    const [durationType, setDurationType] = useState<string>("days")

    // --- Modal & Transaction State ---
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [txState, setTxState] = useState<TxState>("idle")
    const [txHash, setTxHash] = useState<string>("")
    const [txError, setTxError] = useState<string>("")

    // --- Math & Formatting ---
    const numClaimInput = Number(claimInput) || 0
    const vaultAmount = numClaimInput * (savePct / 100)
    const liquidAmount = numClaimInput - vaultAmount

    const formatUSDC = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedMax = claimableBalance ? Number(formatUnits(claimableBalance, 6)).toString() : "0"

    // --- Hooks ---
    const { claim, claimAndSave } = useVaultActions()

    // --- Handlers ---
    const handleInitiateClaim = () => {
        setTxState("review")
        setIsModalOpen(true)
    }

    const executeTransaction = async () => {
        setTxState("processing")
        setTxError("")

        try {
            const amountBigInt = parseUnits(claimInput, 6)
            let hash = ""

            if (savePct === 0) {
                hash = await claim.mutateAsync({ amount: amountBigInt })
            } else {
                // Convert duration to seconds
                let seconds = Number(durationValue)
                if (durationType === "minutes") seconds *= 60
                if (durationType === "hours") seconds *= 3600
                if (durationType === "days") seconds *= 86400
                if (durationType === "months") seconds *= 2592000

                hash = await claimAndSave.mutateAsync({
                    amount: amountBigInt,
                    savePct: savePct,
                    durationInSeconds: seconds
                })
            }

            setTxHash(hash)
            setTxState("success")
        } catch (error: any) {
            setTxError(error.message || "Transaction failed or was rejected.")
            setTxState("error")
        }
    }

    return (
        <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[2rem] border border-slate-200 dark:border-slate-800/80 relative overflow-hidden flex flex-col h-full">

                {/* --- HEADER --- */}
                <div className="px-8 pt-8 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Allocation Engine</h2>
                    </div>
                </div>

                {/* --- MASSIVE HERO INPUT --- */}
                <div className="flex flex-col items-center justify-center pt-8 pb-8 px-8 border-b border-slate-100 dark:border-slate-800/50 relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">You are claiming</p>

                    <div className="relative group flex items-center justify-center w-full">
                        <span className="text-4xl sm:text-6xl font-light text-slate-300 dark:text-slate-700 absolute left-[15%] sm:left-[25%] transition-colors group-focus-within:text-slate-900 dark:group-focus-within:text-white">
                            $
                        </span>
                        <input
                            type="text"
                            value={claimInput}
                            onChange={(e) => setClaimInput(e.target.value)}
                            className="bg-transparent text-6xl  font-black text-slate-900 dark:text-white text-center outline-none w-full max-w-[300px] tabular-nums tracking-tighter placeholder:text-slate-200 dark:placeholder:text-slate-800 transition-all"
                            placeholder="0.00"
                        />
                    </div>

                    <button
                        onClick={() => setClaimInput(formattedMax)}
                        className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800"
                    >
                        Balance: {formatUSDC(Number(formattedMax))} USDC <span className="text-[9px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 ml-1">Max</span>
                    </button>
                </div>

                {/* --- ROUTING MATRIX --- */}
                <div className="p-8  flex flex-col  relative z-10">

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Routing Split</h3>

                            {/* DeFi Quick Action Pills */}
                            <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                {[0, 25, 50, 75, 100].map((pct) => (
                                    <button
                                        key={pct}
                                        onClick={() => setSavePct(pct)}
                                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${savePct === pct
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                            }`}
                                    >
                                        {pct}%
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Styled Slider */}
                        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full mb-8 border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-slate-900 dark:bg-slate-300 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${savePct}%` }}
                            />
                            <input
                                type="range"
                                min="0" max="100" step="1"
                                value={savePct}
                                onChange={(e) => setSavePct(Number(e.target.value))}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* The Destination Matrix */}
                        <div className="flex items-center gap-4">
                            {/* Liquid Side */}
                            <div className="flex-1 bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 transition-all">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                    <Wallet className="w-3 h-3" /> Liquid
                                </p>
                                <p className="text-2xl font-medium text-slate-900 dark:text-white tabular-nums">
                                    {formatUSDC(liquidAmount)} <span className="text-sm font-medium text-slate-500">USDC</span>
                                </p>
                            </div>

                            {/* Vault Side */}
                            <div className={`flex-1 border rounded-2xl p-4 transition-all duration-500 ${savePct > 0
                                ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-slate-200 dark:border-slate-500/20'
                                : 'bg-slate-50 dark:bg-[#0f0f0f] border-slate-200 dark:border-slate-800/80'
                                }`}>
                                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2 ${savePct > 0 ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500'
                                    }`}>
                                    <TrendingUp className="w-3 h-3" /> Auto-Save
                                </p>
                                <p className={`text-2xl font-medium tabular-nums  ${savePct > 0 ? 'text-slate-700 dark:text-white' : 'text-slate-600'
                                    }`}>
                                    {formatUSDC(vaultAmount)} <span className="text-sm font-medium text-slate-500">USDC</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Conditional Auto-Save Config */}
                    <AnimatePresence>
                        {savePct > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-8">
                                    <div className="flex gap-3 mb-5">
                                        <div className="mt-0.5 shrink-0">
                                                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />

                                     
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">Flowroll Vault Enabled</h4>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                                Funds will be locked and accrue APY until the duration expires.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
                                                Duration
                                            </label>
                                            <Input
                                                type="number"
                                                value={durationValue}
                                                onChange={(e) => setDurationValue(e.target.value)}
                                                className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 h-10 text-sm font-medium text-slate-900 dark:text-white focus-visible:ring-1 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-700 focus-visible:ring-offset-0 tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">
                                                Time Unit
                                            </label>
                                            <Select value={durationType} onValueChange={setDurationType}>
                                                <SelectTrigger className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800 h-10 text-sm font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 focus:ring-offset-0">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-[#0A0A0A] border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="minutes" className="cursor-pointer font-medium focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white">Minutes</SelectItem>
                                                    <SelectItem value="hours" className="cursor-pointer font-medium focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white">Hours</SelectItem>
                                                    <SelectItem value="days" className="cursor-pointer font-medium focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white">Days</SelectItem>
                                                    <SelectItem value="months" className="cursor-pointer font-medium focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white">Months</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={handleInitiateClaim}
                        disabled={numClaimInput <= 0}
                        className={`w-full h-14 rounded-2xl font-medium text-base transition-all ${savePct > 0
                            ? 'border bg-emerald-50/50 dark:bg-emerald-500/10 border-slate-200 dark:border-slate-500/20 text-slate-800 dark:text-emerald-50'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                    >
                        {savePct > 0 ? `Execute: Claim & Route (${savePct}%)` : "Execute: Liquid Claim"}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>

            {/* --- THE UNIVERSAL TRANSACTION MODAL --- */}
            <TransactionModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                status={txState}
                title="Confirm Allocation"
                summaryLabel="Total Claiming"
                summaryAmount={`${formatUSDC(numClaimInput)} USDC`}
                details={[
                    { label: "To Wallet", value: `${formatUSDC(liquidAmount)} USDC` },
                    { label: "To Vault ", value: `${formatUSDC(vaultAmount)} USDC` },
                    ...(savePct > 0 ? [{ label: "Lock Duration", value: `${durationValue} ${durationType}` }] : [])
                ]}
                hash={txHash}
                errorMessage={txError}
                onConfirm={executeTransaction}
                onClose={() => setTxState("idle")}
            />
        </div>
    )
}