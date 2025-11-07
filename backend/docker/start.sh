#!/usr/bin/env bash
set -e

AI_SERVICE_DIR="/app/ai-service"
BACKEND_JAR="/app/backend/app.jar"

start_ai_service() {
  cd "$AI_SERVICE_DIR"
  uvicorn main:app --host 0.0.0.0 --port 5001 --workers "${AI_WORKERS:-1}" &
  AI_PID=$!
}

start_backend() {
  java -jar "$BACKEND_JAR" &
  BACKEND_PID=$!
}

shutdown_services() {
  kill "$BACKEND_PID" "$AI_PID" 2>/dev/null || true
}

trap shutdown_services INT TERM

start_ai_service
start_backend

EXIT_CODE=0

while true; do
  if ! kill -0 "$AI_PID" 2>/dev/null; then
    wait "$AI_PID" || EXIT_CODE=$?
    break
  fi

  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    wait "$BACKEND_PID" || EXIT_CODE=$?
    break
  fi

  sleep 1
done

shutdown_services

exit "$EXIT_CODE"


