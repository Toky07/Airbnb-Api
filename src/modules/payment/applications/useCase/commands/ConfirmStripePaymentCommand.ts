export class ConfirmStripePaymentCommand {
    constructor(
        public readonly payload: Buffer,
        public readonly signature: string
    ) {}
}
