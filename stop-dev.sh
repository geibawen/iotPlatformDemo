#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

kill_by_pattern() {
  local pattern="$1"
  pkill -9 -f "$pattern" 2>/dev/null || true
}

echo "[1/3] Stopping dev processes..."
kill_by_pattern "npm run dev:backend"
kill_by_pattern "npm run dev:frontend"
kill_by_pattern "npm run dev -w backend"
kill_by_pattern "npm run dev -w frontend"
kill_by_pattern "tsx watch"
kill_by_pattern "tsx src/index.ts"
kill_by_pattern "vite"
kill_by_pattern "concurrently"
kill_by_pattern "backend/src/index.ts"
kill_by_pattern "src/index.ts"


echo "[2/3] Releasing common dev ports..."
for _ in {1..5}; do
  PORT_PIDS="$(lsof -ti tcp:3001,tcp:3002,tcp:5173 2>/dev/null | sort -u || true)"
  if [[ -z "$PORT_PIDS" ]]; then
    break
  fi
  for pid in $PORT_PIDS; do
    pgid="$(ps -p "$pid" -o pgid= 2>/dev/null | tr -d ' ' || true)"
    if [[ -n "$pgid" ]]; then
      kill -9 -"$pgid" 2>/dev/null || true
    fi
    kill -9 "$pid" 2>/dev/null || true
  done
  sleep 1
done

sleep 1

echo "[3/3] Verifying cleanup..."
BACKEND_LEFT="no"
FRONTEND_LEFT="no"

if lsof -nP -iTCP:3001 -sTCP:LISTEN >/dev/null 2>&1; then
  BACKEND_LEFT="yes"
fi

if lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
  FRONTEND_LEFT="yes"
fi

echo ""
echo "Done."
echo "Backend listener remaining on 3001: $BACKEND_LEFT"
echo "Frontend listener remaining on 5173: $FRONTEND_LEFT"
echo ""
echo "Tip: use ./restart-dev.sh to start fresh services again."
