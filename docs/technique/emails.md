# Module — Emails

**Chemin :** `api/src/modules/mail/`

## Endpoints admin (`/mail`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | File d’emails |
| GET | `/:id` | Détail |
| POST | `/send` | Envoi manuel |
| POST | `/:id/retry` | Relancer échec |

## Transport

| Mode | Variable |
|------|----------|
| Dev | `MAIL_TRANSPORT=console` (log stdout) |
| Prod | SMTP ou Resend |

## Types d’emails

- Confirmation réservation
- Facture PDF en pièce jointe
- Invitation compte / reset password
- Notification hôte

## Traitement

File persistée en base ; retry avec backoff sur échec.

## Admin UI

`backend/` — `/dashboard/emails`
