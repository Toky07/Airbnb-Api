import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { HOST_ROLE_SLUG } from '@src/modules/authentication/contracts';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import { SubmitHostApplicationCommand } from '@src/modules/host-application/applications/useCase/commands/SubmitHostApplicationCommand';
import { SubmitHostApplicationCommandHandler } from './SubmitHostApplicationCommandHandler';

describe('SubmitHostApplicationCommandHandler', () => {
  const hostApplicationRepository = {
    findPendingByUserId: vi.fn(),
    create: vi.fn(),
  };
  const userRepository = {};
  const resolveAuthenticatedUser = {
    resolveUser: vi.fn(),
  };
  const mailService = {
    notifySubmitted: vi.fn(),
  };

  const traveler = {
    id: 10,
    authId: 3,
    firstName: 'Léa',
    lastName: 'Martin',
    email: 'lea@test.com',
    phoneNumber: '+33601020304',
    roles: [{ slug: 'traveler', name: 'Voyageur' }],
  };

  let handler: SubmitHostApplicationCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new SubmitHostApplicationCommandHandler(
      hostApplicationRepository as never,
      userRepository as never,
      resolveAuthenticatedUser as never,
      mailService as never,
    );
  });

  it('creates a pending application and notifies by email', async () => {
    resolveAuthenticatedUser.resolveUser.mockResolvedValue(traveler);
    hostApplicationRepository.findPendingByUserId.mockResolvedValue(null);
    hostApplicationRepository.create.mockImplementation(
      async (application: HostApplication) =>
        new HostApplication(
          application.userId,
          application.city,
          application.message,
          application.status,
          application.propertyName,
          null,
          null,
          null,
          1,
          new Date(),
        ),
    );
    mailService.notifySubmitted.mockResolvedValue(undefined);

    const result = await handler.execute(
      new SubmitHostApplicationCommand(3, {
        city: ' Paris ',
        message: 'Je souhaite proposer un appartement lumineux dans le 11e.',
        propertyName: ' Maison Léa ',
      }),
    );

    expect(result.status).toBe(HOST_APPLICATION_STATUS.PENDING);
    expect(result.city).toBe('Paris');
    expect(result.propertyName).toBe('Maison Léa');
    expect(mailService.notifySubmitted).toHaveBeenCalledOnce();
  });

  it('rejects users who are already hosts', async () => {
    resolveAuthenticatedUser.resolveUser.mockResolvedValue({
      ...traveler,
      roles: [{ slug: HOST_ROLE_SLUG, name: 'Hôte' }],
    });

    await expect(
      handler.execute(
        new SubmitHostApplicationCommand(3, {
          city: 'Paris',
          message: 'Je souhaite proposer un appartement lumineux dans le 11e.',
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects a second pending application', async () => {
    resolveAuthenticatedUser.resolveUser.mockResolvedValue(traveler);
    hostApplicationRepository.findPendingByUserId.mockResolvedValue(
      new HostApplication(
        10,
        'Lyon',
        'message',
        HOST_APPLICATION_STATUS.PENDING,
        null,
        null,
        null,
        null,
        4,
      ),
    );

    await expect(
      handler.execute(
        new SubmitHostApplicationCommand(3, {
          city: 'Paris',
          message: 'Je souhaite proposer un appartement lumineux dans le 11e.',
        }),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a blank city', async () => {
    resolveAuthenticatedUser.resolveUser.mockResolvedValue(traveler);
    hostApplicationRepository.findPendingByUserId.mockResolvedValue(null);

    await expect(
      handler.execute(
        new SubmitHostApplicationCommand(3, {
          city: '   ',
          message: 'Je souhaite proposer un appartement lumineux dans le 11e.',
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
