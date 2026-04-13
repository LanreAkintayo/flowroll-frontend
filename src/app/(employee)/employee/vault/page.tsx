'use client'

import { useState } from 'react'
import { Activity, ShieldCheck, TrendingUp } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

// --- Hooks & Utils ---
import { useAutoSaveCycles } from '@/hooks/vault/useVaultQueries' // Adjust path if needed
import { useContractClient } from '@/hooks/useContractClient'
import { flowLog, formatMoney } from '@/lib/utils'

// --- Components ---
import { AutoSaveCard } from '@/components/employee/AutoSaveCard'
import { AgentCommandCenter } from '@/components/employer/AgentCommandCenter'
import { EmployeeVaultEngine } from '@/components/employee/EmployeeVaultEngine'
// import { AgentCommandCenter } from '@/components/employee/AgentCommandCenter' // Ensure you create this file!
// 
export default function EmployeeVaultPage() {
  // Store the actual cycleId (bigint) so the Command Center knows exactly which chunk to query
  const [selectedCycleId, setSelectedCycleId] = useState<bigint | null>(null)
  
  const { address } = useContractClient();
  const { data: autoSaveCycles, isLoading } = useAutoSaveCycles(address);
  
  flowLog("Auto save cycles: ", autoSaveCycles);

  // --- Handlers ---
  const openAgentCenter = (cycleId: bigint) => {
    setSelectedCycleId(cycleId)
  }

  const closeAgentCenter = () => {
    setSelectedCycleId(null)
  }

  // --- Dynamic TVL Calculation ---
  const totalValueLocked = autoSaveCycles?.reduce((acc, cycle) => acc + cycle.amountSaved, 0n) || 0n;
  const formattedTVL = formatMoney(totalValueLocked, 6);

  // TODO: Once you have the global yield query across all cycles, plug it in here!
  const mockGlobalYield = "+0.00"; 
  const mockBlendedApy = "0.0%";

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* ========================================== */}
        {/* --- HERO METRICS SECTION (GLOBAL VAULT) --- */}
        {/* ========================================== */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Global Vault
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Yield Agent Online & Managing Assets
              </p>
            </div>
          </div>

          {/* Global Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TVL */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Value Locked</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formattedTVL}
                </span>
                <span className="text-sm font-bold text-slate-400">USDC</span>
              </div>
            </div>
            
            {/* Lifetime Yield */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Lifetime Yield
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {mockGlobalYield}
                </span>
                <span className="text-sm font-bold text-emerald-600/50 dark:text-emerald-400/50">USDC</span>
              </div>
            </div>

            {/* Blended APY */}
            <div className="bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col justify-center items-start">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Blended APY</p>
               <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                 <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">
                   {mockBlendedApy}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* --- ACTIVE POSITIONS GRID (THE AUTOSAVES) --- */}
        {/* ========================================== */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Positions</h2>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
              {autoSaveCycles?.length || 0} Autosaves
            </span>
          </div>
          
          {isLoading ? (
             <div className="flex items-center justify-center py-20 text-slate-500">
               <Activity className="w-6 h-6 animate-spin" />
             </div>
          ) : !autoSaveCycles || autoSaveCycles.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[1.5rem]">
               <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
               <p className="text-slate-500 font-medium text-sm">No active autosave positions found.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
              {autoSaveCycles.map((cycle) => (
                <AutoSaveCard 
                  key={cycle.cycleId.toString()} 
                  autoSaveCycle={cycle} 
                  onOpenAgent={() => openAgentCenter(cycle.cycleId)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* --- THE IMMERSIVE AGENT COMMAND CENTER --- */}
      {/* ========================================== */}
      {/* AnimatePresence allows Framer Motion to smoothly animate the modal OUT when it closes */}
      <AnimatePresence>
        {selectedCycleId !== null && (
          <EmployeeVaultEngine 
             cycleId={selectedCycleId} 
             onClose={closeAgentCenter} 
          />
        )}
      </AnimatePresence>
    </>
  )
}