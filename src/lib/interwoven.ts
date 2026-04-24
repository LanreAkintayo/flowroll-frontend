import { RESTClient, bcs } from "@initia/initia.js";



export const explorerEvmTxs = "https://scan.testnet.initia.xyz/flowroll-4/evm-txs/";
export const explorerCosmosTxs = "https://scan.testnet.initia.xyz/flowroll-4/txs/";

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
      low_gas_price: number;
      average_gas_price: number;
      high_gas_price: number;
    }[];
  };
  staking: {
    staking_tokens: { denom: string }[];
  };
  metadata: {
    is_l1: boolean;
    minitia: { type: string };
  };
  native_assets: {
    denom: string;
    name: string;
    symbol: string;
    decimals: number;
  }[];
};


export const FLOWROLL_CHAIN = {
  id: 2569952427679664,
  name: "Flowroll Minitia (evm-1)",
  nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://localhost:8545"],
    },
  },
} as const;

export const COSMOS_CHAIN_ID = "flowroll-4";

export const CUSTOM_APP_CHAIN: CustomChainConfig = {
  chain_id: COSMOS_CHAIN_ID,
  chain_name: COSMOS_CHAIN_ID,
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