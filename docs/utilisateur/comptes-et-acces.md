# Comptes et accès (API)

## Inscription et connexion

- **Inscription** : email, mot de passe, profil minimal → compte voyageur actif.
- **Connexion** : renvoie un **jeton JWT** utilisé par les applications web.
- **Invitation admin** : un administrateur peut créer un compte ; le voyageur définit son mot de passe via un lien sécurisé.

## Mot de passe oublié

1. Demande par email (`forgot-password`).
2. Lien à usage unique avec expiration.
3. Nouveau mot de passe via `reset-password`.

## Rôles et permissions

| Rôle typique | Accès |
|--------------|-------|
| Voyageur | Panier, réservations, favoris, avis, messages |
| Hôte | Gestion de ses établissements et chambres |
| Admin | Catalogue global, utilisateurs, modération |

Les permissions fines (RBAC) contrôlent chaque action côté API.

## Sécurité

- Mots de passe hashés (bcrypt).
- Limitation du nombre de tentatives de connexion.
- CORS restreint aux URLs frontend et admin configurées.

Voir [Authentification](../technique/authentification.md).
