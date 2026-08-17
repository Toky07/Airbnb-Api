#!/bin/sh
set -e

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

case "${ENVIRONMENT:-prod}" in
  dev|development)
    # nest start --watch relance trop tôt et laisse :3000 occupé (EADDRINUSE).
    # Compile en watch + node --watch tue correctement l'ancien process.
    npx nest build --watch &
    wait_for_file dist/main.js 90
    exec node --watch dist/main.js
    ;;
  prod|production)
    npm run migration:run
    exec node dist/main.js
    ;;
  *)
    echo "ENVIRONMENT must be 'dev' or 'prod' (got: ${ENVIRONMENT})" >&2
    exit 1
    ;;
esac
