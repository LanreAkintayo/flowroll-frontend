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
  APPCHAIN_EVM,
  TESTNET_EVM,
  APPCHAIN_COSMOS_ID,
  TESTNET_COSMOS_ID,
  APPCHAIN_CONFIG,
  TESTNET_CONFIG,
} from "@/lib/interwoven";

// Wagmi connector and chain configuration
const wagmiConfig = createConfig({
  connectors: [initiaPrivyWalletConnector],
  // Prioritize TESTNET_EVM by placing it first in the chains array
  chains: [TESTNET_EVM as any, APPCHAIN_EVM as any],
  transports: {
    [TESTNET_EVM.id]: http(TESTNET_EVM.rpcUrls.default.http[0]),
    [APPCHAIN_EVM.id]: http(APPCHAIN_EVM.rpcUrls.default.http[0]),
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
    // Set defaultChainId to TESTNET_COSMOS_ID to prioritize evm-1 in InterwovenKit
    defaultChainId: TESTNET_COSMOS_ID,
    customChain: TESTNET_CONFIG, 
    customChains: [TESTNET_CONFIG, APPCHAIN_CONFIG],
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <InterwovenKitProvider
          {...interwovenProps}
          // Configuration for seamless 1-click transactions
          enableAutoSign={{
            [TESTNET_COSMOS_ID]: ["/minievm.evm.v1.MsgCall"],
            [APPCHAIN_COSMOS_ID]: ["/minievm.evm.v1.MsgCall"],
          }}
          autoSignFeePolicy={{
            [TESTNET_COSMOS_ID]: {
              gasMultiplier: 2.0,
              maxGasMultiplierFromSim: 3.0,
              allowedFeeDenoms: ["evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22"],
            },
            [APPCHAIN_COSMOS_ID]: {
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



// "use client";

// import { PropsWithChildren, useEffect, useState } from "react";
// import { createConfig, http, WagmiProvider } from "wagmi";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import {
//   initiaPrivyWalletConnector,
//   injectStyles,
//   InterwovenKitProvider,
//   TESTNET,
// } from "@initia/interwovenkit-react";
// import interwovenKitStyles from "@initia/interwovenkit-react/styles.js";

// import {
//   APPCHAIN_EVM,
//   TESTNET_EVM,
//   APPCHAIN_COSMOS_ID,
//   TESTNET_COSMOS_ID,
//   APPCHAIN_CONFIG,
//   TESTNET_CONFIG,
// } from "@/lib/interwoven";

// const wagmiConfig = createConfig({
//   connectors: [initiaPrivyWalletConnector],
//   chains: [TESTNET_EVM as any, APPCHAIN_EVM as any],
//   transports: {
//     [TESTNET_EVM.id]: http(TESTNET_EVM.rpcUrls.default.http[0]),
//     [APPCHAIN_EVM.id]: http(APPCHAIN_EVM.rpcUrls.default.http[0]),
//   },
// });

// export default function Providers({ children }: PropsWithChildren) {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             staleTime: 1000 * 30,
//             retry: 2,
//           },
//         },
//       }),
//   );

//   useEffect(() => {
//     injectStyles(interwovenKitStyles);
//   }, []);

//   const interwovenProps: any = {
//     ...TESTNET,
//     defaultChainId: APPCHAIN_COSMOS_ID,
//     customChain: APPCHAIN_CONFIG,
//     customChains: [APPCHAIN_CONFIG, TESTNET_CONFIG],
//   };


//   return (
//     <QueryClientProvider client={queryClient}>
//       <WagmiProvider config={wagmiConfig}>
//         <InterwovenKitProvider
//           {...interwovenProps}
//           enableAutoSign={{
//             [TESTNET_COSMOS_ID]: ["/minievm.evm.v1.MsgCall"],
//             [APPCHAIN_COSMOS_ID]: ["/minievm.evm.v1.MsgCall"],
//           }}
//           autoSignFeePolicy={{
//             [APPCHAIN_COSMOS_ID]: {
//               gasMultiplier: 2.0,
//               maxGasMultiplierFromSim: 3.0,
//               allowedFeeDenoms: ["GAS"],
//             },
//             [TESTNET_COSMOS_ID]: {
//               gasMultiplier: 2.0,
//               maxGasMultiplierFromSim: 3.0,
//               allowedFeeDenoms: ["evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22"],
//             },
//           }}
//         >
//           {children}
//         </InterwovenKitProvider>
//       </WagmiProvider>
//     </QueryClientProvider>
//   );
// }