#!/usr/bin/env bash
# =============================================================================
# Zaytoonz — pull, build and restart with live build progress.
#
# Usage (on the VPS, from /opt/zaytoonz):
#   ./deploy.sh                    # all services
#   ./deploy.sh nextjs             # web app only
#   ./deploy.sh python-scraper     # Scrape_Master only
#   ./deploy.sh --no-pull nextjs   # skip git pull
#
# Every build step (npm ci, next build, pip install, ...) is streamed live with
# its duration, and the whole run is saved to logs/deploy-<timestamp>.log.
# =============================================================================
set -euo pipefail

cd "$(dirname "$0")"

PULL=1
if [[ "${1:-}" == "--no-pull" ]]; then
  PULL=0
  shift
fi
SERVICES=("$@")

mkdir -p logs
LOG_FILE="logs/deploy-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Show every Docker build step and its output instead of the collapsed TTY view.
export BUILDKIT_PROGRESS=plain
export DOCKER_BUILDKIT=1

START=$(date +%s)
step() {
  local elapsed=$(( $(date +%s) - START ))
  printf '\n\033[1;32m==> [%02d:%02d] %s\033[0m\n' $((elapsed / 60)) $((elapsed % 60)) "$*"
}

step "Deploying ${SERVICES[*]:-all services} (log: $LOG_FILE)"

if [[ $PULL -eq 1 ]]; then
  step "git pull"
  git pull --ff-only
  git log -1 --oneline
fi

step "Building images (live output below)"
docker compose build "${SERVICES[@]}"

step "Starting containers"
docker compose up -d "${SERVICES[@]}"

step "Waiting for containers to become healthy"
for _ in $(seq 1 60); do
  STATUS=$(docker compose ps --format '{{.Name}}: {{.Status}}' "${SERVICES[@]}")
  if ! grep -qE 'health: starting|Restarting' <<<"$STATUS"; then
    break
  fi
  sleep 5
done
docker compose ps "${SERVICES[@]}"

if grep -qE 'unhealthy|Restarting|Exited|health: starting' <<<"$STATUS"; then
  step "A container is not healthy — last logs:"
  for name in $(grep -E 'unhealthy|Restarting|Exited|health: starting' <<<"$STATUS" | cut -d: -f1); do
    echo "----- $name -----"
    docker logs --tail=60 "$name" || true
  done
  exit 1
fi

# nginx copies its config at container start; restart it so it picks up config
# changes and reconnects to recreated containers.
if [[ ${#SERVICES[@]} -eq 0 || " ${SERVICES[*]} " != *" nginx "* ]]; then
  step "Restarting nginx"
  docker compose restart nginx
fi

step "Cleaning up dangling images"
docker image prune -f >/dev/null

step "Done"
