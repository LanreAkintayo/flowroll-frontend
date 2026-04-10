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

const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  chains: [FLOWROLL_CHAIN as any],
  transports: {
    [FLOWROLL_CHAIN.id]: http(FLOWROLL_CHAIN.rpcUrls.default.http[0]),
  },
});

export default function Providers({ children }: PropsWithChildren) {
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

  useEffect(() => {
    injectStyles(interwovenKitStyles);
  }, []);

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
          enableAutoSign={{
            "flowroll-4": ["/minievm.evm.v1.MsgCall"],
          }}
           autoSignFeePolicy={{
            "flowroll-4": {
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
