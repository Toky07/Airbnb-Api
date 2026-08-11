import { describe, expect, it, vi } from 'vitest';
import { ListMyInvoicesQueryHandler } from './ListMyInvoicesQueryHandler';
import { ListMyInvoicesQuery } from '../queries/ListMyInvoicesQuery';
import { createInvoiceRepositoryMock } from '../invoice-test.helpers';
import type { IUserRepository } from '../../../../user/contracts';

describe('ListMyInvoicesQueryHandler', () => {
  it('retourne les factures du voyageur connecté', async () => {
    const invoiceRepository = createInvoiceRepositoryMock({
      findByUserId: vi.fn().mockResolvedValue([
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
      ]),
    });
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue({ id: 7 }),
    } as unknown as IUserRepository;

    const handler = new ListMyInvoicesQueryHandler(
      invoiceRepository,
      userRepository,
    );
    const result = await handler.execute(new ListMyInvoicesQuery(99));

    expect(userRepository.findByAuthId).toHaveBeenCalledWith(99);
    expect(invoiceRepository.findByUserId).toHaveBeenCalledWith(7);
    expect(result).toHaveLength(1);
    expect(result[0]?.invoiceNumber).toBe('FACT-2026-000001');
  });
});
