# Relation voyageur–hôte (API)

## Favoris

Un voyageur connecté peut **enregistrer des chambres** dans sa liste de favoris et les retirer à tout moment.

## Avis

Après un **séjour confirmé et terminé**, le voyageur peut déposer une note (1–5) et un commentaire.

- L’avis est soumis à **modération** avant publication publique.
- Les notes approuvées apparaissent sur la fiche chambre.

## Messagerie

Une **conversation** est créée à partir d’une réservation confirmée (voyageur ↔ hôte).

- Envoi de messages texte
- Marquage « lu »
- Liste des conversations côté voyageur et hôte

## Notifications email

Confirmations de réservation, factures, invitations et rappels passent par le module **mail** (console en dev, SMTP/Resend en prod).

Voir [Favoris](../technique/favoris.md), [Avis](../technique/avis.md), [Messagerie](../technique/messagerie.md).
