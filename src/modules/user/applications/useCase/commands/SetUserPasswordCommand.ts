export class SetUserPasswordCommand {
  constructor(
    public readonly userId: number,
    public readonly password: string,
  ) {}
}
