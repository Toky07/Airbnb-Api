import { UserNameVO } from '../../../domain/valueObject/username.vo';
import { User } from '../../../domain/entities/user.entity';
import { EmailVO } from '../../../../../shared/valueObject/email.vo';
import { PhoneNumberVO } from '../../../../../shared/valueObject/phone.vo';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { UserOutput } from '../../../domain/dtos/user.output';
import { ListUserOptionsQueryHandler } from './ListUserOptionsQueryHandler';
import { ListUserOptionsQuery } from '../queries/ListUserOptionsQuery';

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
