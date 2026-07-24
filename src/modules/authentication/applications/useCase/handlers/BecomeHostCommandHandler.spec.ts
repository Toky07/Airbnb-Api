import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { BecomeHostCommandHandler } from './BecomeHostCommandHandler';
import { BecomeHostCommand } from '../commands/BecomeHostCommand';
import { HOST_ROLE_SLUG } from '../../../domain/constants/permissions.constant';

describe('BecomeHostCommandHandler', () => {
  const ensureAuthHasRole = {
    execute: vi.fn(),
  };
  const tokenGenerator = {
    generate: vi.fn(),
    generateForAuthId: vi.fn(),
  };

  let handler: BecomeHostCommandHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new BecomeHostCommandHandler(
      ensureAuthHasRole as never,
      tokenGenerator,
    );
  });

  it('assigns host role and returns a refreshed token', async () => {
    ensureAuthHasRole.execute.mockResolvedValue(true);
    tokenGenerator.generateForAuthId.mockResolvedValue('new-jwt');

    const token = await handler.execute(new BecomeHostCommand(42));

    expect(ensureAuthHasRole.execute).toHaveBeenCalledWith(42, HOST_ROLE_SLUG);
    expect(tokenGenerator.generateForAuthId).toHaveBeenCalledWith(42);
    expect(token).toBe('new-jwt');
  });

  it('still returns a token when the user is already a host', async () => {
    ensureAuthHasRole.execute.mockResolvedValue(false);
    tokenGenerator.generateForAuthId.mockResolvedValue('same-jwt');

    const token = await handler.execute(new BecomeHostCommand(42));

    expect(token).toBe('same-jwt');
  });

  it('rejects missing auth id', async () => {
    await expect(
      handler.execute(new BecomeHostCommand(0)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
