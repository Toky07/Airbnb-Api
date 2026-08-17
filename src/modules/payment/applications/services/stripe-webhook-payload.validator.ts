import { BadRequestException } from '@nestjs/common';

export class StripeWebhookPayloadValidator {
  validate(payload: Buffer, signature: string): void {
    if (!payload?.length) {
      throw new BadRequestException('Corps de webhook vide.');
    }
    if (!signature?.trim()) {
      throw new BadRequestException('Signature Stripe manquante.');
    }
  }
}
