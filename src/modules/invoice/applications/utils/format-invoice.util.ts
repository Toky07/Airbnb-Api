export function formatInvoiceAmount(
  amountCents: number,
  currency: string,
): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export function formatInvoiceDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('fr-FR', options).format(date);
}

export function buildInvoiceNumber(paymentId: number, paidAt: Date): string {
  const year = paidAt.getFullYear();
  return `FACT-${year}-${String(paymentId).padStart(6, '0')}`;
}
