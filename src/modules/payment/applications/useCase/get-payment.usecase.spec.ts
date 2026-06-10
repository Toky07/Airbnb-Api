import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '../../../user/domain/entities/user.entity';
import { UserNameVO } from '../../../user/domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import type { IUserRepository } from '../../../user/domain/repositories/user.repository';
import { GetPaymentUseCase } from './get-payment.usecase';
import {
  createPaymentRepositoryMock,
  createSamplePayment,
} from './payment-test.helpers';

describe('GetPaymentUseCase', () => {
  it('retourne un paiement pour un administrateur', async () => {
    const payment = createSamplePayment({ id: 7, userId: 2 });
    const repository = createPaymentRepositoryMock({
      findById: vi.fn().mockResolvedValue(payment),
    });

    const useCase = new GetPaymentUseCase(
      repository,
      { findByAuthId: vi.fn() } as unknown as IUserRepository,
    );

    const result = await useCase.execute(7, {
      authId: 1,
      canReadAll: true,
    });

    expect(result.id).toBe(7);
    expect(result.transactionId).toBe('pi_test_123');
  });

  it('autorise le propriétaire du paiement', async () => {
    const payment = createSamplePayment({ id: 7, userId: 5 });
    const repository = createPaymentRepositoryMock({
      findById: vi.fn().mockResolvedValue(payment),
    });
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(
        new User(
          new UserNameVO('Jean'),
          new UserNameVO('Dupont'),
          new EmailVO('jean@test.com'),
          new PhoneNumberVO('+33601020304'),
          '',
          5,
          undefined,
          undefined,
          10,
        ),
      ),
    } as unknown as IUserRepository;

    const useCase = new GetPaymentUseCase(repository, userRepository);
    const result = await useCase.execute(7, {
      authId: 10,
      canReadAll: false,
    });

    expect(result.userId).toBe(5);
  });

  it('refuse l’accès à un autre utilisateur', async () => {
    const payment = createSamplePayment({ id: 7, userId: 5 });
    const repository = createPaymentRepositoryMock({
      findById: vi.fn().mockResolvedValue(payment),
    });
    const userRepository = {
      findByAuthId: vi.fn().mockResolvedValue(
        new User(
          new UserNameVO('Alice'),
          new UserNameVO('Martin'),
          new EmailVO('alice@test.com'),
          new PhoneNumberVO('+33601020304'),
          '',
          6,
          undefined,
          undefined,
          11,
        ),
      ),
    } as unknown as IUserRepository;

    const useCase = new GetPaymentUseCase(repository, userRepository);

    await expect(
      useCase.execute(7, { authId: 11, canReadAll: false }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lève une erreur si le paiement est introuvable', async () => {
    const useCase = new GetPaymentUseCase(
      createPaymentRepositoryMock({
        findById: vi.fn().mockResolvedValue(null),
      }),
      { findByAuthId: vi.fn() } as unknown as IUserRepository,
    );

    await expect(
      useCase.execute(99, { authId: 1, canReadAll: true }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
