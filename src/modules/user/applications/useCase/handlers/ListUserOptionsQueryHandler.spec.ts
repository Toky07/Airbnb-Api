import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { User } from '@src/modules/user/domain/entities/user.entity';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import { ListUserOptionsQueryHandler } from './ListUserOptionsQueryHandler';
import { ListUserOptionsQuery } from '@src/modules/user/applications/useCase/queries/ListUserOptionsQuery';

describe('ListUserOptionsQueryHandler', () => {
  it('should list all users as options', async () => {
    const repository = {
      findAll: async () => [
        new User(
          new UserNameVO('John'),
          new UserNameVO('Doe'),
          new EmailVO('john.doe@example.com'),
          new PhoneNumberVO('+1234567890'),
          null,
          1,
        ),
      ],
    } as unknown as IUserRepository;

    const handler = new ListUserOptionsQueryHandler(repository);
    const result = await handler.execute(new ListUserOptionsQuery());

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(UserOutput);
    expect(result[0]?.email).toBe('john.doe@example.com');
  });
});
