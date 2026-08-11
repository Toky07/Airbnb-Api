/**
 * Contrat feuille (sans barrel fat) pour la politique d'annulation.
 * Les modules qui ne doivent pas charger reservation/contracts/index
 * (ex. properties, pour éviter les cycles) importent depuis ce fichier.
 */
export {
  CANCELLATION_POLICY,
  CANCELLATION_POLICY_LABELS,
  DEFAULT_CANCELLATION_POLICY,
  isCancellationPolicy,
  parseCancellationPolicy,
  type CancellationPolicy,
} from '@src/modules/reservation/domain/constants/cancellation-policy.constant';
