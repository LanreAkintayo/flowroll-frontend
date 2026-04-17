"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  Terminal,
  Server,
  X,
  Briefcase,
  GripHorizontal,
  CheckCircle2,
  ListTree,
  ArrowRight,
  Cpu
} from "lucide-react";
import { Button } from "../ui/button";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

import { useAgentLogs, usePools } from "@/hooks/router/useRouterQueries";
import { useContractClient } from "@/hooks/useContractClient";
import { VaultCard } from "../yield/VaultCard";
import { useCycleSettled } from "@/hooks/vault/useVaultQueries";
import { SmartTimeline } from "../yield/Smartline";
import { TreasuryHero } from "../yield/TreasuryHero";
import { MetricBox } from "../yield/MetricBox";
import { TabButton } from "../yield/TabButton";

// Component interfaces
interface RawLog {
  id: string;
  timestamp: string;
  message: string;
  type: string;
}

interface AgentMetrics {
  status: string;
  uptime: string;
  cycles: {
    total: number;
    success: number;
    failures: number;
  };
  config: {
    intervalMs: number;
  };
}

interface Props {
  cycleId: bigint;
  onClose: () => void;
}

type ViewState = "portfolio" | "ledger" | "terminal";

export function EmployeeVaultEngine({ cycleId, onClose }: Props) {
  // Data state
  const [rawLogs, setRawLogs] = useState<RawLog[]>([]);
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // UI state
  const [activeView, setActiveView] = useState<ViewState>("portfolio");
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // DOM refs and animation controls
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Protocol queries
  const { address } = useContractClient();
  const { data: isCycleSettled } = useCycleSettled(address, cycleId);
  const { data: allPools } = usePools();
  const { data: agentLogs } = useAgentLogs(cycleId);

  // Responsive window sizing
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setDimensions({
        width: mobile ? window.innerWidth : window.innerWidth * 0.90,
        height: window.innerHeight,
      });
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Socket connection and metric polling
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
      } catch (error) {
        console.error("Failed to fetch agent metrics:", error);
      }
    };

    fetchMetrics();
    const metricInterval = setInterval(fetchMetrics, 3000);

    return () => {
      socket.disconnect();
      clearInterval(metricInterval);
    };
  }, []);

  // Auto-scroll logic for text-heavy views
  useEffect(() => {
    if (activeView === "terminal") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    if (activeView === "ledger") {
      timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [rawLogs, agentLogs, activeView]);

  return (
    <div 
      ref={constraintsRef}
      className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center lg:p-6" 
    >
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
        className={`pointer-events-auto bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden relative border-slate-200 dark:border-slate-800 ${isMobile ? "rounded-none" : "rounded-sm border"}`}
      >
        {/* Modal Header */}
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

            {/* View navigation system */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800/50 overflow-x-auto custom-scrollbar">
              <TabButton active={activeView === "portfolio"} onClick={() => setActiveView("portfolio")} icon={<Briefcase className="w-4 h-4" />} label="Vaults" />
              <TabButton active={activeView === "ledger"} onClick={() => setActiveView("ledger")} icon={<ListTree className="w-4 h-4" />} label="Ledger" />
              <TabButton active={activeView === "terminal"} onClick={() => setActiveView("terminal")} icon={<Terminal className="w-4 h-4" />} label="Raw Logs" />
            </div>

            <Button 
              onClick={onClose} 
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* Engine telemetry sidebar */}
          <div className={`${isMobile ? "hidden" : "flex"} w-[280px] shrink-0 bg-slate-50 dark:bg-[#0b1120] border-r border-slate-200 dark:border-slate-800 flex-col p-6 overflow-y-auto custom-scrollbar z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}>
            <div className="flex flex-col gap-3 mb-8 shrink-0">
              <MetricBox label="Agent Status" value={isConnected ? "ONLINE" : "OFFLINE"} color={isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} />
              <MetricBox label="Uptime" value={metrics ? metrics.uptime : "__"} color="text-sky-600 dark:text-sky-400" />
              <MetricBox label="Tick Rate" value={metrics ? `${metrics.config.intervalMs / 1000}s` : "__"} color="text-amber-600 dark:text-amber-400" />
              <MetricBox label="Successful Cycles" value={metrics ? metrics.cycles.success : "__"} color="text-slate-700 dark:text-slate-300" />
            </div>
          </div>

          {/* Dynamic rendering stage */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#070b14] relative">
            <AnimatePresence mode="wait">

              {/* Portfolio grid view */}
              {activeView === "portfolio" && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 p-4 lg:p-8 overflow-y-auto custom-scrollbar"
                >
                  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                          Portfolio Overview
                        </h2>

                        {isCycleSettled ? (
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

                    <button
                      onClick={() => setActiveView("ledger")}
                      className="h-fit shrink-0 group flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs dark:shadow-none"
                    >
                      View Agent Ledger <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <TreasuryHero cycleId={cycleId} />

                  <div className="mt-10 mb-6 flex items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      Active Yield Vaults
                    </h3>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  </div>

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

              {/* Smart ledger view */}
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

              {/* Raw terminal stream */}
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