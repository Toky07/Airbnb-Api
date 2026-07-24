export class ResetPasswordWithTokenCommand {
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {}
}
