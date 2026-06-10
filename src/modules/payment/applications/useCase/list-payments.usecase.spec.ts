import { describe, expect, it, vi } from 'vitest';
import { ListPaymentsUseCase } from './list-payments.usecase';
import {
  createPaymentRepositoryMock,
  createSamplePayment,
} from './payment-test.helpers';

describe('ListPaymentsUseCase', () => {
  it('retourne une liste paginée de paiements', async () => {
    const repository = createPaymentRepositoryMock({
      findPaginated: vi.fn().mockResolvedValue({
        data: [createSamplePayment({ id: 1 }), createSamplePayment({ id: 2 })],
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      }),
    });

    const useCase = new ListPaymentsUseCase(repository);
    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.total).toBe(2);
    expect(result.data[0].id).toBe(1);
  });
});
