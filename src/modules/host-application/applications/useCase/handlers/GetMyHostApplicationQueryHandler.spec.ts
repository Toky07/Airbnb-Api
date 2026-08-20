import { describe, expect, it, vi } from 'vitest';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import { GetMyHostApplicationQuery } from '@src/modules/host-application/applications/useCase/queries/GetMyHostApplicationQuery';
import { GetMyHostApplicationQueryHandler } from './GetMyHostApplicationQueryHandler';

describe('GetMyHostApplicationQueryHandler', () => {
  it('returns the latest application', async () => {
    const application = new HostApplication(
      10,
      'Paris',
      'Je souhaite proposer un appartement lumineux.',
      HOST_APPLICATION_STATUS.PENDING,
      null,
      null,
      null,
      null,
      2,
      new Date(),
    );
    const user = {
      id: 10,
      firstName: 'Léa',
      lastName: 'Martin',
      email: 'lea@test.com',
      phoneNumber: '+33601020304',
    };
    const handler = new GetMyHostApplicationQueryHandler(
      {
        findLatestByUserId: vi.fn().mockResolvedValue(application),
      } as never,
      { resolveUser: vi.fn().mockResolvedValue(user) } as never,
    );

    const result = await handler.execute(new GetMyHostApplicationQuery(3));

    expect(result?.id).toBe(2);
    expect(result?.applicant?.email).toBe('lea@test.com');
  });

  it('returns null when the user has never applied', async () => {
    const handler = new GetMyHostApplicationQueryHandler(
      {
        findLatestByUserId: vi.fn().mockResolvedValue(null),
      } as never,
      {
        resolveUser: vi.fn().mockResolvedValue({ id: 10 }),
      } as never,
    );

    await expect(
      handler.execute(new GetMyHostApplicationQuery(3)),
    ).resolves.toBeNull();
  });
});
