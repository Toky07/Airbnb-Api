export class AssignUserRolesCommand {
  constructor(
    public readonly userId: number,
    public readonly roleIds: number[],
  ) {}
}
