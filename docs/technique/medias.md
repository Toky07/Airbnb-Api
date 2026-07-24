# Module — Médias

**Chemin :** `api/src/modules/media/`

## Rôle

Upload et stockage des **images** (photos établissements, chambres).

## Stockage

Fichiers locaux en dev (`uploads/`) — configurable pour S3 ou équivalent en prod.

## Intégration

- Module `host` — upload lors création/édition chambre
- Module `properties` / `rooms` — URLs exposées dans les DTOs publics

## Sécurité

Validation MIME, taille max, noms sanitizés.

## Frontend

Composants upload dans l’espace hôte et l’admin.
