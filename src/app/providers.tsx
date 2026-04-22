"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  initiaPrivyWalletConnector,
  injectStyles,
  InterwovenKitProvider,
  TESTNET,
} from "@initia/interwovenkit-react";
import interwovenKitStyles from "@initia/interwovenkit-react/styles.js";

import {
  FLOWROLL_CHAIN,
  COSMOS_CHAIN_ID,
  CUSTOM_APP_CHAIN,
} from "@/lib/interwoven";

// Wagmi connector and chain configuration
const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [FLOWROLL_CHAIN as any],
  transports: {
    [FLOWROLL_CHAIN.id]: http(FLOWROLL_CHAIN.rpcUrls.default.http[0]),
  },
});

export default function Providers({ children }: PropsWithChildren) {
  // Initialize QueryClient with standard cache and retry policies
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            retry: 2,
          },
        },
      }),
  );

  // Inject InterwovenKit base styles on mount
  useEffect(() => {
    injectStyles(interwovenKitStyles);
  }, []);

  // Interwoven protocol configuration
  const interwovenProps: any = {
    ...TESTNET,
    defaultChainId: COSMOS_CHAIN_ID,
    customChain: CUSTOM_APP_CHAIN,
    customChains: [CUSTOM_APP_CHAIN],
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider
          {...interwovenProps}
          // Configuration for seamless 1-click transactions
          enableAutoSign={{
            [COSMOS_CHAIN_ID]: ["/minievm.evm.v1.MsgCall"],
          }}
          autoSignFeePolicy={{
            [COSMOS_CHAIN_ID]: {
              gasMultiplier: 2.0,
              maxGasMultiplierFromSim: 3.0,
              allowedFeeDenoms: ["GAS"],
            },
          }}
        >
          {children}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}