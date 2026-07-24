# Module — Équipements

**Chemin :** `api/src/modules/amenity/`

## Endpoints (`/amenities`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/catalog` | Catalogue public (recherche) |
| GET | `/options` | Options admin |
| GET | `/` | Liste paginée |
| GET | `/properties/:propertyId` | Équipements établissement |
| PUT | `/properties/:propertyId` | Mise à jour établissement |
| GET | `/rooms/:roomId` | Équipements chambre |
| PUT | `/rooms/:roomId` | Mise à jour chambre |
| POST | `/` | Créer équipement |
| PUT | `/:id` | Modifier |
| DELETE | `/:id` | Supprimer |

## Usage

- Filtres de recherche voyageur (`amenityIds`)
- Fiches établissement/chambre
- Admin : `/dashboard/amenities`

## Modèle

Entité `Amenity` + tables de liaison property/room.
