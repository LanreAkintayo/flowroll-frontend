// Define your supported chain IDs
export const CHAINS = {
  LOCAL: 'minitia-local', 
  TESTNET: '1166491382910980', 
} as const;

// Map addresses to the specific network
export const CONTRACT_REGISTRY = {
  [CHAINS.LOCAL]: {
    PAYROLL_MANAGER_ADDRESS: "0xBbfA255E860a49eFbC630EcF2527AB54aBD2350B",
    PAYROLL_MANAGER_DEPLOYMENT_BLOCK: 1629n, 
    USDC_ADDRESS: "0x28CB743B3Bc0fE25a477b41e397A30d8420ffCB9",
    YIELD_ROUTER_ADDRESS: "0xc9146255A1BBa7F2C87146e38a1c0426400f1b74",
    PAY_VAULT_ADDRESS: "0x6a5413f54143925E1F768351Bbfbe5dE586d76AB",
    PAYROLL_DISPATCHER_ADDRESS: "0xC53046cC58ba3a98A69A1A40D16724b2a507C0E1",
    TOKEN: "0xYourLocalTokenAddress...",
  },
  [CHAINS.TESTNET]: {
    PAYROLL_MANAGER_ADDRESS: "0xBbfA255E860a49eFbC630EcF2527AB54aBD2350B",
    PAYROLL_MANAGER_DEPLOYMENT_BLOCK: 1629n, 
    USDC_ADDRESS: "0x28CB743B3Bc0fE25a477b41e397A30d8420ffCB9",
    YIELD_ROUTER_ADDRESS: "0xc9146255A1BBa7F2C87146e38a1c0426400f1b74",
    PAY_VAULT_ADDRESS: "0x6a5413f54143925E1F768351Bbfbe5dE586d76AB",
    PAYROLL_DISPATCHER_ADDRESS: "0xC53046cC58ba3a98A69A1A40D16724b2a507C0E1",
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