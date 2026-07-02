export class StripeWebhookPayloadValidator {
  validate(payload: Buffer, signature: string): void {
    if (!payload?.length) {
      throw new Error('Corps de webhook vide.');
    }
    if (!signature?.trim()) {
      throw new Error('Signature Stripe manquante.');
    }
  }
}
