import { UserNameVO } from "../../domain/valueObject/username.vo";
import { User } from "../../domain/entities/user.entity";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { ListUsersUseCase } from "./listeUser.usecase";

const repository = {
    findAll: async (): Promise<User[]> => {
        return [
            new User(
                new UserNameVO('John'),
                new UserNameVO('Doe'),
                new EmailVO('john.doe@example.com'),
                'password',
            ),
        ];
    },
} as IUserRepository;

describe('UseCase: list users use case', () => {
  it('should list users', async () => {
    const listUsersUseCase = new ListUsersUseCase(repository);

    const users = await listUsersUseCase.execute();
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBe(1);
    expect(users[0]).toBeInstanceOf(User);
  });
});