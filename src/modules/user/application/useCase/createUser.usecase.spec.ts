import { User } from "../../domain/entities/user.entity";
import { CreateUserUseCase } from "./createuser.usecase";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { UserOutput } from "../../domain/dtos/user.output";
import { SaveUserAvatarUseCase } from "./saveUserAvatar.usecase";

const repository = {
    create: async (user: User): Promise<User> => {
        return new User(
            user._firstName,
            user._lastName,
            user._email,
            user._phoneNumber,
            user.avatar,
            1,
        );
    },
    update: async (user: User): Promise<User> => user,
} as IUserRepository;

const saveUserAvatar = {
    resolve: async () => 'uploads/users/1/avatar.jpg',
    deleteStored: async () => undefined,
} as SaveUserAvatarUseCase;

describe('UseCase: create user use case', () => {
  it('should create user', async () => {
    const createUserUseCase = new CreateUserUseCase(repository, saveUserAvatar);
    
    const user = await createUserUseCase.execute({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.com',
      phoneNumber: '+1234567890',
    });

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.email).toBe('test@test.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.phoneNumber).toBe('+1234567890');
    expect(user.avatar).toBe('uploads/users/1/avatar.jpg');
  });      
});