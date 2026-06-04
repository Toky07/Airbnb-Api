import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { DeleteUserUseCase } from "./deleteUser.usecase";
import { SaveUserAvatarUseCase } from "./saveUserAvatar.usecase";
import { PhoneNumberVO } from "../../../../shared/valueObject/phone.vo";

const repository = {
    findById: async () =>
        new User(
            new UserNameVO('John'),
            new UserNameVO('Doe'),
            new EmailVO('test@test.com'),
            new PhoneNumberVO('+1234567890'),
            'uploads/users/1/avatar.jpg',
            1,
        ),
    delete: async () => true,
} as IUserRepository;

const saveUserAvatar = {
    resolve: async () => '',
    deleteStored: async () => undefined,
} as SaveUserAvatarUseCase;

describe('UseCase: delete user use case', () => {
  it('should delete user', async () => {
    const deleteUserUseCase = new DeleteUserUseCase(repository, saveUserAvatar);

    const response = await deleteUserUseCase.execute(1);

    expect(response).toBe(true);
  });
});
