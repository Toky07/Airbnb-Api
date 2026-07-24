# OAuth Google — guide d’implémentation (phase ultérieure)

> Statut : **non implémenté** — à activer lorsque les identifiants Google Cloud sont disponibles.

## Prérequis

1. Projet [Google Cloud Console](https://console.cloud.google.com/)
2. OAuth 2.0 Client ID (type « Web application »)
3. URI de redirection autorisées :
   - Dev API : `http://localhost:3000/auth/google/callback`
   - Dev frontend (si flux SPA) : `http://localhost:5173/auth/google/callback`

## Variables d’environnement prévues

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Client ID OAuth |
| `GOOGLE_CLIENT_SECRET` | Secret client |
| `GOOGLE_CALLBACK_URL` | URL de callback API |

## Architecture cible

Module `authentication` — handlers CQRS :

| Type | Handler |
|------|---------|
| Query | `InitiateGoogleOAuthQuery` → redirect URL |
| Command | `CompleteGoogleOAuthCommand` → JWT + linking compte existant par email |

Endpoints prévus : `GET /auth/google`, `GET /auth/google/callback`

## Frontend

Boutons « Continuer avec Google » sur `/login` et `/register`.

## Sécurité

- Valider `state` CSRF
- Rate limiting sur `/auth/google*`

## Références

- `PasswordSetupTokenService`, `auth.bootstrap.ts`
- Ancien emplacement : `api/docs/OAUTH_GOOGLE.md` (alias)
