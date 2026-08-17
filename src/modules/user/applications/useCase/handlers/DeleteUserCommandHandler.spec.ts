import { EmailVO } from '@src/shared/valueObject/email.vo';
import { User } from '@src/modules/user/domain/entities/user.entity';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { DeleteUserCommandHandler } from './DeleteUserCommandHandler';
import { DeleteUserCommand } from '@src/modules/user/applications/useCase/commands/DeleteUserCommand';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import type { IAuthRepository } from '@src/modules/authentication/contracts';
import { describe, expect, it, vi } from 'vitest';
import type { SaveUserAvatarService } from '@src/modules/user/applications/services/save-user-avatar.service';

const repository = {
  findById: async () =>
    new User(
      new UserNameVO('John'),
      new UserNameVO('Doe'),
      new EmailVO('test@test.com'),
      new PhoneNumberVO('+1234567890'),
      'uploads/users/1/avatar.jpg',
      1,
      undefined,
      undefined,
      10,
    ),
  delete: async () => true,
} as IUserRepository;

const authRepository = {
  findByEmail: async () => null,
  findById: async () => null,
  countWithRoleSlug: async () => 0,
  delete: async () => true,
} as IAuthRepository;

const saveUserAvatar = {
  resolve: async () => '',
  deleteStored: async () => undefined,
} as SaveUserAvatarService;

describe('DeleteUserCommandHandler', () => {
  it('should delete user', async () => {
    const handler = new DeleteUserCommandHandler(
      repository,
      authRepository,
      saveUserAvatar,
    );

    const response = await handler.execute(new DeleteUserCommand(1));

    expect(response).toBe(true);
  });

  it('should delete linked auth credentials', async () => {
    const deleteAuth = vi.fn(async () => true);
    const handler = new DeleteUserCommandHandler(
      repository,
      { ...authRepository, delete: deleteAuth },
      saveUserAvatar,
    );

    await handler.execute(new DeleteUserCommand(1));

    expect(deleteAuth).toHaveBeenCalledWith(10);
  });

  it('refuses to delete the last superadmin', async () => {
    const handler = new DeleteUserCommandHandler(
      repository,
      {
        ...authRepository,
        findById: async () =>
          ({
            id: 10,
            roles: [{ slug: 'superadmin' }],
          }) as never,
        countWithRoleSlug: async () => 1,
      },
      saveUserAvatar,
    );

    await expect(handler.execute(new DeleteUserCommand(1))).rejects.toThrow(
      'Impossible de supprimer le dernier super administrateur.',
    );
  });
});
