import { User } from "../../domain/entities/user.entity";
import { CreateUserUseCase } from "./createuser.usecase";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { UserOutput } from "../../domain/dtos/user.output";

const repository = {
    create: async (user: User): Promise<User> => {
        return user;
    }
} as IUserRepository;

describe('UseCase: create user use case', () => {
  it('should create user', async () => {
    const createUserUseCase = new CreateUserUseCase(repository);
    const user = await createUserUseCase.execute({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      password: 'password',
    });

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.email).toBe('test@test.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
  });      
});