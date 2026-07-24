# Module — Espace hôte (API)

**Chemin :** `api/src/modules/host/`

Préfixe : **`/host`** — réservé aux utilisateurs avec rôle hôte.

## Profil & établissements

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/profile` | Profil hôte |
| GET | `/properties` | Mes établissements |
| GET | `/properties/:id` | Détail |
| POST | `/properties` | Créer |
| PUT | `/properties/:id` | Modifier |

## Chambres

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/rooms` | Mes chambres |
| POST | `/rooms` | Créer |
| PUT | `/rooms/:id` | Modifier |
| DELETE | `/rooms/:id` | Supprimer |

## Équipements hôte

Options et CRUD via routes `/host/amenities/*` et `/host/properties/:id/amenities`, `/host/rooms/:id/amenities`.

## Disponibilité & tarifs

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST/DELETE | `/rooms/:id/blocked-dates` | Dates bloquées |
| GET/POST/DELETE | `/rooms/:id/rate-overrides` | Tarifs par date |

## Réservations hôte

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/reservations/:id/cancel` | Annuler (côté hôte) |
| POST | `/reservations/:id/no-show` | Marquer no-show |

## Frontend

Routes `/host/*` dans `frontend/src/routes.tsx`.
