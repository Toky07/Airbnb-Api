# Architecture API

## Stack

- **NestJS 11** — modules, injection, guards
- **TypeORM** — PostgreSQL
- **CQRS** — `@nestjs/cqrs` (CommandBus / QueryBus)
- **EventBus** — événements in-process entre modules

## Structure d’un module

```
modules/<nom>/
  domain/              entités, interfaces repository, événements
  applications/
    useCase/           commands, queries, handlers
    dto/               entrées/sorties HTTP
    services/          logique partagée
    listeners/         réactions aux événements
  infrastructure/      repositories TypeORM, mappers
  interfaces/http/     controllers REST
  <nom>.bootstrap.ts   enregistrement handlers CQRS
  <nom>.module.ts
```

## Fichiers racine

| Fichier | Rôle |
|---------|------|
| `src/app.module.ts` | Import de tous les modules |
| `src/main.ts` | Bootstrap, validation globale, CORS, Helmet |
| `src/shared/` | Pagination, filtres, guards communs |

## Modules métier

`authentication`, `user`, `properties`, `rooms`, `amenity`, `host`, `cart`, `payment`, `reservation`, `invoice`, `mail`, `media`, `import`, `favorite`, `review`, `messaging`

## Migrations

```bash
npm run migration:run    # appliquer
npm run migration:generate -- -n NomMigration  # générer
```

## Tests

- **Unit** : handlers, services (`*.spec.ts` à côté des sources)
- **E2e** : `test/` avec base PostgreSQL de test

Voir [docs racine — tests](../../../docs/technique/08-tests-et-ci.md).
