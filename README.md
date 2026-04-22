# flowroll-frontend

> Next.js 15 frontend for the Flowroll protocol.

This repo is a submodule of the [Flowroll monorepo](https://github.com/your-org/flowroll). For a full overview of the protocol and instructions to run the entire stack, see the root README there.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Tech Stack

- **Framework:** Next.js 15, React
- **Styling:** Tailwind CSS, Framer Motion
- **Web3:** Wagmi, Viem, TanStack Query
- **Network:** Initia InterwovenKit, Cosmos Stargate SDK

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/)

> The frontend connects to a running instance of the rebalance agent and deployed contracts. Make sure both are set up before running the frontend. See the [root monorepo README](https://github.com/your-org/flowroll) for the full setup flow.

### Installation

**From the monorepo:**

```bash
cd flowroll-frontend
npm install
```

**As a standalone repo:**

```bash
git clone https://github.com/your-org/flowroll-frontend.git
cd flowroll-frontend
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Fill in the values. See [Environment Variables](#environment-variables) below.

### Run

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_AGENT_URL` | URL of the running rebalance agent health endpoint |
| `NEXT_PUBLIC_FAUCET_PRIVATE_KEY` | Private key for the testnet faucet wallet |
| `NEXT_PUBLIC_BRIDGED_INIT_ADDRESS` | Contract address of the bridged INIT token on Initia EVM |

> `NEXT_PUBLIC_BRIDGED_INIT_ADDRESS` can be copied from `BRIDGED_INIT_ADDRESS` in the smart contract root `.env` after deployment.