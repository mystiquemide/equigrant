# Security Policy

## Supported Version

EquiGrant is currently an MVP deployed to GenLayer StudioNet for testing.

## Reporting a Vulnerability

Please open a private security advisory or contact the maintainers directly. Do not publish exploit details in a public issue before maintainers have had time to investigate.

## Security Notes

- Never commit private keys, seed phrases, RPC secrets, or deployer credentials.
- The frontend only uses public `NEXT_PUBLIC_*` environment variables.
- Contract state is stored on GenLayer. There is no off-chain database.
- Run `npm audit` from the standard npm registry before production launch.
- Re-run contract lint and direct tests before every contract deployment.

## Pre-Deploy Checklist

```bash
npm run lint:contracts
npm run test:direct
npm run build
npm run type-check
```
