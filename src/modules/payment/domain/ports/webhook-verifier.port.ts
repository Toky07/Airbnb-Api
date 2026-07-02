import type { WebhookEventPayload } from './payment-gateway.port';

export const WEBHOOK_VERIFIER = 'WEBHOOK_VERIFIER';

export interface IWebhookVerifier {
  verify(payload: Buffer, signature: string): WebhookEventPayload;
}
