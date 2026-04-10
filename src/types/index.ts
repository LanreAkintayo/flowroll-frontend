// ─── Identity ─────────────────────────────────────────────────────────────────

export type UserRole = "employer" | "employee";

export interface IdentityState {
  // EVM address from wagmi — what the contracts know this user as
  address: `0x${string}` | undefined;
  // .init username from InterwovenKit — null if none registered
  username: string | null;
  // Best display string: username → truncated address → null
  displayName: string | null;
  isConnected: boolean;
  isLoading: boolean;
  chainId: number | undefined;
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

//  struct PayrollGroup {
//         uint256 groupId;
//         string name;
//         uint256 totalPayroll;
//         uint256 activeCycleId;
//         uint256 cycleDuration;
//         bool exists;
//     }

export interface PayrollGroup {
  groupId: bigint;
  name: string;
  totalPayroll: bigint; // USDC, 6 decimals
  activeCycleId: bigint;
  cycleDuration: bigint; // seconds
  exists: boolean;
}

export interface Employee {
  address: `0x${string}`;
  username: string | null;
  salary: bigint | string; // USDC, 6 decimals
}

// ─── Yield ────────────────────────────────────────────────────────────────────

export interface YieldSnapshot {
  totalDeposited: bigint;
  totalYieldEarned: bigint;
  currentApy: number; // basis points, e.g. 500 = 5%
  cycleStartTs: number; // unix timestamp
  cycleEndTs: number;
}

// ─── CSV upload ───────────────────────────────────────────────────────────────

export interface RosterRow {
  address: string;
  username: string | null;
  salary: string; // raw string from CSV, validated before use
  isValid: boolean;
  error?: string;
}


export interface PayrollCycle {
  cycleId: bigint;
  totalDeposited: bigint;
  cycleStartTime: bigint;
  payDay: bigint;
  cycleDuration: bigint;
  tierThresholds: bigint[];
  snapshotTierBps: bigint[];
  highRiskThreshold: bigint;
  medRiskThreshold: bigint;
  currentAllocation: bigint;
  yieldEarned: bigint;
  isActive: boolean;
  dispatcher: `0x${string}`;
}

// --- TYPES ---
export interface PoolEntry {
  adapterAddress: `0x${string}`;
  pool: `0x${string}`;
  isStablePair: boolean;
  isActive: boolean;
  minApyBps: bigint;
}

export interface PoolData {
  shares: bigint;
  valueUsdc: bigint;
}

export interface PoolDetails {
  name?: string;        
  symbol?: string;      
  poolName?: string;    
  apyBps?: bigint;      
  isStablePair?: boolean; 
  totalAssets?: bigint; 
  totalSupply?: bigint; 
}

export const ACTION_TYPES = [
  "CycleStarted", 
  "Rebalanced", 
  "BufferAdjusted", 
  "MovedToReserve", 
  "PoolBelowMinAPY", 
  "PaydayTriggered", 
  "NoActionNeeded"
];

export interface FormattedAgentLog {
  id: string;
  timestamp: string; 
  message: string;
  type: "info" | "success" | "error" | "warning";
}