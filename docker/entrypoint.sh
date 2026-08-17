#!/bin/sh
set -e

SYNC_SCRIPT="${SYNC_SCRIPT:-/sync-node-modules.sh}"
if [ -f "$SYNC_SCRIPT" ]; then
  # shellcheck disable=SC1090
  . "$SYNC_SCRIPT"
else
  sync_node_modules() { :; }
fi

wait_for_file() {
  file="$1"
  timeout_s="${2:-60}"
  i=0
  while [ ! -f "$file" ]; do
    i=$((i + 1))
    if [ "$i" -ge "$timeout_s" ]; then
      echo "Timeout waiting for $file" >&2
      exit 1
    fi
    sleep 1
  done
}

drop_privileges_if_root() {
  if [ "$(id -u)" = "0" ] && command -v gosu >/dev/null 2>&1; then
    mkdir -p uploads
    chown -R nestjs:nodejs uploads 2>/dev/null || true
    exec gosu nestjs "$@"
  fi
  exec "$@"
}

case "${ENVIRONMENT:-prod}" in
  dev|development)
    # nest start --watch relance trop tôt et laisse :3000 occupé (EADDRINUSE).
    # Compile en watch + node --watch tue correctement l'ancien process.
    sync_node_modules
    npx nest build --watch &
    wait_for_file dist/main.js 90
    exec node --watch dist/main.js
    ;;
  prod|production)
    # TypeORM migrationsRun: true applique les migrations au bootstrap.
    drop_privileges_if_root node dist/main.js
    ;;
  *)
    echo "ENVIRONMENT must be 'dev' or 'prod' (got: ${ENVIRONMENT})" >&2
    exit 1
    ;;
esac
