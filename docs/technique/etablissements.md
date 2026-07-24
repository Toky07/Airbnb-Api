# Module — Établissements

**Chemin :** `api/src/modules/properties/`

## Endpoints

### Properties (`/properties`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/options` | Options pour selects |
| GET | `/` | Liste paginée (admin) |
| GET | `/:id` | Détail |
| POST | `/` | Création |
| PUT | `/:id` | Mise à jour |
| DELETE | `/:id` | Suppression |

### Property types (`/property-types`)

CRUD types d’établissement (hôtel, gîte, etc.) + `GET /options`.

## Champs métier clés

- Adresse, ville, pays, coordonnées GPS
- Politique d’annulation (`flexible`, `moderate`, `stricte`)
- Taxe de séjour (%)
- Statut publication

## Espace hôte

Les hôtes créent/modifient leurs établissements via `/host/properties` (module `host`).

## Admin

Dashboard `backend/` — `/dashboard/properties`, `/dashboard/categories`.
