# Module — Messagerie

**Chemin :** `api/src/modules/messaging/`

## Endpoints (`/conversations`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/me` | Mes conversations |
| GET | `/:id/messages` | Messages (paginés) |
| POST | `/:id/messages` | Envoyer message |
| POST | `/:id/read` | Marquer lu |
| POST | `/from-reservation/:reservationId` | Ouvrir/créer conversation |

## Création automatique

Listener sur `ReservationConfirmedEvent` — conversation voyageur ↔ hôte.

## Accès

`AssertConversationAccessService` — seuls les participants peuvent lire/écrire.

## Frontend

- Voyageur : `/account/messages`
- Hôte : `/host/messages`
- Polling périodique pour nouveaux messages

## Entités

`Conversation`, `Message` — migration TypeORM dédiée.
