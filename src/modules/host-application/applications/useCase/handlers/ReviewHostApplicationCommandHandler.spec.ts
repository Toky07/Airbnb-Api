import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/contracts';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import { ReviewHostApplicationCommand } from '@src/modules/host-application/applications/useCase/commands/ReviewHostApplicationCommand';
import { ReviewHostApplicationCommandHandler } from './ReviewHostApplicationCommandHandler';

describe('ReviewHostApplicationCommandHandler', () => {
  const pending = new HostApplication(
    10,
    'Paris',
    'Je souhaite proposer un appartement lumineux.',
    HOST_APPLICATION_STATUS.PENDING,
    'Maison Léa',
    null,
    null,
    null,
    7,
    new Date('2026-01-01'),
  );

  const applicant = {
    id: 10,
    authId: 3,
    firstName: 'Léa',
    lastName: 'Martin',
    email: 'lea@test.com',
    phoneNumber: '+33601020304',
    roles: [],
  };

  const hostApplicationRepository = {
    findById: vi.fn(),
    update: vi.fn(),
  };
  const userRepository = {
    findById: vi.fn(),
  };
  const ensureAuthHasRole = {
    execute: vi.fn(),
  };
  const mailService = {
    notifyReviewed: vi.fn(),
  };

  let handler: ReviewHostApplicationCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new ReviewHostApplicationCommandHandler(
      hostApplicationRepository as never,
      userRepository as never,
      ensureAuthHasRole as never,
      mailService as never,
    );
  });

  it('approves, assigns host role and emails the applicant', async () => {
    hostApplicationRepository.findById.mockResolvedValue(pending);
    userRepository.findById.mockResolvedValue(applicant);
    hostApplicationRepository.update.mockImplementation(
      async (application: HostApplication) => application,
    );
    ensureAuthHasRole.execute.mockResolvedValue(true);
    mailService.notifyReviewed.mockResolvedValue(undefined);

    const result = await handler.execute(
      new ReviewHostApplicationCommand(7, 1, {
        status: HOST_APPLICATION_STATUS.APPROVED,
        comment: 'Bienvenue',
      }),
    );

    expect(result.status).toBe(HOST_APPLICATION_STATUS.APPROVED);
    expect(ensureAuthHasRole.execute).toHaveBeenCalledWith(3, HOST_ROLE_SLUG);
    expect(mailService.notifyReviewed).toHaveBeenCalledOnce();
  });

  it('requires a comment when rejecting', async () => {
    hostApplicationRepository.findById.mockResolvedValue(pending);

    await expect(
      handler.execute(
        new ReviewHostApplicationCommand(7, 1, {
          status: HOST_APPLICATION_STATUS.REJECTED,
          comment: 'court',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(ensureAuthHasRole.execute).not.toHaveBeenCalled();
  });

  it('rejects a missing application', async () => {
    hostApplicationRepository.findById.mockResolvedValue(null);

    await expect(
      handler.execute(
        new ReviewHostApplicationCommand(99, 1, {
          status: HOST_APPLICATION_STATUS.APPROVED,
        }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a decision on a non-pending application', async () => {
    hostApplicationRepository.findById.mockResolvedValue(
      new HostApplication(
        10,
        'Paris',
        'message assez long pour le formulaire',
        HOST_APPLICATION_STATUS.APPROVED,
        null,
        null,
        null,
        null,
        7,
      ),
    );

    await expect(
      handler.execute(
        new ReviewHostApplicationCommand(7, 1, {
          status: HOST_APPLICATION_STATUS.REJECTED,
          comment: 'Dossier incomplet, merci de préciser le logement.',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
