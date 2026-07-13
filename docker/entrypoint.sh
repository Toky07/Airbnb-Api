#!/bin/sh
set -e

case "${ENVIRONMENT:-prod}" in
  dev|development)
    exec npm run start:dev
    ;;
  prod|production)
    npm run migration:run
    exec node dist/src/main.js
    ;;
  *)
    echo "ENVIRONMENT must be 'dev' or 'prod' (got: ${ENVIRONMENT})" >&2
    exit 1
    ;;
esac
