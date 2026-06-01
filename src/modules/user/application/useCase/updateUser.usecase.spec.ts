import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { UserMapper } from "../../infrastructure/mappers/user.mapper";
import { UpdateUserUseCase } from "./updateUser.usecase";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { UserOutput } from "../../domain/dtos/user.output";
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";

describe('UseCase: update user use case', () => {
    const repository = {
        findById: async (id: number): Promise<User> => {
            return UserMapper.toDomain({
                id: '1',
                firstName: 'Test',
                lastName: 'Test',
                email: 'test@test.com',
                phoneNumber: '+1234567890',
            });
        },
        update: async (user: User): Promise<User> => {
            return new User(
                new UserNameVO(user.firstName),
                new UserNameVO(user.lastName),
                new EmailVO(user.email),
                new PhoneNumberVO(user.phoneNumber),
            );
        }
    } as IUserRepository;

  it('should update user', async () => {
    const updateUserUseCase = new UpdateUserUseCase(repository);

    const user = await updateUserUseCase.execute({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'update@test.com',
      phoneNumber: '+1234567890',
    });

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.email).toBe('update@test.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
  });

  it ('should throw an error if the user is not found', async () => {
    const updateUserUseCase = new UpdateUserUseCase(repository);

    vi.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(updateUserUseCase.execute({
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
      email: 'update@test.com',
      phoneNumber: '+1234567890',
    })).rejects.toThrow(new Error('User not found'));
  });
});