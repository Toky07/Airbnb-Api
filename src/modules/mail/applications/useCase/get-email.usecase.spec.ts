import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import { GetEmailUseCase } from './get-email.usecase';
import { createEmailRepositoryMock } from './email-test.helpers';

describe('GetEmailUseCase', () => {
  it('retourne un email existant', async () => {
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
      42,
      new Date(),
      new Date(),
    );

    const repository = createEmailRepositoryMock({
      findById: vi.fn().mockResolvedValue(email),
    });

    const useCase = new GetEmailUseCase(repository);
    const result = await useCase.execute(42);

    expect(result.id).toBe(42);
    expect(result.subject).toBe('Sujet');
  });

  it('lève une erreur si l’email est introuvable', async () => {
    const repository = createEmailRepositoryMock({
      findById: vi.fn().mockResolvedValue(null),
    });

    const useCase = new GetEmailUseCase(repository);

    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
