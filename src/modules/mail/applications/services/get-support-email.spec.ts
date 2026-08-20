import { describe, expect, it } from 'vitest';
import { getSupportEmail } from './get-support-email';

describe('getSupportEmail', () => {
  it('privilégie SUPPORT_EMAIL', () => {
    expect(
      getSupportEmail({
        SUPPORT_EMAIL: 'support@airbnb.dev',
        HOST_APPLICATION_NOTIFY_EMAIL: 'ops@airbnb.dev',
      }),
    ).toBe('support@airbnb.dev');
  });

  it('retombe sur HOST_APPLICATION_NOTIFY_EMAIL', () => {
    expect(
      getSupportEmail({
        HOST_APPLICATION_NOTIFY_EMAIL: 'ops@airbnb.dev',
      }),
    ).toBe('ops@airbnb.dev');
  });
});
