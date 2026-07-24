# Module — Utilisateurs

**Chemin :** `api/src/modules/user/`

## Endpoints (`/users`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/options` | Liste légère (select admin) |
| GET | `/` | Liste paginée |
| GET | `/:id` | Détail utilisateur |
| POST | `/` | Création (admin) |
| PUT | `/:id` | Mise à jour |
| PUT | `/:id/roles` | Affectation rôles |
| DELETE | `/:id` | Suppression logique |

## Permissions

Requiert des permissions admin (`users.read`, `users.write`, etc.).

## Entité

Profil utilisateur lié à `Auth` (email, statut) et rôles multiples.

## Handlers

- `ListUsersQuery`, `GetUserQuery`, `CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`, `UpdateUserRolesCommand`

## Frontend consommateur

- Admin : `backend/src/modules/user/`
- Profil voyageur : `/auth/me`, `/auth/profile`
