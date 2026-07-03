import { describe, expect, it } from 'vitest';
import {
  buildInvoiceNumber,
  formatInvoiceAmount,
  formatInvoiceDate,
} from './format-invoice.util';

describe('format-invoice.util', () => {
  it('formate un montant en euros', () => {
    expect(formatInvoiceAmount(32000, 'eur')).toContain('320');
  });

  it('formate une date longue en français', () => {
    expect(formatInvoiceDate(new Date('2026-06-10T00:00:00.000Z'))).toContain(
      '2026',
    );
  });

  it('génère un numéro de facture stable', () => {
    expect(buildInvoiceNumber(42, new Date('2026-06-10T00:00:00.000Z'))).toBe(
      'FACT-2026-000042',
    );
  });
});
