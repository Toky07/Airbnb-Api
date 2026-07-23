export const SUPERADMIN_ROLE_SLUG = 'superadmin';
export const HOST_ROLE_SLUG = 'host';

export type PermissionDefinition = {
  key: string;
  label: string;
  module: string;
};

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'dashboard.read',
    label: 'Accéder au tableau de bord',
    module: 'dashboard',
  },
  { key: 'users.read', label: 'Voir les utilisateurs', module: 'users' },
  { key: 'users.create', label: 'Créer des utilisateurs', module: 'users' },
  { key: 'users.update', label: 'Modifier des utilisateurs', module: 'users' },
  { key: 'users.delete', label: 'Supprimer des utilisateurs', module: 'users' },
  {
    key: 'properties.read',
    label: 'Voir les établissements',
    module: 'properties',
  },
  {
    key: 'properties.create',
    label: 'Créer des établissements',
    module: 'properties',
  },
  {
    key: 'properties.update',
    label: 'Modifier des établissements',
    module: 'properties',
  },
  {
    key: 'properties.delete',
    label: 'Supprimer des établissements',
    module: 'properties',
  },
  { key: 'rooms.read', label: 'Voir les chambres', module: 'rooms' },
  { key: 'rooms.create', label: 'Créer des chambres', module: 'rooms' },
  { key: 'rooms.update', label: 'Modifier des chambres', module: 'rooms' },
  { key: 'rooms.delete', label: 'Supprimer des chambres', module: 'rooms' },
  { key: 'amenities.read', label: 'Voir les équipements', module: 'amenities' },
  {
    key: 'amenities.manage',
    label: 'Gérer les équipements',
    module: 'amenities',
  },
  {
    key: 'import.execute',
    label: 'Importer des données CSV',
    module: 'import',
  },
  {
    key: 'roles.read',
    label: 'Voir les rôles et permissions',
    module: 'roles',
  },
  {
    key: 'roles.manage',
    label: 'Gérer les rôles et permissions',
    module: 'roles',
  },
  {
    key: 'host.dashboard.read',
    label: "Accéder à l'espace hôte",
    module: 'host',
  },
  {
    key: 'host.property.read',
    label: 'Voir son établissement',
    module: 'host',
  },
  {
    key: 'host.property.create',
    label: 'Créer son établissement',
    module: 'host',
  },
  {
    key: 'host.property.update',
    label: 'Modifier son établissement',
    module: 'host',
  },
  { key: 'host.rooms.read', label: 'Voir ses chambres', module: 'host' },
  { key: 'host.rooms.create', label: 'Créer des chambres', module: 'host' },
  { key: 'host.rooms.update', label: 'Modifier ses chambres', module: 'host' },
  { key: 'host.rooms.delete', label: 'Supprimer ses chambres', module: 'host' },
  { key: 'emails.read', label: 'Voir les emails', module: 'emails' },
  { key: 'emails.send', label: 'Envoyer des emails', module: 'emails' },
  { key: 'payments.read', label: 'Voir les paiements', module: 'payments' },
  {
    key: 'reservations.read',
    label: 'Voir les réservations',
    module: 'reservations',
  },
  {
    key: 'reservations.cancel',
    label: 'Annuler les réservations',
    module: 'reservations',
  },
  {
    key: 'host.reservations.read',
    label: 'Voir les réservations de son établissement',
    module: 'host',
  },
  {
    key: 'invoices.read',
    label: 'Consulter les factures',
    module: 'invoices',
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_DEFINITIONS.map((p) => p.key);
