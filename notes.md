<!-- THe header is too transparent. You don't want that. -->
<!-- The employer and employee in the frontend is somehow transparent too. -->
<!-- The wallet button in the header is always syncing -->
<!-- The fund wallet button can show Coming soon or something.  -->
<!-- Strategy Hub - Learn how the FlowrollEngine optimizes your capital. I have to find something to do about that. -->
<!-- You see the navbar menu, it is transparent too. -->
<!-- How It Works (vault page) -->
<!-- View History button can show a modal to show coming soon or something like that or better still hide it. I don't know -->
<!-- Flowroll Credit Docs. What will I do about this? -->
<!-- The Group Stats take some time. Try to find something to do about that -->
<!-- For active employee, i will remove manage. -->
<!-- In the Group stats, if you click and not hover, it will show the actual amount. -->
<!-- Make sure that you can not input letter in input fields -->

<!-- Make sure that lastscanned block details is stored in the database. -->
<!-- Make sure that it synced 100%. -->

Change the Transaction modal looks really ugly
Make sure the flow from vault claim to vault is straight forward
Add a button if there is no vault or something.
<!-- Make sure evm-1 will always appear to the users -->




High Priority: Security & Security Audits
<!-- 1. Fix Server-Side Credential Leaks
Files: * flowroll-frontend/src/app/api/faucet/route.ts

flowroll-frontend/src/app/api/claim-usdc/route.ts

flowroll-frontend/src/app/api/mock-bridge/route.ts

Action Item: Rename NEXT_PUBLIC_FAUCET_PRIVATE_KEY to FAUCET_PRIVATE_KEY across your .env and backend code. Remove the NEXT_PUBLIC_ prefix entirely to guarantee Next.js never slips this key into the client-side browser bundle.

Action Item: Secure public API endpoints. Since these routes access server-side funding wallets, restrict them (e.g., via simple rate-limiting or signature verification) so malicious users can't spam them to drain your testnet funds. -->

<!-- 2. Lock Down Agent Health & Logging Endpoints
Files: * flowroll-contract/scripts/agent/health.ts

flowroll-contract/scripts/agent/logger.ts

Action Item: Sanitize the /health endpoint payload. Strip out sensitive infrastructure metrics like raw private RPC URLs and internal router contract variables before rendering the status JSON.

Action Item: Filter socket log broadcasts. Ensure the agent log streaming connection only shares public transaction updates rather than deep, operational system logs that expose system vulnerabilities. -->

<!-- 3. Server-Side Role Enforcement
File: flowroll-frontend/src/store/authStore.ts

Action Item: Treat localStorage roles purely as UI toggle helpers. Ensure any privileged API routes or smart contract functions validate the user's true identity via their connected wallet session signature rather than trusting the frontend's claim of being an "Admin" or "Employer". -->

<!-- ⚙️ Medium Priority: Core System Architecture & Integration
4. Transition to Environment-Driven Configuration
File: flowroll-frontend/src/lib/interwoven.ts

Action Item: Replace all hardcoded instances of http://localhost:8545, local REST, and local indexer endpoints with dynamic environment variables (e.g., process.env.NEXT_PUBLIC_INITIA_RPC_URL).

Action Item: Set up environment configuration files (.env.development, .env.testnet) to streamline swapping infrastructure variables between local setup and the public Initia testnet. -->

<!-- 5. Resolve Mock Bridge API Payload Mismatch
Files: * flowroll-frontend/src/hooks/onboarding/useOnboardingActions.ts

flowroll-frontend/src/app/api/mock-bridge/route.ts

Action Item: Update the frontend execution handler inside useOnboardingActions.ts to explicitly include the target chainId parameters alongside the recipient address when making the POST request to /api/mock-bridge. -->

📈 Scalability & Smart Contract Hardening
6. Optimize Batch Payroll Settlement
Files: * flowroll-contract/src/PayrollDispatcher.sol

flowroll-contract/src/PayVault.sol

Action Item: refactor sequential loop architectures. Because processing employees in a simple unbounded for loop will hit block gas limit ceilings at scale, redesign your payout mechanism.

Alternative Approach: Consider implementing a Pull-Based (Claim) System where the contract simply updates a storage balance ledger, allowing individual employees to withdraw their own streaming salary, or implement a chunked batch layout (startAndEnd indices) to slice through heavy employee lists safely.

7. Governance Structure Evolution
Files: * flowroll-contract/src/FlowrollZapper.sol

flowroll-contract/src/PayVault.sol

flowroll-contract/src/PayrollDispatcher.sol

flowroll-contract/src/YieldRouter.sol

Action Item: Audit all onlyOwner modifiers across these infrastructure files. Document which administrative controls are temporary testing shortcuts.

Action Item: Draft a transition map to hand over ownership from your single developer deployer wallet to a multi-sig framework (like Gnosis Safe) or an Initia native DAO governance architecture before pushing to production.