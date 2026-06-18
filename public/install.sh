#!/usr/bin/env bash
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}>_ DistroInstall${NC}"
echo "Real stats from real Linux users"
echo ""

if ! command -v python3 &>/dev/null; then
  echo -e "${RED}Error: Python 3 is required. Install it with your package manager and try again.${NC}"
  exit 1
fi

TMP=$(mktemp /tmp/distroinstall_XXXXXX.py)
trap "rm -f $TMP" EXIT

echo "==> Fetching script..."
curl -sSL https://distroinstall.com/distroinstall.py -o "$TMP"

echo ""
# No dependencies needed - the script uses only the Python standard library.
python3 "$TMP" </dev/tty
