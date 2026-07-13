import { NotFoundException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserMapper } from '../../../infrastructure/mappers/user.mapper';
import { UpdateUserCommandHandler } from './UpdateUserCommandHandler';
import { UpdateUserCommand } from '../commands/UpdateUserCommand';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { UserOutput } from '../../../domain/dtos/user.output';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import { UserNameVO } from '../../../domain/valueObject/username.vo';
import type { SaveUserAvatarService } from '../../services/save-user-avatar.service';

const saveUserAvatar = {
  resolve: async (_userId: number, current: string) => current,
  deleteStored: async () => undefined,
} as SaveUserAvatarService;

describe('UpdateUserCommandHandler', () => {
  const repository = {
    findById: async (): Promise<User> =>
      UserMapper.toDomain({
        id: '1',
        firstName: 'Test',
        lastName: 'Test',
        email: 'test@test.com',
        phoneNumber: '+1234567890',
        avatar: 'uploads/users/1/old.jpg',
      }),
    update: async (user: User): Promise<User> =>
      new User(
        new UserNameVO(user.firstName),
        new UserNameVO(user.lastName),
        new EmailVO(user.email),
        new PhoneNumberVO(user.phoneNumber),
        user.avatar,
      ),
  } as IUserRepository;

  it('should update user', async () => {
    const handler = new UpdateUserCommandHandler(repository, saveUserAvatar);

    const user = await handler.execute(
      new UpdateUserCommand({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'update@test.com',
        phoneNumber: '+1234567890',
      }),
    );

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.email).toBe('update@test.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
  });

  it('should throw an error if the user is not found', async () => {
    const handler = new UpdateUserCommandHandler(repository, saveUserAvatar);

    vi.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateUserCommand({
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'update@test.com',
          phoneNumber: '+1234567890',
        }),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
