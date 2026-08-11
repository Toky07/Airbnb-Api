import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserNameVO } from '../../../domain/valueObject/username.vo';
import { DeleteUserCommandHandler } from './DeleteUserCommandHandler';
import { DeleteUserCommand } from '../commands/DeleteUserCommand';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import type { IAuthRepository } from '../../../../authentication/contracts';
import { describe, expect, it, vi } from 'vitest';
import type { SaveUserAvatarService } from '../../services/save-user-avatar.service';

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
});
