import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { IUserRepository } from '../../../../user/contracts';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository';
import { DownloadInvoiceQuery } from '../queries/DownloadInvoiceQuery';
import { DownloadInvoiceQueryHandler } from './DownloadInvoiceQueryHandler';

describe('DownloadInvoiceQueryHandler', () => {
  const invoice = {
    id: 7,
    userId: 9,
    path: '/tmp/does-not-need-to-exist-for-access-checks.pdf',
  };

  function createHandler(overrides?: {
    invoiceRepository?: Partial<IInvoiceRepository>;
    userRepository?: Partial<IUserRepository>;
  }) {
    const invoiceRepository = {
      findById: vi.fn().mockResolvedValue(invoice),
      ...overrides?.invoiceRepository,
    } as unknown as IInvoiceRepository;

    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue({ id: 9 }),
      ...overrides?.userRepository,
    } as unknown as IUserRepository;

    return {
      handler: new DownloadInvoiceQueryHandler(
        invoiceRepository,
        userRepository,
      ),
      invoiceRepository,
      userRepository,
    };
  }

  it('rejects when invoice is missing', async () => {
    const { handler } = createHandler({
      invoiceRepository: { findById: vi.fn().mockResolvedValue(null) },
    });

    await expect(
      handler.execute(new DownloadInvoiceQuery(7, 1, false)),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects owner download for another user', async () => {
    const { handler } = createHandler({
      userRepository: { findByAuthId: vi.fn().mockResolvedValue({ id: 99 }) },
    });

    await expect(
      handler.execute(new DownloadInvoiceQuery(7, 1, false)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admin download without ownership check', async () => {
    const { handler, userRepository } = createHandler();

    await expect(
      handler.execute(new DownloadInvoiceQuery(7, null, true)),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(userRepository.findByAuthId).not.toHaveBeenCalled();
  });
});
