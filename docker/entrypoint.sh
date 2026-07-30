#!/bin/sh
set -e

case "${ENVIRONMENT:-prod}" in
  dev|development)
    exec npx ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/main.ts
    ;;
  prod|production)
    npx run migration:run
    exec node dist/src/main.js
    ;;
  *)
    echo "ENVIRONMENT must be 'dev' or 'prod' (got: ${ENVIRONMENT})" >&2
    exit 1
    ;;
esac
