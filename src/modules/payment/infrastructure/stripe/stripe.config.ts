export function getStripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? '';
}

export function getStripeWebhookSecret(): string {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? '';
}

export function getStripePublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY?.trim() ?? '';
}

export function getStripeCurrency(): string {
  return process.env.STRIPE_CURRENCY?.trim().toLowerCase() || 'eur';
}
