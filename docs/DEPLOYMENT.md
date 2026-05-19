# EquiGrant Deployment Guide

This guide covers the current MVP deployment path:

- Frontend: Vercel
- Contract: GenLayer StudioNet
- Repository: GitHub

## Current Contract

| Network | Chain ID | Contract |
| --- | ---: | --- |
| GenLayer StudioNet | `61999` | `0xf18d43492210264D81506fA9d13ff84C125D3904` |

## Required Vercel Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://genlayer-explorer.vercel.app
NEXT_PUBLIC_CONTRACT_ADDRESS=0xf18d43492210264D81506fA9d13ff84C125D3904
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` may stay empty for browser wallet testing. Add a real Reown project id later if QR/mobile WalletConnect support is needed.

## Vercel Import Settings

Recommended settings when importing from GitHub:

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Root directory | `frontend` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `.next` |

The root `vercel.json` also supports deployment from the repository root.

## Local Verification Before Deploy

From the repository root:

```bash
npm run lint:contracts
npm run test:direct
npm run build
npm run type-check
```

## Manual Vercel Deploy

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

When prompted, use `frontend` as the project root unless deploying with the root `vercel.json`.

## GitHub Push

After the local repository is initialized and committed:

```bash
git remote add origin https://github.com/<your-username>/equigrant.git
git branch -M main
git push -u origin main
```

Then import the GitHub repository in Vercel.
