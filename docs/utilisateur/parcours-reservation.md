# Parcours réservation (API)

Ce document décrit **ce que fait le serveur** lors d’une réservation, sans détail de code.

## Étapes métier

1. **Recherche** — l’API liste les chambres disponibles selon dates, filtres et géolocalisation.
2. **Aperçu tarif** — calcul du prix (nuitées, TVA, taxe de séjour, frais) pour une période donnée.
3. **Panier** — ajout de lignes avec dates et nombre de voyageurs ; session anonyme ou compte connecté.
4. **Checkout** — création d’un hold (réservation temporaire) + intention de paiement Stripe.
5. **Paiement** — confirmation via webhook Stripe ; la réservation passe à « confirmée ».
6. **Facture** — génération PDF et envoi email au voyageur et notification à l’hôte.

## Délais et annulations

- Un **hold** expire après quelques minutes si le paiement n’est pas finalisé.
- Une réservation confirmée peut être **annulée** selon la politique de l’établissement ; un remboursement peut être déclenché.

## Où voir le détail technique ?

- [Panier](../technique/panier.md) · [Paiement](../technique/paiement.md) · [Réservations](../technique/reservations.md) · [Factures](../technique/factures.md)
