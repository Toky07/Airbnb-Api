import { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UpdateUserDto } from "../../domain/dtos/createUser.dto";

export class UpdateUserUseCase {
    constructor(private readonly repository: IUserRepository) {}

    async execute(updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.repository.findById(updateUserDto.id);

        if (!user) {
            throw new Error('User not found');
        }

        user.firstName = updateUserDto.firstName;
        user.lastName = updateUserDto.lastName;
        user.email = updateUserDto.email;

        return this.repository.update(user);
    }
}