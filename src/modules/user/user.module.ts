import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/useCase/createuser.usecase';
import { DeleteUserUseCase } from './application/useCase/deleteUser.usecase';
import { FindUserUseCase } from './application/useCase/findUser.usecase';
import { ListUsersUseCase } from './application/useCase/listeUser.usecase';
import { UpdateUserUseCase } from './application/useCase/updateUser.usecase';
import { UserController } from './interfaces/http/user.controller';
import { USER_REPOSITORY, UserRepository } from './infrastructure/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    ListUsersUseCase,
    FindUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UserRepository,
    {
        provide: USER_REPOSITORY,
        useClass: UserRepository,
    }
  ],
})
export class UserModule {}
