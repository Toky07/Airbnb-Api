import { IUserRepository } from "../../domain/repositories/user.repository";
import { User } from "../../domain/entities/user.entity";
import { UserNameVO } from "../../domain/valueObject/username.vo";
import { EmailVO } from "../../../../shared/valueObject/email.vo";
import { CreateUserDto } from "../../domain/dtos/createUser.dto";

export class CreateUserUseCase {
    constructor(private readonly repository: IUserRepository) {}

    async execute(createUserDto: CreateUserDto): Promise<User> {
        const user = new User(
            new UserNameVO(createUserDto.firstName),
            new UserNameVO(createUserDto.lastName),
            new EmailVO(createUserDto.email),
            createUserDto.password,
        );
        
        return this.repository.create(user);
    }
}
