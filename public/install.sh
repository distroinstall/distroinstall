#!/usr/bin/env bash
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐧 DistroInstall${NC}"
echo "Real stats from real Linux users"
echo ""

if ! command -v python3 &>/dev/null; then
  echo -e "${RED}❌ Python 3 is required. Install it with your package manager and try again.${NC}"
  exit 1
fi

echo "📦 Checking dependencies..."
python3 -m pip install --quiet --user distro psutil requests 2>/dev/null \
  || pip3 install --quiet --user distro psutil requests 2>/dev/null \
  || {
    echo -e "${RED}❌ Could not install dependencies automatically.${NC}"
    echo "Run manually: pip3 install distro psutil requests"
    exit 1
  }

TMP=$(mktemp /tmp/distroinstall_XXXXXX.py)
trap "rm -f $TMP" EXIT

echo "⬇️  Fetching script..."
curl -sSL https://distroinstall.com/distroinstall.py -o "$TMP"

echo ""
python3 "$TMP"
