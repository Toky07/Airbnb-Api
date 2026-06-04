import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/useCase/createuser.usecase';
import { DeleteUserUseCase } from './application/useCase/deleteUser.usecase';
import { FindUserUseCase } from './application/useCase/findUser.usecase';
import { ListUsersUseCase } from './application/useCase/listeUser.usecase';
import { UpdateUserUseCase } from './application/useCase/updateUser.usecase';
import { SaveUserAvatarUseCase } from './application/useCase/saveUserAvatar.usecase';
import { UserController } from './interfaces/http/user.controller';
import { USER_REPOSITORY, UserRepository } from './infrastructure/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MediaModule],
  controllers: [UserController],
  providers: [
    ListUsersUseCase,
    FindUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    SaveUserAvatarUseCase,
    UserRepository,
    {
        provide: USER_REPOSITORY,
        useClass: UserRepository,
    }
  ],
})
export class UserModule {}
