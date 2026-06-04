import { describe, expect, it, vi } from 'vitest';
import { User } from '../../domain/entities/user.entity';
import { CreateUserUseCase } from './createuser.usecase';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { UserOutput } from '../../domain/dtos/user.output';
import { SaveUserAvatarUseCase } from './saveUserAvatar.usecase';
import { UserNameVO } from '../../domain/valueObject/username.vo';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';

const createdUser = new User(
  new UserNameVO('John'),
  new UserNameVO('Doe'),
  new EmailVO('test@test.com'),
  new PhoneNumberVO('+1234567890'),
  'uploads/users/1/avatar.jpg',
  1,
);

const repository = {
  create: vi.fn().mockResolvedValue(createdUser),
  update: vi.fn().mockImplementation(async (user: User) => user),
  findById: vi.fn().mockResolvedValue(createdUser),
} as unknown as IUserRepository;

const saveUserAvatar = {
  resolve: vi.fn().mockResolvedValue('uploads/users/1/avatar.jpg'),
  deleteStored: vi.fn(),
} as unknown as SaveUserAvatarUseCase;

const sendAccountInvitation = {
  execute: vi.fn().mockResolvedValue(undefined),
};

describe('UseCase: create user use case', () => {
  it('should create user and send invitation', async () => {
    const createUserUseCase = new CreateUserUseCase(
      repository,
      saveUserAvatar,
      sendAccountInvitation as never,
    );

    const user = await createUserUseCase.execute({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
    });

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.email).toBe('test@test.com');
    expect(sendAccountInvitation.execute).toHaveBeenCalledWith({
      userId: 1,
      sourceModule: 'admin-user-create',
    });
  });
});
