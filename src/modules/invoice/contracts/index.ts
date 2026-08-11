/**
 * Surface publique du module invoice pour les utilitaires partagés
 * avec d'autres modules (ex. reservation emails).
 */
export {
  buildInvoiceNumber,
  formatInvoiceAmount,
  formatInvoiceDate,
} from '../applications/utils/format-invoice.util';
