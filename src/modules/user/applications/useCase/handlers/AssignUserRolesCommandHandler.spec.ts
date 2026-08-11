import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { UserNameVO } from '../../../domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import type { IAuthRepository } from '../../../../authentication/contracts';
import { Auth } from '../../../../authentication/contracts';
import { AssignUserRolesCommandHandler } from './AssignUserRolesCommandHandler';
import { AssignUserRolesCommand } from '../commands/AssignUserRolesCommand';
import { SendAccountInvitationCommand } from '../../../../authentication/contracts';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

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
    );

    await handler.execute(new AssignUserRolesCommand(1, [3]));

    expect(authRepository.createPending).not.toHaveBeenCalled();
    expect(authRepository.assignRoles).toHaveBeenCalledWith(5, [3]);
  });
});
