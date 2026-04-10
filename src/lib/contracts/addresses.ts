// Define your supported chain IDs
export const CHAINS = {
  LOCAL: 'minitia-local', // Replace with your actual local chain ID
  TESTNET: '1166491382910980', // Replace with Flowroll's testnet chain ID
} as const;

// Map addresses to the specific network
export const CONTRACT_REGISTRY = {
  [CHAINS.LOCAL]: {
    PAYROLL_MANAGER_ADDRESS: "0xBbfA255E860a49eFbC630EcF2527AB54aBD2350B",
    PAYROLL_MANAGER_DEPLOYMENT_BLOCK: 1629n, 
    USDC_ADDRESS: "0x28CB743B3Bc0fE25a477b41e397A30d8420ffCB9",
    YIELD_ROUTER_ADDRESS: "0xc9146255A1BBa7F2C87146e38a1c0426400f1b74",
    TOKEN: "0xYourLocalTokenAddress...",
  },
  [CHAINS.TESTNET]: {
    PAYROLL_MANAGER_ADDRESS: "0xBbfA255E860a49eFbC630EcF2527AB54aBD2350B",
    PAYROLL_MANAGER_DEPLOYMENT_BLOCK: 1629n, 
    USDC_ADDRESS: "0x28CB743B3Bc0fE25a477b41e397A30d8420ffCB9",
    YIELD_ROUTER_ADDRESS: "0xc9146255A1BBa7F2C87146e38a1c0426400f1b74",
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