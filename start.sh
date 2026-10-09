#!/usr/bin/env bash
# HealthPulse - macOS launcher (equivalent of start.bat)
# Usage: ./start.sh
set -uo pipefail
cd "$(dirname "$0")"
ROOT="$PWD"

echo "============================================"
echo "  HealthPulse - Starting All Services"
echo "============================================"

# [1/3] MongoDB
if ! nc -z localhost 27017 2>/dev/null; then
  echo "[1/3] Starting MongoDB..."
  brew services start mongodb/brew/mongodb-community >/dev/null
  for i in $(seq 1 30); do nc -z localhost 27017 2>/dev/null && break; sleep 1; done
fi
nc -z localhost 27017 2>/dev/null \
  && echo "[1/3] MongoDB      ready  -> localhost:27017" \
  || { echo "[1/3] MongoDB FAILED to start"; exit 1; }

# [2/3] ML service (port 8000)
echo "[2/3] Starting ML Service..."
( cd "$ROOT/ml" && ./.venv/bin/python src/api.py > "$ROOT/.ml.log" 2>&1 & )
for i in $(seq 1 40); do curl -sf -m 1 http://127.0.0.1:8000/health >/dev/null 2>&1 && break; sleep 1; done
if curl -sf -m 2 http://127.0.0.1:8000/health >/dev/null 2>&1; then
  # Warm the model: the first prediction loads the .joblib and can exceed
  # the backend's 6s ML timeout if it happens during a real user request.
  curl -sf -m 60 -X POST http://127.0.0.1:8000/predict/diabetes \
    -H 'Content-Type: application/json' -d '{}' >/dev/null 2>&1
  echo "[2/3] ML Service   ready  -> http://localhost:8000/docs  (model warmed)"
else
  echo "[2/3] ML Service   NOT running (see .ml.log) - app still works, risk scores disabled"
fi

# [3/3] Backend (port 5001)
echo "[3/3] Starting Backend..."
( cd "$ROOT/backend" && npm start > "$ROOT/.backend.log" 2>&1 & )
for i in $(seq 1 30); do curl -sf -m 1 http://localhost:5001/api/health >/dev/null 2>&1 && break; sleep 1; done
curl -sf -m 2 http://localhost:5001/api/health >/dev/null 2>&1 \
  && echo "[3/3] Backend      ready  -> http://localhost:5001/api/health" \
  || { echo "[3/3] Backend FAILED (see .backend.log)"; }

echo
echo "============================================"
echo "  Frontend starting on http://localhost:3000"
echo "  Login: rahul.sharma@email.com / Password123!"
echo "  Press Ctrl+C to stop the frontend."
echo "  Then run ./stop.sh to stop backend + ML."
echo "============================================"
echo

npm run dev
