import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { User } from '@src/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import type { IAuthRepository } from '@src/modules/authentication/contracts';
import { Auth } from '@src/modules/authentication/contracts';
import { AssignUserRolesCommandHandler } from './AssignUserRolesCommandHandler';
import { AssignUserRolesCommand } from '@src/modules/user/applications/useCase/commands/AssignUserRolesCommand';
import { SendAccountInvitationCommand } from '@src/modules/authentication/contracts';
import { commandBusExecuteMock } from '@src/test/command-bus.mock';

const baseUser = new User(
  new UserNameVO('Jean'),
  new UserNameVO('Dupont'),
  new EmailVO('jean@test.com'),
  new PhoneNumberVO('+33612345678'),
  '',
  1,
  new Date(),
  new Date(),
  null,
  [],
  false,
  'pending',
);

const linkedUser = new User(
  new UserNameVO('Jean'),
  new UserNameVO('Dupont'),
  new EmailVO('jean@test.com'),
  new PhoneNumberVO('+33612345678'),
  '',
  1,
  new Date(),
  new Date(),
  5,
  [],
  true,
  'pending',
);

const userRepository = {
  findById: vi.fn(),
  linkAuthAccount: vi.fn().mockResolvedValue(undefined),
} as unknown as IUserRepository;

const authRepository = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  createPending: vi
    .fn()
    .mockResolvedValue(
      new Auth(5, new EmailVO('jean@test.com'), null, [], 'pending'),
    ),
  assignRoles: vi.fn().mockResolvedValue(true),
} as unknown as IAuthRepository;

const roleRepository = {
  findById: vi.fn().mockResolvedValue({ slug: 'host' }),
} as never;

describe('AssignUserRolesCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue(undefined);
  });

  it('crée un compte pending, envoie une invitation et assigne les rôles', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(userRepository.findById)
      .mockResolvedValueOnce(baseUser)
      .mockResolvedValueOnce(linkedUser);

    const handler = new AssignUserRolesCommandHandler(
      userRepository,
      authRepository,
      roleRepository,
    );
    const result = await handler.execute(new AssignUserRolesCommand(1, [2]));

    expect(authRepository.createPending).toHaveBeenCalledWith('jean@test.com');
    expect(commandBusExecuteMock).toHaveBeenCalledWith(
      new SendAccountInvitationCommand({
        userId: 1,
        sourceModule: 'admin-role-assign',
      }),
    );
    expect(authRepository.assignRoles).toHaveBeenCalledWith(5, [2]);
    expect(result.email).toBe('jean@test.com');
  });

  it('assigne les rôles sur un compte auth existant', async () => {
    vi.mocked(authRepository.findById).mockResolvedValueOnce(
      new Auth(5, new EmailVO('jean@test.com'), null, [], 'pending'),
    );
    vi.mocked(userRepository.findById)
      .mockResolvedValueOnce(linkedUser)
      .mockResolvedValueOnce(linkedUser);

    const handler = new AssignUserRolesCommandHandler(
      userRepository,
      authRepository,
      roleRepository,
    );

    await handler.execute(new AssignUserRolesCommand(1, [3]));

    expect(authRepository.createPending).not.toHaveBeenCalled();
    expect(authRepository.assignRoles).toHaveBeenCalledWith(5, [3]);
  });
});
