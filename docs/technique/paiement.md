# Module — Paiement

**Chemin :** `api/src/modules/payment/`

## Intégration Stripe

- **PaymentIntents** pour le checkout voyageur
- **Webhooks** signés (`STRIPE_WEBHOOK_SECRET`)
- Remboursements automatiques lors d’annulations éligibles

## Flux

1. `POST /cart/checkout` crée le PaymentIntent
2. Frontend confirme via Stripe.js (`@stripe/react-stripe-js`)
3. Webhook `payment_intent.succeeded` → confirmation réservation
4. Échec / expiration → libération du hold

## Données

Entité `Payment` avec `pricingBreakdown` JSON (sous-total, TVA, taxe séjour, frais).

## Variables d’env

| Variable | Usage |
|----------|-------|
| `STRIPE_SECRET_KEY` | API serveur |
| `STRIPE_WEBHOOK_SECRET` | Validation webhook |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend |

## Tests

Mock Stripe en unit/e2e ; clés test `sk_test_*`.
