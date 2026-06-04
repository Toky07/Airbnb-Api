export type AssignUserRolesDto = {
  roleIds: number[];
  /** Required when the user has no login account yet (same email). */
  password?: string;
};
