#!/bin/sh
set -e

# Dev workflow for Docker bind mounts:
# 1. SWC compiles TypeScript on src/ changes (nest build --watch)
# 2. Node 22 restarts the server when dist/main.js changes (--watch-path)
#
# Unlike `nest start --watch`, this avoids EADDRINUSE: nest-cli spawns a new
# child before the old HTTP server has released port 3000, especially with
# Docker volume events and without `ps` in slim images (broken tree-kill).

npx nest build --builder swc --watch &
WATCH_PID=$!

cleanup() {
  kill -TERM "$WATCH_PID" 2>/dev/null || true
  wait "$WATCH_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait for the first SWC compilation before starting the server.
until [ -f dist/main.js ] && [ -f dist/app.module.js ]; do
  sleep 0.2
done

node \
  --watch-path=dist/main.js \
  --watch-preserve-output \
  --enable-source-maps \
  dist/main.js
