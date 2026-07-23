export class CancellationPreviewOutput {
  constructor(
    public readonly reservationId: number,
    public readonly refundAmount: number,
    public readonly refundPercent: number,
    public readonly policyLabel: string,
    public readonly cancellationPolicy: string,
    public readonly paymentAmount: number,
    public readonly currency: string,
  ) {}
}
