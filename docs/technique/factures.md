# Module — Factures

**Chemin :** `api/src/modules/invoice/`

## Endpoints (`/invoices`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/me` | Mes factures (voyageur) |
| GET | `/me/:id/download` | Télécharger PDF |
| GET | `/` | Liste admin |
| GET | `/:id/download` | PDF admin |

## Génération

- Déclenchée après confirmation de réservation
- PDF via **PDFKit**
- Numérotation séquentielle annuelle (`invoice_sequences`)

## Mentions légales

Variables d’environnement : SIRET, TVA intracom, adresse société, logo (voir `.env.example`).

## Frontend

- Voyageur : lien download depuis `/account/purchases`
- Admin : `/dashboard/invoices`
