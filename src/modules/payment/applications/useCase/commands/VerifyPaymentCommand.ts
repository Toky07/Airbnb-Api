export class VerifyPaymentCommand {
  constructor(
    public readonly paymentId: number,
    public readonly ownerAuthId: number,
  ) {}
}
