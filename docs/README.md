# Documentation API (NestJS)

Serveur REST — port **3000**.

## Publics

| Dossier | Contenu |
|---------|---------|
| [utilisateur/](utilisateur/README.md) | Parcours métier expliqués sans code |
| [technique/](technique/README.md) | Modules, endpoints, CQRS |

## Index technique par module

| Module | Document |
|--------|----------|
| Authentification | [technique/authentification.md](technique/authentification.md) |
| Utilisateurs | [technique/utilisateurs.md](technique/utilisateurs.md) |
| Établissements | [technique/etablissements.md](technique/etablissements.md) |
| Chambres & recherche | [technique/chambres-recherche.md](technique/chambres-recherche.md) |
| Équipements | [technique/equipements.md](technique/equipements.md) |
| Espace hôte | [technique/espace-hote-api.md](technique/espace-hote-api.md) |
| Panier | [technique/panier.md](technique/panier.md) |
| Paiement | [technique/paiement.md](technique/paiement.md) |
| Réservations | [technique/reservations.md](technique/reservations.md) |
| Factures | [technique/factures.md](technique/factures.md) |
| Favoris | [technique/favoris.md](technique/favoris.md) |
| Avis | [technique/avis.md](technique/avis.md) |
| Messagerie | [technique/messagerie.md](technique/messagerie.md) |
| Emails | [technique/emails.md](technique/emails.md) |
| Import | [technique/import.md](technique/import.md) |
| Médias | [technique/medias.md](technique/medias.md) |
| OAuth Google (futur) | [technique/oauth-google.md](technique/oauth-google.md) |

## Démarrage

```bash
cd api && npm ci && npm run migration:run && npm run start:dev
```

Voir [README.md](../README.md) et [docs racine](../../docs/README.md).
