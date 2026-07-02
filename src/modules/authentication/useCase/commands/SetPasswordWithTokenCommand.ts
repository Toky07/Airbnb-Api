export class SetPasswordWithTokenCommand {
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {}
}
