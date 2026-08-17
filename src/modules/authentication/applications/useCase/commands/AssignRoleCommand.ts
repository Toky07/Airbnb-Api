export class AssignRoleCommand {
  constructor(
    public readonly userId: number,
    public readonly roleIds: number[],
    public readonly actorIsSuperAdmin: boolean = false,
  ) {}
}
