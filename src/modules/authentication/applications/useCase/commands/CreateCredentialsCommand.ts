export class CreateCredentialsCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
