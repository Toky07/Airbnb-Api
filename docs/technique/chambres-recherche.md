# Module — Chambres & recherche

**Chemin :** `api/src/modules/rooms/`

## Endpoints publics (`/rooms`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste/recherche (filtres avancés, geo) |
| GET | `/by-slug/:slug` | Fiche publique |
| GET | `/by-slug/:slug/pricing-preview` | Aperçu tarif |
| GET | `/by-slug/:slug/reviews` | Avis publiés |
| GET | `/by-slug/:slug/rating-summary` | Note moyenne |

## Filtres de recherche (`GET /rooms`)

| Paramètre | Description |
|-----------|-------------|
| `q` | Mot-clé |
| `checkIn`, `checkOut` | Disponibilité |
| `minPrice`, `maxPrice` | Fourchette prix |
| `guests` | Capacité min. |
| `city` | Ville |
| `roomTypeIds` | Types de chambre |
| `amenityIds` | Équipements |
| `lat`, `lng`, `radiusKm` | Recherche geo (Haversine) |
| `page`, `limit`, `sort` | Pagination |

Implémentation : `apply-room-list-filters.ts`, `parse-advanced-filter-query.ts`.

## Endpoints admin/hôte

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/:id` | Détail par ID |
| POST | `/` | Création |
| PUT | `/:id` | Mise à jour |
| DELETE | `/:id` | Suppression |

## Room types (`/room-types`)

CRUD + `GET /options` (catalogue public).

## Tarification

- Prix de base + overrides par date (module `host`)
- Calcul pricing : service partagé invoqué par `pricing-preview`

## Frontend

`SearchPage`, `RoomDetailPage`, `SearchMapView` (Leaflet).
