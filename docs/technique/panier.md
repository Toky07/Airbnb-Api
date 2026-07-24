# Module — Panier

**Chemin :** `api/src/modules/cart/`

## Endpoints (`/cart`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Contenu du panier |
| POST | `/items` | Ajouter une ligne |
| PATCH | `/items/:id` | Modifier dates/voyageurs |
| DELETE | `/items/:id` | Retirer une ligne |
| DELETE | `/` | Vider |
| POST | `/checkout` | Lancer paiement (hold + Stripe) |

## Session anonyme

Header **`X-Cart-Session`** — identifiant session navigateur.

À la connexion, le panier anonyme est **fusionné** avec le compte utilisateur.

## Checkout

1. Vérification disponibilité
2. Création réservation `pending` (hold)
3. Création PaymentIntent Stripe
4. Retour `clientSecret` + `holdUntil`

## Événements

Écoute confirmation paiement pour finaliser la commande.

## Frontend

`CartPage`, `CartProvider` — port 5173, route `/cart`.
