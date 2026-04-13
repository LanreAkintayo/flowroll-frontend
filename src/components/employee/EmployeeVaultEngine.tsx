"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Terminal,
  Activity,
  Zap,
  Server,
  X,
  PieChart,
  ShieldCheck,
  Briefcase,
  GripHorizontal,
  Loader2,
  CheckCircle2,
  ArrowRightLeft,
  Droplets,
  Lock,
  ListTree,
  ArrowRight,
  Sparkles,
  Timer,
  HandCoins,
  Flame,
  Cpu
} from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useAgentLogs, usePools, usePoolDetails, usePoolData, useCycleBuffer, usePayrollCycle, useLiveYield } from "@/hooks/router/useRouterQueries";
import { useGroupDetails } from "@/hooks/payroll/usePayrollQueries";
import { PoolEntry } from "@/types";
import { flowLog, formatDuration, formatMoney, formatTimeLeft } from "@/lib/utils";
import { useContractClient } from "@/hooks/useContractClient";
import { VaultCard } from "../yield/VaultCard";
import { useDisbursementRecord } from "@/hooks/dispatcher/useDispatcherQueries";

// --- TYPES ---
interface RawLog { id: string; timestamp: string; message: string; type: string; }
interface AgentMetrics { status: string; uptime: string; cycles: { total: number; success: number; failures: number }; config: { intervalMs: number }; }
interface Props { cycleId: bigint; onClose: () => void; }

type ViewState = "portfolio" | "ledger" | "terminal";

