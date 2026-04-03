#!/usr/bin/env bash
# Master helper: points to step-by-step docs and optionally starts Docker Compose.
# Usage:
#   ./deploy-hostinger.sh              # print docs order + repo compose hints
#   ./deploy-hostinger.sh up           # docker compose up -d (production file)
#   ./deploy-hostinger.sh build        # docker compose build (production file)
#
# Run from repository root, or set ZAYTOONZ_ROOT.

set -euo pipefail

ROOT="${ZAYTOONZ_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
COMPOSE="${COMPOSE_FILE:-docker-compose.production.yml}"

echo "Zaytoonz NGO — Hostinger VPS deployment helper"
echo "Repository root: $ROOT"
echo ""
echo "Read the numbered guides in order:"
echo "  $ROOT/deployment/hostinger-vps/README.md"
echo ""
echo "Compose file for this script: $COMPOSE"
echo ""

case "${1:-}" in
  build)
    cd "$ROOT"
    docker compose -f "$COMPOSE" --env-file .env build
    ;;
  up)
    cd "$ROOT"
    docker compose -f "$COMPOSE" --env-file .env up -d
    docker compose -f "$COMPOSE" ps
    ;;
  "")
    echo "Next steps:"
    echo "  1. Ensure .env exists at $ROOT/.env"
    echo "  2. $0 build"
    echo "  3. $0 up"
    echo "  4. Follow deployment/hostinger-vps/06-SSL-AND-NGINX.md for TLS"
    ;;
  *)
    echo "Unknown argument: $1 (use build, up, or no args)"
    exit 1
    ;;
esac
