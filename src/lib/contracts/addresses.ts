// Define your supported chain IDs
export const CHAINS = {
  LOCAL: 'minitia-local',
  TESTNET: '1166491382910980',
} as const;

// Map addresses to the specific network
export const CONTRACT_REGISTRY = {
  [CHAINS.LOCAL]: {
    PAYROLL_MANAGER_ADDRESS: "0xeFB942221A3b0ef25F8066Ef152D873dbd2dd7b9",
    PAYROLL_MANAGER_DEPLOYMENT_BLOCK: 5126n,
    USDC_ADDRESS: "0x82d2691947E11a42dba2c693762D8c8a3557AA51",
    YIELD_ROUTER_ADDRESS: "0xcAEDd6EE8fe3b073119cdeD5867bDb34Af9E21fd",
    PAY_VAULT_ADDRESS: "0x5D6f775E748636f0a3B40CAB507FaA6dfDb2A9e1",
    PAYROLL_DISPATCHER_ADDRESS: "0xE20f1f08c1c41C8bD175F0D80915C85bC8DCC9d1",
    TOKEN: "0xYourLocalTokenAddress...",
  },
  [CHAINS.TESTNET]: {
    PAYROLL_MANAGER_ADDRESS: "0xeFB942221A3b0ef25F8066Ef152D873dbd2dd7b9",
    PAYROLL_MANAGER_DEPLOYMENT_BLOCK: 5126n,
    USDC_ADDRESS: "0x82d2691947E11a42dba2c693762D8c8a3557AA51",
    YIELD_ROUTER_ADDRESS: "0xcAEDd6EE8fe3b073119cdeD5867bDb34Af9E21fd",
    PAY_VAULT_ADDRESS: "0x5D6f775E748636f0a3B40CAB507FaA6dfDb2A9e1",
    PAYROLL_DISPATCHER_ADDRESS: "0xE20f1f08c1c41C8bD175F0D80915C85bC8DCC9d1",
    TOKEN: "0xYourTestnetTokenAddress...",
  }
} as const;

// A smart helper function to fetch the right addresses
export function getContractsForChain(chainId: string) {
  const contracts = CONTRACT_REGISTRY[chainId as keyof typeof CONTRACT_REGISTRY];

  if (!contracts) {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  return contracts;
}