import { RESTClient, bcs } from "@initia/initia.js";

export const explorerEvmTxs = (chainId: string) => `https://scan.testnet.initia.xyz/${chainId}/evm-txs/`;
export const explorerCosmosTxs = (chainId: string) => `https://scan.testnet.initia.xyz/${chainId}/txs/`;

export type CustomChainConfig = {
  chain_id: string;
  chain_name: string;
  pretty_name: string;
  network_type: string;
  bech32_prefix: string;
  apis: {
    rpc: { address: string }[];
    rest: { address: string }[];
    "json-rpc": { address: string }[];
    indexer: { address: string }[];
  };
  fees: {
    fee_tokens: {
      denom: string;
      fixed_min_gas_price: number;
      low_gas_price?: number;
      average_gas_price?: number;
      high_gas_price?: number;
    }[];
  };
  staking: {
    staking_tokens: { denom: string }[];
  };
  metadata: {
    is_l1: boolean;
    minitia: { type: string };
  };
  native_assets?: {
    denom: string;
    name: string;
    symbol: string;
    decimals: number;
  }[];
};

export const APPCHAIN_EVM = {
  id: 2569952427679664,
  name: "Flowroll Appchain",
  nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:8545"],
    },
  },
} as const;

export const TESTNET_EVM = {
  id: 2124225178762456,
  name: "Flowroll Testnet (evm-1)",
  nativeCurrency: { name: "INIT", symbol: "INIT", decimals: 18 }, 
  rpcUrls: {
    default: {
      http: ["https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz"],
    },
  },
} as const;

export const APPCHAIN_COSMOS_ID = "flowroll-4";
export const TESTNET_COSMOS_ID = "evm-1";

export const APPCHAIN_CONFIG: CustomChainConfig = {
  chain_id: APPCHAIN_COSMOS_ID,
  chain_name: APPCHAIN_COSMOS_ID,
  pretty_name: "Flowroll Appchain",
  network_type: "testnet",
  bech32_prefix: "init",
  apis: {
    rpc: [{ address: "http://localhost:26657" }],
    rest: [{ address: "http://localhost:1317" }],
    "json-rpc": [{ address: "http://localhost:8545" }],
    indexer: [{ address: "http://localhost:8080" }],
  },
  fees: {
    fee_tokens: [
      {
        denom: "GAS",
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  staking: {
    staking_tokens: [{ denom: "GAS" }],
  },
  metadata: {
    is_l1: false,
    minitia: { type: "minievm" },
  },
  native_assets: [
    {
      denom: "GAS",
      name: "GAS Token",
      symbol: "GAS",
      decimals: 18,
    },
  ],
};

export const TESTNET_CONFIG: CustomChainConfig = {
  chain_id: TESTNET_COSMOS_ID,
  chain_name: TESTNET_COSMOS_ID,
  pretty_name: "Initia Testnet (evm-1)",
  network_type: "testnet",
  bech32_prefix: "init",
  apis: {
    rpc: [{ address: "https://rpc-evm-1.anvil.asia-southeast.initia.xyz" }],
    rest: [{ address: "https://rest-evm-1.anvil.asia-southeast.initia.xyz" }],
    "json-rpc": [{ address: "https://jsonrpc-evm-1.anvil.asia-southeast.initia.xyz" }],
    indexer: [{ address: "https://rollytics-api-evm-1.anvil.asia-southeast.initia.xyz" }],
  },
 fees: {
    fee_tokens: [
      {
        denom: "evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22",
        fixed_min_gas_price: 150000000000
      }
    ]
  },
  staking: {
    staking_tokens: [{ denom: "evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22" }],
  },
  metadata: {
    is_l1: false,
    minitia: { type: "minievm" },
  },
  // native_assets: [
  //   {
  //     denom: "evm/2eE7007DF876084d4C74685e90bB7f4cd7c86e22",
  //     name: "INIT Token",
  //     symbol: "INIT",
  //     decimals: 18,
  //   },
  // ],
};

// export const explorerEvmTxs = "https://scan.testnet.initia.xyz/flowroll-4/evm-txs/";
// export const explorerCosmosTxs = "https://scan.testnet.initia.xyz/flowroll-4/txs/";

// export type CustomChainConfig = {
//   chain_id: string;
//   chain_name: string;
//   pretty_name: string;
//   network_type: string;
//   bech32_prefix: string;
//   apis: {
//     rpc: { address: string }[];
//     rest: { address: string }[];
//     "json-rpc": { address: string }[];
//     indexer: { address: string }[];
//   };
//   fees: {
//     fee_tokens: {
//       denom: string;
//       fixed_min_gas_price: number;
//       low_gas_price: number;
//       average_gas_price: number;
//       high_gas_price: number;
//     }[];
//   };
//   staking: {
//     staking_tokens: { denom: string }[];
//   };
//   metadata: {
//     is_l1: boolean;
//     minitia: { type: string };
//   };
//   native_assets: {
//     denom: string;
//     name: string;
//     symbol: string;
//     decimals: number;
//   }[];
// };


// export const FLOWROLL_CHAIN = {
//   id: 2569952427679664,
//   name: "Flowroll Minitia (evm-1)",
//   nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
//   rpcUrls: {
//     default: {
//       http: ["http://localhost:8545"],
//     },
//   },
// } as const;

// export const COSMOS_CHAIN_ID = "flowroll-4";

// export const CUSTOM_APP_CHAIN: CustomChainConfig = {
//   chain_id: COSMOS_CHAIN_ID,
//   chain_name: COSMOS_CHAIN_ID,
//   pretty_name: "Flowroll Appchain",
//   network_type: "testnet",
//   bech32_prefix: "init",
//   apis: {
//     rpc: [{ address: "http://localhost:26657" }],
//     rest: [{ address: "http://localhost:1317" }],
//     "json-rpc": [{ address: "http://localhost:8545" }],
//     indexer: [{ address: "http://localhost:8080" }],
//   },
//   fees: {
//     fee_tokens: [
//       {
//         denom: "GAS",
//         fixed_min_gas_price: 0,
//         low_gas_price: 0,
//         average_gas_price: 0,
//         high_gas_price: 0,
//       },
//     ],
//   },
//   staking: {
//     staking_tokens: [{ denom: "GAS" }],
//   },
//   metadata: {
//     is_l1: false,
//     minitia: { type: "minievm" },
//   },
//   native_assets: [
//     {
//       denom: "GAS",
//       name: "GAS Token",
//       symbol: "GAS",
//       decimals: 18,
//     },
//   ],
// };