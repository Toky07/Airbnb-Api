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
| `GOOGLE_CALLBACK_URL` | URL de callback API (ex. `http://localhost:3000/auth/google/callback`) |

Ajouter ces clés dans `.env.example` racine et `api/.env.example` lors de l’implémentation.

## Architecture cible (API)

Module `authentication` — handlers CQRS :

| Type | Handler |
|------|---------|
| Query | `InitiateGoogleOAuthQuery` → redirect URL |
| Command | `CompleteGoogleOAuthCommand` → JWT + linking compte existant par email |

Endpoints prévus :

- `GET /auth/google` — redirige vers Google
- `GET /auth/google/callback` — échange code, crée/lie compte, renvoie JWT ou redirect frontend avec token

Règles métier :

- Si email Google = compte existant actif → lier `googleId` ou connecter directement
- Si nouveau → créer `Auth` + `User` (profil minimal) + JWT
- Tests : mock du provider OAuth dans les specs handlers

## Frontend

- Boutons « Continuer avec Google » sur `/login` et `/register`
- Gestion du callback (query `token=` ou cookie selon choix de sécurité)

## Sécurité

- Valider `state` CSRF sur le flux OAuth
- Ne jamais committer `GOOGLE_CLIENT_SECRET`
- Rate limiting sur `/auth/google*` (réutiliser `AUTH_LOGIN_THROTTLE`)

## Références internes

- Pattern token existant : `PasswordSetupTokenService`, `SendAccountInvitationCommandHandler`
- Bootstrap auth : `api/src/modules/authentication/auth.bootstrap.ts`
