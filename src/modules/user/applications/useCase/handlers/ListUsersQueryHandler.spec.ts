import { UserNameVO } from '@src/modules/user/domain/valueObject/username.vo';
import { User } from '@src/modules/user/domain/entities/user.entity';
import { EmailVO } from '@src/shared/valueObject/email.vo';
import type { IUserRepository } from '@src/modules/user/domain/repositories/user.repository';
import { ListUsersQueryHandler } from './ListUsersQueryHandler';
import { ListUsersQuery } from '@src/modules/user/applications/useCase/queries/ListUsersQuery';
import { UserOutput } from '@src/modules/user/domain/dtos/user.output';
import { PhoneNumberVO } from '@src/shared/valueObject/phone.vo';
import { buildPaginationMeta } from '@src/shared/pagination/pagination.types';

const repository = {
  findPaginated: async () => ({
    data: [
      new User(
        new UserNameVO('John'),
        new UserNameVO('Doe'),
        new EmailVO('john.doe@example.com'),
        new PhoneNumberVO('+1234567890'),
        'avatar.png',
        1,
        new Date(),
        new Date(),
      ),
    ],
    meta: buildPaginationMeta(1, 1, 10),
  }),
} as unknown as IUserRepository;

describe('ListUsersQueryHandler', () => {
  it('should list users', async () => {
    const handler = new ListUsersQueryHandler(repository);

    const result = await handler.execute(
      new ListUsersQuery({ page: 1, limit: 10 }),
    );

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(UserOutput);
    expect(result.meta.total).toBe(1);
  });
});
