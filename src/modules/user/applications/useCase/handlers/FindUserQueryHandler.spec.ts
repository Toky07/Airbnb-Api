import { EmailVO } from '@src/shared/valueObject/email.vo';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { User } from '@src/modules/user/domain/entities/user.entity';
import { FindUserQueryHandler } from './FindUserQueryHandler';
import { FindUserQuery } from '@src/modules/user/applications/useCase/queries/FindUserQuery';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import { NotFoundException } from '@nestjs/common';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';

const repository = {
  findById: async (): Promise<User | null> =>
    new User(
      new UserNameVO('John'),
      new UserNameVO('Doe'),
      new EmailVO('john.doe@example.com'),
      new PhoneNumberVO('+1234567890'),
      'avatar.png',
      1,
    ),
} as IUserRepository;

describe('FindUserQueryHandler', () => {
  it('should find user', async () => {
    const handler = new FindUserQueryHandler(repository);
    const user = await handler.execute(new FindUserQuery(1));

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.id).toBe(1);
    expect(user.email).toBe('john.doe@example.com');
  });

  it('should throw an error if the user is not found', async () => {
    const handler = new FindUserQueryHandler(repository);

    vi.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(handler.execute(new FindUserQuery(2))).rejects.toThrow(
      new NotFoundException('User not found'),
    );
  });
});
