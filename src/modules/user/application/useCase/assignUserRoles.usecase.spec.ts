import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { UserNameVO } from '../../domain/valueObject/username.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import type { IAuthRepository } from '../../../authentication/domain/repositories/auth.repository';
import { Auth } from '../../../authentication/domain/entities/user.entity';
import { AssignUserRolesUseCase } from './assignUserRoles.usecase';

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
  createPending: vi.fn().mockResolvedValue(new Auth(5, new EmailVO('jean@test.com'), null, [], 'pending')),
  assignRoles: vi.fn().mockResolvedValue(true),
} as unknown as IAuthRepository;

const sendAccountInvitation = {
  execute: vi.fn().mockResolvedValue(undefined),
};

describe('AssignUserRolesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crée un compte pending, envoie une invitation et assigne les rôles', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValueOnce(null);
    vi.mocked(userRepository.findById)
      .mockResolvedValueOnce(baseUser)
      .mockResolvedValueOnce(linkedUser);

    const useCase = new AssignUserRolesUseCase(
      userRepository,
      authRepository,
      sendAccountInvitation as never,
    );
    const result = await useCase.execute(1, [2]);

    expect(authRepository.createPending).toHaveBeenCalledWith('jean@test.com');
    expect(sendAccountInvitation.execute).toHaveBeenCalledWith({
      userId: 1,
      sourceModule: 'admin-role-assign',
    });
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

    const useCase = new AssignUserRolesUseCase(
      userRepository,
      authRepository,
      sendAccountInvitation as never,
    );

    await useCase.execute(1, [3]);

    expect(authRepository.createPending).not.toHaveBeenCalled();
    expect(authRepository.assignRoles).toHaveBeenCalledWith(5, [3]);
  });
});
