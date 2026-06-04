export class MeOutput {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly roles: string[],
    public readonly permissions: string[],
    public readonly isSuperAdmin: boolean,
  ) {}
}
