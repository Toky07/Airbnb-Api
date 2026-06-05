import { describe, expect, it, vi } from 'vitest';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import { ListEmailsUseCase } from './list-emails.usecase';
import { createEmailRepositoryMock } from './email-test.helpers';

describe('ListEmailsUseCase', () => {
  it('retourne les emails paginés', async () => {
    const email = new Email(
      ['client@test.com'],
      'Sujet',
      'Corps',
      EMAIL_STATUS.SENT,
      [],
      [],
      false,
      'test',
      null,
      null,
      new Date(),
      [],
      1,
      new Date(),
      new Date(),
    );

    const repository = createEmailRepositoryMock({
      findPaginated: vi.fn().mockResolvedValue({
        data: [email],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      }),
    });

    const useCase = new ListEmailsUseCase(repository);
    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.subject).toBe('Sujet');
    expect(result.meta.total).toBe(1);
  });
});
