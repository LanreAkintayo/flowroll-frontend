'use client'

import { formatUnits } from 'viem'
import { AllocationEngine } from '@/components/employee/AllocationEngine'
import { OmnichainBridge } from '@/components/employee/OmnichainBridge'
import { useAvailableBalance } from '@/hooks/vault/useVaultQueries'
import { useContractClient } from '@/hooks/useContractClient'
import { useTokenBalance } from '@/hooks/token/useTokenQueries'

export default function ClaimHubPage() {
    // Identity and protocol context
    const { address, contracts } = useContractClient()

    // Global state synchronization
    const { data: claimableBalance } = useAvailableBalance(address)
    const { data: walletBalance } = useTokenBalance(contracts.USDC_ADDRESS)

    // Data presentation formatting
    const formattedMax = claimableBalance ? Number(formatUnits(claimableBalance, 6)).toString() : "0"
    const formattedWalletBalance = walletBalance ? Number(formatUnits(walletBalance, 6)).toString() : "0"

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] transition-colors duration-500 pt-4 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Page header and liquidity overview */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Liquidity Hub
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Route, save, and bridge your payroll seamlessly.</p>
                    </div>

                    <div className="flex items-center bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-[1.25rem] overflow-hidden">
                        
                        {/* Protocol accruals ready for claim */}
                        <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-900/20">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Total Claimable
                            </p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                                {formattedMax} <span className="text-sm font-medium text-slate-400">USDC</span>
                            </p>
                        </div>

                        <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />

                        {/* On-chain liquid balance */}
                        <div className="px-5 py-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                                    Wallet Balance
                                </p>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                                {formattedWalletBalance} <span className="text-sm font-medium text-slate-400">USDC</span>
                            </p>
                        </div>

                    </div>
                </div>

                {/* Core interaction modules */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    <AllocationEngine />
                    <OmnichainBridge />
                </div>
                
            </div>
        </div>
    )
}