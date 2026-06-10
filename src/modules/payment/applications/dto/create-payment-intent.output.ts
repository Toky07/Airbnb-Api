export class CreatePaymentIntentOutput {
  constructor(
    public readonly paymentId: number,
    public readonly clientSecret: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly publishableKey: string,
    public readonly nights: number,
    public readonly pricePerNight: number,
  ) {}
}
