import { describe, expect, it, vi } from 'vitest';
import { ListInvoicesQueryHandler } from './ListInvoicesQueryHandler';
import { ListInvoicesQuery } from '@src/modules/invoice/applications/useCase/queries/ListInvoicesQuery';
import { createInvoiceRepositoryMock } from '@src/modules/invoice/applications/useCase/invoice-test.helpers';

describe('ListInvoicesQueryHandler', () => {
  it('retourne les factures paginées pour l’admin', async () => {
    const repository = createInvoiceRepositoryMock({
      findPaginated: vi.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            invoiceNumber: 'FACT-2026-000001',
            paymentType: 'reservation',
            paymentId: 42,
            userId: 7,
            customerName: 'Jean Dupont',
            customerEmail: 'jean@test.com',
            createdAt: new Date('2026-07-01T10:00:00.000Z'),
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    });

    const handler = new ListInvoicesQueryHandler(repository);
    const result = await handler.execute(
      new ListInvoicesQuery({ page: 1, limit: 10 }),
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.invoiceNumber).toBe('FACT-2026-000001');
    expect(result.data[0]?.customerEmail).toBe('jean@test.com');
    expect(result.meta.total).toBe(1);
  });
});
