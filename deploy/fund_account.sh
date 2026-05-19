#!/bin/bash
# Show faucet guidance for a GenLayer testnet account.

set -euo pipefail

ADDRESS="${1:-}"

if [ -z "$ADDRESS" ]; then
    echo "Usage: ./fund_account.sh <0x_your_address>"
    exit 1
fi

echo "Request testnet GEN for: $ADDRESS"
echo "Open the GenLayer faucet for the network you are using and request funds."