export function EmployeeVaultEngine({ cycleId, onClose }: Props) {
  const [rawLogs, setRawLogs] = useState<RawLog[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [activeView, setActiveView] = useState<ViewState>("portfolio");
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  
  const { address } = useContractClient();
  // const { data: groupDetails } = useGroupDetails(address, groupId);
  const { data: disbursementRecord } = useDisbursementRecord(address, cycleId);
  
  const { data: allPools } = usePools();
  const { data: agentLogs } = useAgentLogs(cycleId);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setDimensions({
        width: mobile ? window.innerWidth : window.innerWidth * 0.90,
        height: mobile ? window.innerHeight : 750,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- RAW SOCKETS ---
  useEffect(() => {
    const socket: Socket = io("http://localhost:3001");
    socket.on("connect", () => setIsConnected(true));
    socket.on("agent-log", (newLog: RawLog) => {
      setRawLogs((prev) => [...prev, newLog].slice(-100));
    });
    const fetchMetrics = async () => {
      try {
        const res = await fetch("http://localhost:3001/status");
        if (res.ok) setMetrics(await res.json());
      } catch (e) { }
    };
    fetchMetrics();
    const int = setInterval(fetchMetrics, 3000);
    return () => {
      socket.disconnect();
      clearInterval(int);
    };
  }, []);

  useEffect(() => {
    if (activeView === "terminal") terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (activeView === "ledger") timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawLogs, agentLogs, activeView]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center lg:p-6" ref={constraintsRef}>
      <motion.div
        drag={!isMobile}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        style={{
          width: isMobile ? "100vw" : dimensions.width,
          height: isMobile ? "100dvh" : dimensions.height,
        }}
        className={`pointer-events-auto bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden relative border-slate-200 dark:border-slate-800 ${isMobile ? "rounded-none" : "rounded-sm  border"}`}
      >
        {/* --- HEADER --- */}
        <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          {!isMobile && (
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full py-1 flex justify-center cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <GripHorizontal className="w-5 h-5 text-slate-400 dark:text-slate-700" />
            </div>
          )}
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-3">
              <Server className={`w-5 h-5 ${isConnected ? "text-emerald-500 animate-pulse" : "text-rose-500"}`} />
              <span className="text-slate-900 dark:text-white font-bold text-sm tracking-tight hidden sm:block">
                Flowroll Agent
              </span>
            </div>

            {/* THE 3-TAB SYSTEM */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-x-auto custom-scrollbar">
              <TabButton active={activeView === "portfolio"} onClick={() => setActiveView("portfolio")} icon={<Briefcase className="w-4 h-4" />} label="Vaults" />
              <TabButton active={activeView === "ledger"} onClick={() => setActiveView("ledger")} icon={<ListTree className="w-4 h-4" />} label="Ledger" />
              <TabButton active={activeView === "terminal"} onClick={() => setActiveView("terminal")} icon={<Terminal className="w-4 h-4" />} label="Raw Logs" />
            </div>

            <Button onClick={onClose} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* LEFT PANEL (Engine Room) */}
          <div className={`${isMobile ? "hidden" : "flex"} w-[280px] shrink-0 bg-slate-50 dark:bg-[#0b1120] border-r border-slate-200 dark:border-slate-800 flex-col p-6 overflow-y-auto custom-scrollbar z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}>
            <div className="flex flex-col gap-3 mb-8 shrink-0">
              <MetricBox label="Agent Status" value={isConnected ? "ONLINE" : "OFFLINE"} color={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
              <MetricBox label="Uptime" value={metrics ? metrics.uptime : "__"} color="text-sky-600 dark:text-sky-400" />
              <MetricBox label="Tick Rate" value={`${metrics ? `${metrics.config.intervalMs / 1000}s` : "__"}`} color="text-amber-600 dark:text-amber-400" />
              <MetricBox label="Successful Cycles" value={metrics ? metrics.cycles.success : "__"} color="text-slate-700 dark:text-slate-300" />
            </div>

          </div>

          {/* MAIN STAGE */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#070b14] relative">
            <AnimatePresence mode="wait">

              {/* TAB 1: PORTFOLIO GRID */}
              {activeView === "portfolio" && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 p-4 lg:p-8 overflow-y-auto custom-scrollbar"
                >
                  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                    {/* LEFT SIDE: Title, Badge, and Subtitle */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          Portfolio Overview
                        </h2>

                        {/* Dynamic Status Badges */}
                        {disbursementRecord?.executed ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" />
                            Released
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Monitoring
                          </div>
                        )}
                      </div>

                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        Vault allocation managed by Flowroll Agent.
                      </p>
                    </div>

                    {/* RIGHT SIDE: Button */}
                    <button
                      onClick={() => setActiveView("ledger")}
                      className="h-fit shrink-0 group flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs dark:shadow-none"
                    >
                      View Agent Ledger <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* TREASURY HERO SECTION */}
                  <TreasuryHero cycleId={cycleId} />

                  <div className="mt-10 mb-6 flex items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      Active Yield Vaults <span className="flex h-2 w-2 relative"></span>
                    </h3>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>

                  {/* THE SCALABLE GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 lg:gap-6 pb-8">
                    {allPools?.map((pool, index) => (
                      <VaultCard key={pool.pool} cycleId={cycleId} poolIndex={BigInt(index)} poolEntry={pool} />
                    ))}
                    {allPools?.length === 0 && (
                      <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 dark:text-slate-500 text-sm">
                        No active vaults found. Waiting for agent deployment.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SMART LEDGER */}
              {activeView === "ledger" && (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#0b1120]"
                >
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Execution Ledger</h2>
                    <p className="text-sm text-slate-500 mb-10">A chronological audit of all smart contract executions handled by the AI.</p>
                    <SmartTimeline logs={agentLogs || []} />
                    <div ref={timelineEndRef} className="h-10" />
                  </div>
                </motion.div>
              )}

              {/* TAB 3: RAW TERMINAL */}
              {activeView === "terminal" && (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 p-6 overflow-y-auto font-mono text-[13px] leading-relaxed custom-scrollbar bg-slate-50 dark:bg-black"
                >
                  <div className="text-slate-500 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800/50">
                    Connection established. Tailing raw socket stream...
                  </div>
                  {rawLogs.map((log) => (
                    <div key={log.id} className="mb-1.5 flex gap-4 hover:bg-slate-100 dark:hover:bg-slate-900/50 px-2 py-1 -mx-2 rounded">
                      <span className="text-slate-400 dark:text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className={log.type === "success" ? "text-emerald-600 dark:text-emerald-400" : log.type === "error" ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300 break-words"}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${active
        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm dark:shadow-md border border-slate-200 dark:border-slate-700/50"
        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent"
        }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function MetricBox({ label, value, color }: any) {
  return (
    <div className="bg-white dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 flex flex-col justify-center shadow-sm dark:shadow-none">
      <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold mb-1">{label}</span>
      <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

// 🔥 TREASURY HERO COMPONENT (DARK + LIGHT MODE) 🔥
function TreasuryHero({ cycleId }: { cycleId: bigint }) {
  const { address } = useContractClient();
  // const { data: group } = useGroupDetails(address, groupId);
  const { data: cycleData } = usePayrollCycle(address, cycleId);
  const { data: liveYieldData } = useLiveYield(address, cycleId);

  const [timeRemaining, setTimeRemaining] = useState(0);
  const payDay = cycleData?.payDay ? Number(cycleData.payDay) : 0;

  const currentAllocation =
    cycleData?.totalDeposited != null && cycleData?.idleBalance != null
      ? cycleData.totalDeposited > cycleData.idleBalance
        ? cycleData.totalDeposited - cycleData.idleBalance
        : 0n
      : 0n;
  const yieldEarned = liveYieldData?.netYield || 0n;

  const amountInReserve = cycleData?.idleBalance || 0n;

  // Formatting values
  const formattedAmountInReserve = formatMoney(amountInReserve, 6);

  const formattedAllocation = formatMoney(currentAllocation, 6);
  const formattedYield = formatMoney(yieldEarned, 6);

  const totalAssets = cycleData?.totalDeposited || 0n;
  const inReservePercent = totalAssets > 0n ? (Number(amountInReserve) / Number(totalAssets)) * 100 : 0;
  const allocationPercent = totalAssets > 0n ? (Number(currentAllocation) / Number(totalAssets)) * 100 : 0;


  useEffect(() => {
    if (!payDay) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = payDay - now;
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    updateCountdown(); // Call immediately 
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [payDay]);



  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
      {/* LEFT CARD: Payroll Reserve */}
      <div className="col-span-1 bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-950/80 dark:to-slate-900 border border-indigo-100 dark:border-indigo-500/30 p-6 lg:p-8 rounded-[24px] relative overflow-hidden flex flex-col justify-between dark:shadow-[0_0_30px_rgba(99,102,241,0.05)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/50 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-sm dark:shadow-none">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold ">Payroll Reserve</h3>
            <p className="text-slate-700/70 dark:text-indigo-300/70 text-[11px] uppercase tracking-wider font-bold">Secured Base</p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-3xl lg:text-4xl  font-black text-slate-900 dark:text-white">
            {formattedAmountInReserve} <span className="text-sm font-medium text-slate-600 dark:text-slate-300">USDC</span>
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-none">
            <Timer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{formatDuration(timeRemaining)} to Payday</span>
          </div>
        </div>
      </div>

      {/* RIGHT CARD: Yield & Capital Distribution */}
      <div className="col-span-1 xl:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 lg:p-8 rounded-[24px] flex flex-col justify-between shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <HandCoins className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Total Yield Generated</h3>
            </div>
            <motion.p key={formattedYield} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-3xl  font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              +{formattedYield} <span className="text-sm font-sans font-medium text-emerald-600/60 dark:text-emerald-400/60">USDC</span>
            </motion.p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Active Capital</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formattedAllocation} USDC</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Reserve ({inReservePercent.toFixed(0)}%)</span>
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">Deployed Yield ({allocationPercent.toFixed(0)}%)</span>
          </div>
          <div className="h-3 w-full bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden flex gap-0.5 shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: `${inReservePercent}%` }} className="bg-emerald-500 h-full" transition={{ duration: 1, ease: "easeOut" }} />
            <motion.div initial={{ width: 0 }} animate={{ width: `${allocationPercent}%` }} className="bg-slate-500 h-full" transition={{ duration: 1, ease: "easeOut" }} />
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SMART TIMELINE COMPONENT ---
function SmartTimeline({ logs }: { logs: any[] }) {
  const hasPayday = logs.some(log => log.message.includes("[PAYDAY]"));

  return (
    <div className="flex flex-col relative ml-4 lg:ml-8 border-l-2 border-slate-200 dark:border-slate-800/50 pb-8">
      {logs.map((log, index) => {
        const isInit = log.message.includes("[INIT]");
        const isRebalance = log.message.includes("[REBALANCE]");
        const isLiquidity = log.message.includes("[LIQUIDITY]");
        const isPayday = log.message.includes("[PAYDAY]");

        let Icon = Zap;
        let color = "text-slate-500 dark:text-slate-400";
        let bg = "bg-white dark:bg-slate-900";
        let border = "border-slate-300 dark:border-slate-700";

        if (isInit) { Icon = Activity; color = "text-blue-500 dark:text-blue-400"; bg = "bg-blue-50 dark:bg-blue-500/10"; border = "border-blue-200 dark:border-blue-500/30"; }
        if (isRebalance) { Icon = ArrowRightLeft; color = "text-emerald-500 dark:text-emerald-400"; bg = "bg-emerald-50 dark:bg-emerald-500/10"; border = "border-emerald-200 dark:border-emerald-500/30"; }
        if (isLiquidity) { Icon = Droplets; color = "text-amber-500 dark:text-amber-400"; bg = "bg-amber-50 dark:bg-amber-500/10"; border = "border-amber-200 dark:border-amber-500/30"; }
        if (isPayday) { Icon = CheckCircle2; color = "text-yellow-600 dark:text-yellow-400"; bg = "bg-yellow-50 dark:bg-yellow-500/10"; border = "border-yellow-300 dark:border-yellow-500/50"; }

        const isLatest = index === logs.length - 1;

        return (
          <div key={log.id} className={`relative pl-8 pb-8 lg:pb-10 ${!isLatest ? "opacity-75" : "opacity-100"}`}>
            <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center ${bg} ${border} shadow-sm dark:shadow-none`}>
              <Icon className={`w-4 h-4 ${color.split(' ')[0]} ${color.split(' ')[1]}`} />
            </div>
            <div className="flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-4 rounded-2xl shadow-sm dark:shadow-none">
              <span className="text-[11px]  text-slate-400 mb-2">{log.timestamp}</span>
              <p className={`text-[15px] leading-relaxed ${isLatest ? "text-slate-900 dark:text-white font-medium" : "text-slate-600 dark:text-slate-300"}`}>
                {log.message.replace(/\[.*?\]\s*/, "")}
              </p>
            </div>
          </div>
        );
      })}

      <div className="relative pl-8 pt-2">
        {hasPayday ? (
          <>
            <div className="absolute -left-[13px] top-3 w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-500/20 border-2 border-yellow-400 dark:border-yellow-500 flex items-center justify-center shadow-sm dark:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <Lock className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
            </div>
            <p className="text-yellow-600 dark:text-yellow-500 font-medium text-sm mt-3">Cycle Complete. Waiting for next funding round.</p>
          </>
        ) : (
          <>
            <div className="absolute -left-1 top-4 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <div className="absolute -left-[3px] top-[14px] w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2 mt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Agent continuously monitoring yields...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

