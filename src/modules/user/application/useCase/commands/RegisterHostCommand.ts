export type RegisterHostPayload = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export class RegisterHostCommand {
  constructor(public readonly dto: RegisterHostPayload) {}
}
