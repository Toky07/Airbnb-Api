# Module — Avis

**Chemin :** `api/src/modules/review/`

## Endpoints (`/reviews`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer un avis |
| GET | `/me` | Mes avis |
| GET | `/` | Liste modération (admin, pending) |
| PATCH | `/:id/moderate` | Approuver / rejeter |

## Endpoints publics (via rooms)

- `GET /rooms/by-slug/:slug/reviews`
- `GET /rooms/by-slug/:slug/rating-summary`

## Éligibilité

`ReviewEligibilityService` — séjour confirmé, dates passées, pas de doublon.

## Modération

Statuts : `pending`, `approved`, `rejected`. Seuls les avis `approved` sont publics.

## Frontend

- Voyageur : dépôt depuis `/account/purchases`
- Admin : `/dashboard/reviews`
- Affichage : `RoomDetailPage`

## Événements

Aucun bus externe ; mise à jour directe du rating summary.
