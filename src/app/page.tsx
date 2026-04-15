'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { useIdentity, useWalletActions } from '@/hooks/identity/useIdentity'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Building, User, Wallet, ShieldCheck, Clock, ArrowRightLeft } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'

export default function HomePage() {
  const router = useRouter()
  const { isConnected, isLoading } = useIdentity()
  const { openConnect } = useWalletActions()
  const { role, setRole } = useAuthStore()

  function handleRoleSelect(selected: UserRole) {
    setRole(selected)
    if (!isConnected) {
      openConnect()
      return
    }
    router.push(`/${selected}`)
  }

  return (
    <div>
      <Navbar />
       <div className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden bg-slate-50 dark:bg-[#070b14] transition-colors duration-500">
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-violet-400/20 dark:bg-violet-900/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[60%] h-[70%] rounded-full bg-teal-400/20 dark:bg-teal-900/20 blur-[120px]" 
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-12 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: The Pitch */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 backdrop-blur-md mb-6 w-fit shadow-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Omnichain Payroll Protocol
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6 leading-[1.1]">
              Payroll that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-teal-500 dark:from-violet-400 dark:to-teal-400">
                pays for itself.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-xl">
              Employer deposits earn automated yield between the deposit date and payday. Turn your largest operational expense into a revenue stream on Initia.
            </p>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <RoleCard
                title="Employer"
                description="Fund payroll once, let yield cover the costs."
                icon={<Building className="w-6 h-6" />}
                onSelect={() => handleRoleSelect('employer')}
                disabled={isLoading}
              />
              <RoleCard
                title="Employee"
                description="Claim salary or leave it earning yield."
                icon={<User className="w-6 h-6" />}
                onSelect={() => handleRoleSelect('employee')}
                disabled={isLoading}
              />
            </div>
            
            {isConnected && !role && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-slate-500 dark:text-slate-400 text-sm font-medium">
                Select your portal to continue
              </motion.p>
            )}
          </motion.div>

          {/* RIGHT: The Architecture Visualizer */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="hidden lg:flex justify-center relative w-full h-[500px]"
          >
            <ProtocolVisualizer />
          </motion.div>
        </div>
      </div>
    </div>
    </div>
   
  )
}

// ─── Visualizer Component ─────────────────────────────────────────────────────

function ProtocolVisualizer() {
  return (
    <div className="relative w-full max-w-lg h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-6 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-200/50 dark:border-slate-700/50 pb-4">
        <ArrowRightLeft className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Flowroll Yield Engine</span>
      </div>

      <div className="relative flex-1 w-full flex items-center justify-center">
        {/* SVG Animated Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
          {/* Path: Deposit to Yield */}
          <FlowPath d="M 60,150 C 120,150 140,75 200,75" color="#10b981" />
          {/* Path: Deposit to Reserve */}
          <FlowPath d="M 60,150 C 120,150 140,225 200,225" color="#6366f1" />
          {/* Path: Yield to Payday */}
          <FlowPath d="M 200,75 C 260,75 280,150 340,150" color="#10b981" delay={1.5} />
          {/* Path: Reserve to Payday */}
          <FlowPath d="M 200,225 C 260,225 280,150 340,150" color="#6366f1" delay={1.5} />
        </svg>

        {/* Nodes */}
        <VisualizerNode 
          icon={<Wallet className="w-5 h-5 text-slate-700 dark:text-slate-200" />}
          label="Deposit"
          sub="Employer"
          position="left-[5%] top-1/2 -translate-y-1/2"
          glowColor="bg-slate-500/20"
        />
        
        <VisualizerNode 
          icon={<Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Yield Vaults"
          sub="Generating APY"
          position="left-1/2 top-[15%] -translate-x-1/2"
          glowColor="bg-emerald-500/20 dark:bg-emerald-500/30"
          border="border-emerald-200 dark:border-emerald-500/30"
          animDelay={0.5}
        />

        <VisualizerNode 
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
          label="Reserve"
          sub="Secured Base"
          position="left-1/2 bottom-[15%] -translate-x-1/2"
          glowColor="bg-indigo-500/20 dark:bg-indigo-500/30"
          border="border-indigo-200 dark:border-indigo-500/30"
          animDelay={1}
        />

        <VisualizerNode 
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Payday"
          sub="Distribution"
          position="right-[5%] top-1/2 -translate-y-1/2"
          glowColor="bg-amber-500/20 dark:bg-amber-500/30"
          border="border-amber-200 dark:border-amber-500/30"
          animDelay={1.5}
        />
      </div>
    </div>
  )
}

function FlowPath({ d, color, delay = 0 }: { d: string, color: string, delay?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-200 dark:text-slate-800" />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </>
  )
}

function VisualizerNode({ icon, label, sub, position, glowColor, border = "border-slate-200 dark:border-slate-700", animDelay = 0 }: any) {
  return (
    <motion.div 
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: animDelay }}
      className={`absolute ${position} flex flex-col items-center gap-2`}
    >
      <div className={`relative w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border ${border} flex items-center justify-center shadow-sm z-10`}>
        <div className={`absolute inset-0 rounded-2xl ${glowColor} blur-md -z-10`} />
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{label}</p>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">{sub}</p>
      </div>
    </motion.div>
  )
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function RoleCard({ title, description, icon, onSelect, disabled }: any) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="
        group text-left p-6 rounded-[20px] relative overflow-hidden
        bg-white/40 dark:bg-slate-900/40 backdrop-blur-md
        border border-white/60 dark:border-slate-800/60
        hover:border-violet-300 dark:hover:border-violet-500/50 
        hover:bg-white/60 dark:hover:bg-slate-800/50
        shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-none
        hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)] dark:hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)]
        transition-all duration-300 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
        disabled:opacity-50 disabled:cursor-wait
      "
    >
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700/30 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-violet-200 dark:group-hover:bg-violet-800/50 transition-all duration-300">
          <span className="text-violet-600 dark:text-violet-300">{icon}</span>
        </div>
        <h2 className="text-xl text-slate-900 dark:text-white font-bold mb-2 flex items-center justify-between">
          {title}
          <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pr-4">
          {description}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-teal-500/0 group-hover:from-violet-500/5 dark:group-hover:from-violet-500/10 group-hover:to-transparent transition-all duration-500 z-0" />
    </button>
  )
}