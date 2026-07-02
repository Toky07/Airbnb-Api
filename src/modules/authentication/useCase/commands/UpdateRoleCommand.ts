export class UpdateRoleCommand {
  constructor(
    public readonly payload: {
      id: number;
      name?: string;
      description?: string | null;
    },
  ) {}
}
