#!/bin/bash
# Deploy EquiGrant contract to the currently selected GenLayer network.

set -euo pipefail

echo "=== EquiGrant Contract Deployment ==="

if ! command -v genlayer &> /dev/null; then
    echo "Error: genlayer CLI not found. Install with: pip install genlayer"
    exit 1
fi

NETWORK="${GENLAYER_NETWORK:-studionet}"

echo "Setting network: $NETWORK"
genlayer network set "$NETWORK"

echo "Deploying contracts/equigrant.py..."
genlayer deploy --contract contracts/equigrant.py

echo ""
echo "=== Deployment Complete ==="
echo "Update NEXT_PUBLIC_CONTRACT_ADDRESS in frontend/.env.local and Vercel."
