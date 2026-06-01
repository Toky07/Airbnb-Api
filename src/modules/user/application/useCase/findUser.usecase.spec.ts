import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { User } from "../../domain/entities/user.entity";
import { FindUserUseCase } from "./findUser.usecase";
import { UserOutput } from "../../domain/dtos/user.output";
import { NotFoundException } from "@nestjs/common";
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";

const repository = {
    findById: async (id: number): Promise<User|null> => {
        return new User(
            new UserNameVO('John'),
            new UserNameVO('Doe'),
            new EmailVO('john.doe@example.com'),
            new PhoneNumberVO('+1234567890'),
            'avatar.png',
            1,
        );
    }
} as IUserRepository;

describe.only('UseCase: find user use case', () => {
  it('should find user', async () => {
    const findUserUseCase = new FindUserUseCase(repository);
    const user = await findUserUseCase.execute(1);

    expect(user).toBeInstanceOf(UserOutput);
    expect(user.id).toBe(1);
    expect(user.email).toBe('john.doe@example.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.phoneNumber).toBe('+1234567890');
  });

  it('should throw an error if the user is not found', async () => {
    const findUserUseCase = new FindUserUseCase(repository);

    vi.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(findUserUseCase.execute(2)).rejects.toThrow(new NotFoundException('User not found'));
  });
});
