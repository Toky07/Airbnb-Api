import { describe, expect, it, vi, beforeEach } from 'vitest';
import { User } from '../../../domain/entities/user.entity';
import { CreateUserCommandHandler } from './CreateUserCommandHandler';
import { CreateUserCommand } from '../commands/CreateUserCommand';
import { SendAccountInvitationCommand } from '../../../../authentication/contracts';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import { UserNameVO } from '../../../domain/valueObject/username.vo';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import type { SaveUserAvatarService } from '../../services/save-user-avatar.service';
import { commandBusExecuteMock } from '../../../../../test/command-bus.mock';

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
} as unknown as SaveUserAvatarService;

describe('CreateUserCommandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    commandBusExecuteMock.mockResolvedValue(undefined);
  });

  it('should create user and send invitation', async () => {
    const handler = new CreateUserCommandHandler(repository, saveUserAvatar);

    const user = await handler.execute(
      new CreateUserCommand({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@test.com',
        phoneNumber: '+1234567890',
      }),
    );

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.email).toBe('test@test.com');
    expect(commandBusExecuteMock).toHaveBeenCalledTimes(1);
    expect(commandBusExecuteMock.mock.calls[0]?.[0]).toEqual(
      new SendAccountInvitationCommand({
        userId: 1,
        sourceModule: 'admin-user-create',
      }),
    );
  });
});
