export const SUPERADMIN_ROLE_SLUG = 'superadmin';

export type PermissionDefinition = {
  key: string;
  label: string;
  module: string;
};

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { key: 'dashboard.read', label: 'Accéder au tableau de bord', module: 'dashboard' },
  { key: 'users.read', label: 'Voir les utilisateurs', module: 'users' },
  { key: 'users.create', label: 'Créer des utilisateurs', module: 'users' },
  { key: 'users.update', label: 'Modifier des utilisateurs', module: 'users' },
  { key: 'users.delete', label: 'Supprimer des utilisateurs', module: 'users' },
  { key: 'properties.read', label: 'Voir les établissements', module: 'properties' },
  { key: 'properties.create', label: 'Créer des établissements', module: 'properties' },
  { key: 'properties.update', label: 'Modifier des établissements', module: 'properties' },
  { key: 'properties.delete', label: 'Supprimer des établissements', module: 'properties' },
  { key: 'rooms.read', label: 'Voir les chambres', module: 'rooms' },
  { key: 'rooms.create', label: 'Créer des chambres', module: 'rooms' },
  { key: 'rooms.update', label: 'Modifier des chambres', module: 'rooms' },
  { key: 'rooms.delete', label: 'Supprimer des chambres', module: 'rooms' },
  { key: 'import.execute', label: 'Importer des données CSV', module: 'import' },
  { key: 'roles.read', label: 'Voir les rôles et permissions', module: 'roles' },
  { key: 'roles.manage', label: 'Gérer les rôles et permissions', module: 'roles' },
];

export const ALL_PERMISSION_KEYS = PERMISSION_DEFINITIONS.map((p) => p.key);
