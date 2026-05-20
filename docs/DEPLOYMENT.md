# EquiGrant Deployment Guide

This guide covers the current MVP deployment path:

- Frontend: Vercel
- Contract: GenLayer StudioNet
- Repository: GitHub

## Current Contract

| Network | Chain ID | Contract |
| --- | ---: | --- |
| GenLayer StudioNet | `61999` | `0xf18d43492210264D81506fA9d13ff84C125D3904` |

## Prerequisites

- Node.js 18.20+ and npm 10+
- Python 3.12+ for contract linting and direct-mode tests
- GenLayer CLI/tooling for contract deployment
- Vercel CLI for manual frontend deployment
- A funded GenLayer StudioNet deployer account when redeploying contracts

## Required Vercel Environment Variables

Set these in Vercel Project Settings → Environment Variables:

| Variable | Required | Description |
| --- | ---: | --- |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | Yes | GenLayer RPC endpoint used by the frontend. |
| `NEXT_PUBLIC_GENLAYER_CHAIN_ID` | Yes | Target GenLayer chain id. |
| `NEXT_PUBLIC_GENLAYER_EXPLORER_URL` | Yes | Explorer base URL for transaction and contract links. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Yes | Deployed EquiGrant contract address. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | Reown/WalletConnect project id for QR and mobile wallet support. |

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` may stay empty for browser wallet testing. Add a real Reown project id later if QR/mobile WalletConnect support is needed.

Use [frontend/.env.example](../frontend/.env.example) as the source template for Vercel frontend variables. Use the root [.env.example](../.env.example) only for local contract deployment, and never commit a real `PRIVATE_KEY`.

## Vercel Import Settings

Recommended settings when importing from GitHub:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | `frontend` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `.next` |

The Vercel project is configured with `frontend` as the root directory. Keep Vercel-specific build settings in [frontend/vercel.json](../frontend/vercel.json), where commands are relative to `frontend`.

## Local Verification Before Deploy

From the repository root:

```bash
npm run lint
npm run lint:contracts
npm run test:direct
npm run build
npm run type-check
```

You can run the same sequence with:

```bash
npm run verify
```

## Manual Vercel Deploy

```bash
npm i -g vercel
vercel login
vercel deploy --prod
```

When prompted, use `frontend` as the project root. The linked project should report `mystiquemides-projects/equigrant`.

## GitHub Push

After the local repository is initialized and committed:

```bash
git remote add origin https://github.com/mystiquemide/equigrant.git
git branch -M main
git push -u origin main
```

Then import the GitHub repository in Vercel.

## Post-Deploy Verification

- Open the production URL and confirm the landing page renders.
- Connect a browser wallet on GenLayer StudioNet.
- Browse bounties and open a bounty detail page.
- Confirm the deployed contract address appears in the app and explorer links resolve.
- Review Vercel build logs for warnings or missing environment variables.

## Troubleshooting

### Build fails on Vercel

Confirm the Vercel root directory is `frontend` and that [frontend/vercel.json](../frontend/vercel.json) uses commands relative to that directory.

### Wallet connection does not show QR or mobile options

Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel with a Reown project id and redeploy.

### Contract reads fail

Check `NEXT_PUBLIC_GENLAYER_RPC_URL`, `NEXT_PUBLIC_GENLAYER_CHAIN_ID`, and `NEXT_PUBLIC_CONTRACT_ADDRESS` against the deployed network.
