# Module — Réservations

**Chemin :** `api/src/modules/reservation/`

## Endpoints (`/reservations`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer (interne / admin) |
| GET | `/me` | Mes réservations (voyageur) |
| POST | `/me/:id/cancel` | Annuler (voyageur) |
| GET | `/:id/cancellation-preview` | Aperçu remboursement |
| GET | `/host` | Réservations hôte |
| GET | `/bookings` | Liste admin |
| GET | `/bookings/:paymentId` | Détail par paiement |
| GET | `/stats` | Statistiques dashboard |
| POST | `/cancel/:id` | Annulation admin |
| POST | `cancel/:id` (host) | Via module host |

## Statuts

| Statut | Description |
|--------|-------------|
| `pending` | Hold en attente paiement |
| `confirmed` | Payée et active |
| `cancelled` | Annulée |
| `no_show` | Absence |

## Règles métier

- `CheckRoomAvailabilityService` — anti double réservation
- Job planifié : expiration des `pending`
- Politiques d’annulation liées à l’établissement

## Événements

`ReservationConfirmedEvent` → facture, emails, conversation messagerie.

## Frontend

- Voyageur : `/account/purchases`
- Hôte : `/host/reservations`
- Admin : `/dashboard/reservations`
