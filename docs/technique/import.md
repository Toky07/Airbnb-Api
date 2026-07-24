# Module — Import CSV

**Chemin :** `api/src/modules/import/`

## Endpoint

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/import` | Import bulk (admin) |

## Usage

Import massif d’établissements, chambres ou utilisateurs depuis un fichier CSV structuré.

## Permissions

Réservé aux administrateurs avec permission d’import.

## Traitement

Validation ligne par ligne, rapport d’erreurs, insertion transactionnelle par batch.

Voir [docs racine — import](../../../docs/technique/07-import-emails.md).
