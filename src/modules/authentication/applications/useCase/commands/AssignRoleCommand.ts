export class AssignRoleCommand {
  constructor(
    public readonly userId: number,
    public readonly roleIds: number[],
  ) {}
}
