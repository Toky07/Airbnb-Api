import { UserNameVO } from '../../domain/valueObject/username.vo';
import { User } from '../../domain/entities/user.entity';
import { EmailVO } from '../../../../shared/valueObject/email.vo';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { ListUsersUseCase } from './listeUser.usecase';
import { UserOutput } from '../../domain/dtos/user.output';
import { PhoneNumberVO } from '../../../../shared/valueObject/phone.vo';
import { buildPaginationMeta } from '../../../../shared/pagination/pagination.types';

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

describe('UseCase: list users use case', () => {
  it('should list users', async () => {
    const listUsersUseCase = new ListUsersUseCase(repository);

    const result = await listUsersUseCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toBeInstanceOf(UserOutput);
    expect(result.meta.total).toBe(1);
  });
});
