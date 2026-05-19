# Contributing to EquiGrant

EquiGrant is a GenLayer-first application. Contracts are Python intelligent contracts, not Solidity.

## Local Setup

```bash
npm --prefix frontend ci
python -m venv .venv
source .venv/bin/activate
pip install genlayer genvm-lint pytest
```

## Development

```bash
npm run dev
```

## Verification

Run the core checks before opening a pull request:

```bash
npm run lint:contracts
npm run test:direct
npm run build
npm run type-check
```

## Branches and Commits

- Branches: `feat/<short-description>` or `fix/<short-description>`
- Commits: conventional commits such as `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Pull requests should include a summary, screenshots for UI work, and verification commands.

## Contract Rules

- Use `from genlayer import *`
- Keep all state on GenLayer
- Use `run_nondet_unsafe` with validator functions for LLM calls
- Prefix expected errors with `[EXPECTED]`
- Prefix external integration errors with `[EXTERNAL]`
- Prefix transient network errors with `[TRANSIENT]`
- Prefix model errors with `[LLM_ERROR]`
