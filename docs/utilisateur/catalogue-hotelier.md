# Catalogue hôtelier (API)

## Établissements (properties)

Un **établissement** regroupe adresse, type (hôtel, maison…), politique d’annulation, taxe de séjour et équipements communs.

## Chambres (rooms)

Chaque chambre appartient à un établissement :

- Capacité, type de chambre, description, photos
- Tarif de base par nuit
- **Tarifs dynamiques** (surcharges par date)
- **Dates bloquées** (indisponibilité manuelle)

## Recherche publique

L’API expose une liste filtrée :

- Mot-clé, ville, dates, prix, voyageurs
- Types de chambre et équipements
- **Géolocalisation** (latitude, longitude, rayon en km)

Seules les chambres **libres** sur la période demandée sont retournées.

## Équipements

Catalogue réutilisable (Wi-Fi, piscine, etc.) attaché aux établissements et/ou aux chambres.

Voir [Chambres & recherche](../technique/chambres-recherche.md) et [Équipements](../technique/equipements.md).
