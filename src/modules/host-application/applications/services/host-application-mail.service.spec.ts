import { describe, expect, it, vi } from 'vitest';
import { MailService } from '@src/modules/mail/contracts';
import { HOST_APPLICATION_STATUS } from '@src/modules/host-application/domain/constants/host-application-status.constant';
import { HostApplication } from '@src/modules/host-application/domain/entities/host-application.entity';
import { HostApplicationMailService } from './host-application-mail.service';

describe('HostApplicationMailService', () => {
  const applicant = {
    id: 10,
    firstName: 'Léa',
    lastName: 'Martin',
    email: 'lea@test.com',
    phoneNumber: '+33601020304',
  };

  const application = new HostApplication(
    10,
    'Paris',
    'Projet d’appartement.',
    HOST_APPLICATION_STATUS.PENDING,
    'Maison Léa',
    null,
    null,
    null,
    1,
  );

  it('emails the applicant and the notify address on submit', async () => {
    vi.stubEnv('HOST_APPLICATION_NOTIFY_EMAIL', 'ops@airbnb.dev');
    const sendSimple = vi.fn().mockResolvedValue({});
    const service = new HostApplicationMailService({
      sendSimple,
    } as unknown as MailService);

    await service.notifySubmitted(application, applicant as never);

    expect(sendSimple).toHaveBeenCalledTimes(2);
    expect(sendSimple.mock.calls[0][0].to).toBe('lea@test.com');
    expect(sendSimple.mock.calls[1][0].to).toBe('ops@airbnb.dev');
    vi.unstubAllEnvs();
  });

  it('skips the staff email when no notify address is configured', async () => {
    vi.stubEnv('HOST_APPLICATION_NOTIFY_EMAIL', '');
    vi.stubEnv('SUPPORT_EMAIL', '');
    const sendSimple = vi.fn().mockResolvedValue({});
    const service = new HostApplicationMailService({
      sendSimple,
    } as unknown as MailService);

    await service.notifySubmitted(application, applicant as never);

    expect(sendSimple).toHaveBeenCalledTimes(1);
    expect(sendSimple.mock.calls[0][0].to).toBe('lea@test.com');
    vi.unstubAllEnvs();
  });

  it('emails the applicant after a decision', async () => {
    const sendSimple = vi.fn().mockResolvedValue({});
    const service = new HostApplicationMailService({
      sendSimple,
    } as unknown as MailService);
    const approved = new HostApplication(
      10,
      'Paris',
      'Projet d’appartement.',
      HOST_APPLICATION_STATUS.APPROVED,
      'Maison Léa',
      'Bienvenue',
      1,
      new Date(),
      1,
    );

    await service.notifyReviewed(approved, applicant as never);

    expect(sendSimple).toHaveBeenCalledOnce();
    expect(sendSimple.mock.calls[0][0].subject).toMatch(/acceptée/);
  });
});
