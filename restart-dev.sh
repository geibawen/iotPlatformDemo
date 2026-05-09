#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_LOG="/tmp/iot-backend.log"
FRONTEND_LOG="/tmp/iot-frontend.log"

kill_by_pattern() {
  local pattern="$1"
  pkill -9 -f "$pattern" 2>/dev/null || true
}

echo "[1/4] Stopping old dev processes..."
kill_by_pattern "npm run dev:backend"
kill_by_pattern "npm run dev:frontend"
kill_by_pattern "npm run dev -w backend"
kill_by_pattern "npm run dev -w frontend"
kill_by_pattern "tsx watch"
kill_by_pattern "vite"
kill_by_pattern "concurrently"
kill_by_pattern "backend/src/index.ts"

# Kill listeners on common dev ports
PORT_PIDS="$(lsof -ti tcp:3001,tcp:3002,tcp:5173 2>/dev/null | sort -u || true)"
if [[ -n "$PORT_PIDS" ]]; then
  echo "$PORT_PIDS" | xargs kill -9 2>/dev/null || true
fi

sleep 1

echo "[2/4] Starting backend..."
(
  cd "$ROOT_DIR"
  npm run dev:backend > "$BACKEND_LOG" 2>&1 &
  echo $! > /tmp/iot-backend.pid
)

sleep 1

echo "[3/4] Starting frontend..."
(
  cd "$ROOT_DIR"
  npm run dev:frontend > "$FRONTEND_LOG" 2>&1 &
  echo $! > /tmp/iot-frontend.pid
)

sleep 2

echo "[4/4] Verifying services..."
BACKEND_STATUS="down"
FRONTEND_STATUS="down"

for _ in {1..10}; do
  if curl --max-time 2 -s http://localhost:3001/api/health >/dev/null; then
    BACKEND_STATUS="up"
    break
  fi
  sleep 2
done

for _ in {1..10}; do
  if lsof -nP -iTCP:5173 -sTCP:LISTEN >/dev/null 2>&1; then
    FRONTEND_STATUS="up"
    break
  fi
  sleep 2
done

echo ""
echo "Done."
echo "Backend:  $BACKEND_STATUS (log: $BACKEND_LOG, pid file: /tmp/iot-backend.pid)"
echo "Frontend: $FRONTEND_STATUS (log: $FRONTEND_LOG, pid file: /tmp/iot-frontend.pid)"
echo ""
echo "Quick checks:"
echo "  curl http://localhost:3001/api/health"
echo "  open http://localhost:5173"
