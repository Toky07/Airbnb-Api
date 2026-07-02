export class SetRolePermissionsCommand {
  constructor(
    public readonly roleId: number,
    public readonly permissionKeys: string[],
  ) {}
}
