# API NestJS

Serveur REST du projet Airbnb : authentification JWT, établissements, chambres, panier, réservations, paiement Stripe, factures, emails.

Stack : NestJS 11, TypeORM, PostgreSQL (SQLite en tests unitaires), Redis, Vitest.

## Démarrage

```bash
npm ci
cp .env.example .env   # si présent ; sinon variables racine .env
npm run migration:run
npm run start:dev        # http://localhost:3000
```

Avec Docker : `make dev` depuis la racine du monorepo.

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | API en watch mode |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm run test` | Tests unitaires (370+) |
| `npm run test:e2e` | Tests e2e controllers (PostgreSQL `airbnb_test`, 115+) |
| `npm run import:sample-data` | Import CSV d’exemple |
| `npm run migration:generate` | Génère une migration après changement d’entités |
| `npm run migration:run` | Applique les migrations |
| `npm run migration:revert` | Annule la dernière migration |

## Architecture

Modules sous `src/modules/` : Clean Architecture + CQRS (`commands/`, `queries/`, `handlers/`, `*.bootstrap.ts`).

Swagger (si activé) : `/api` ou documenté dans `main.ts`.

Documentation monorepo : [../README.md](../README.md).

## Documentation

- [docs/README.md](docs/README.md) — index API (utilisateur + technique par module)
- [docs/technique/oauth-google.md](docs/technique/oauth-google.md) — OAuth Google (phase ultérieure)
- Vue globale : [../docs/README.md](../docs/README.md)
