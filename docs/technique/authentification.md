# Module — Authentification

**Chemin :** `api/src/modules/authentication/`

## Endpoints (`/auth`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register` | Inscription voyageur |
| POST | `/login` | Connexion → JWT |
| GET | `/me` | Profil connecté |
| PUT | `/profile` | Mise à jour profil |
| GET | `/password-setup/validate` | Valider token invitation |
| POST | `/password-setup` | Définir mot de passe (invitation) |
| POST | `/forgot-password` | Demande reset email |
| GET | `/reset-password/validate` | Valider token reset |
| POST | `/reset-password` | Nouveau mot de passe |
| POST | `/assign-role` | Attribuer rôle (admin) |

## Handlers CQRS (extraits)

- `RegisterCommand`, `LoginCommand`
- `ForgotPasswordCommand`, `ResetPasswordCommand`
- `SendAccountInvitationCommand`, `CompletePasswordSetupCommand`
- `UpdateProfileCommand`, `AssignRoleCommand`

## Sécurité

- JWT (`JWT_SECRET`, expiration configurable)
- `JwtAuthGuard`, `PermissionsGuard`
- Rate limiting login / forgot-password
- Permissions : `api/src/modules/authentication/domain/constants/permissions.constant.ts`

## Rôles (`/roles`)

Géré dans le même module — CRUD rôles et permissions.

## OAuth Google

Non implémenté — voir [oauth-google.md](oauth-google.md).

## Tests

`auth.controller.spec.ts`, handlers `*.spec.ts`, e2e `test/auth*.e2e-spec.ts`
