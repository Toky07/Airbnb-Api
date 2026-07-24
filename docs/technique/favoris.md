# Module — Favoris

**Chemin :** `api/src/modules/favorite/`

## Endpoints (`/favorites`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/me` | Liste des favoris |
| POST | `/` | Ajouter `{ roomId }` |
| DELETE | `/:roomId` | Retirer |
| GET | `/check?roomId=` | Vérifier si favori |

## Règles

- Utilisateur authentifié uniquement
- Une entrée par couple (user, room)

## Migration

Table `favorites` — migration TypeORM dédiée.

## Frontend

- `FavoriteButton` sur fiche chambre
- Page `/account/favorites`

## Module

`favorite.module.ts`, `favorite.bootstrap.ts`, handlers CQRS.
