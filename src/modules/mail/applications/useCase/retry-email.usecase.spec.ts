import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EMAIL_STATUS } from '../../domain/constants/email-status.constant';
import { Email } from '../../domain/entities/email.entity';
import { RetryEmailUseCase } from './retry-email.usecase';
import {
  createEmailRepositoryMock,
  createMailTransportMock,
} from './email-test.helpers';

describe('RetryEmailUseCase', () => {
  it('relance un envoi échoué avec succès', async () => {
    const existing = new Email(
      ['client@test.com'],
      'Sujet',
      'Corps',
      EMAIL_STATUS.FAILED,
      [],
      [],
      false,
      'test',
      null,
      'SMTP down',
      null,
      [],
      5,
      new Date(),
      new Date(),
    );

    const transport = createMailTransportMock();
    const repository = createEmailRepositoryMock({
      findById: vi.fn().mockResolvedValue(existing),
    });

    const useCase = new RetryEmailUseCase(repository, transport);
    const result = await useCase.execute(5);

    expect(result.status).toBe(EMAIL_STATUS.SENT);
    expect(transport.send).toHaveBeenCalledTimes(1);
  });

  it('lève une erreur si l’email est introuvable', async () => {
    const repository = createEmailRepositoryMock({
      findById: vi.fn().mockResolvedValue(null),
    });

    const useCase = new RetryEmailUseCase(repository, createMailTransportMock());

    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
