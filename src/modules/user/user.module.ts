import { Module } from '@nestjs/common';
import { AuthModule } from '../authentication/auth.module';
import { AssignUserRolesUseCase } from './application/useCase/assignUserRoles.usecase';
import { CreateUserUseCase } from './application/useCase/createuser.usecase';
import { DeleteUserUseCase } from './application/useCase/deleteUser.usecase';
import { FindUserUseCase } from './application/useCase/findUser.usecase';
import { ListUsersUseCase } from './application/useCase/listeUser.usecase';
import { ListUserOptionsUseCase } from './application/useCase/listUserOptions.usecase';
import { UpdateUserUseCase } from './application/useCase/updateUser.usecase';
import { SaveUserAvatarUseCase } from './application/useCase/saveUserAvatar.usecase';
import { UserController } from './interfaces/http/user.controller';
import { USER_REPOSITORY, UserRepository } from './infrastructure/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';
import { AuthEntity } from '../authentication/infrastructure/entity/auth.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthEntity]),
    MediaModule,
    AuthModule,
  ],
  controllers: [UserController],
  providers: [
    AssignUserRolesUseCase,
    ListUsersUseCase,
    ListUserOptionsUseCase,
    FindUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    SaveUserAvatarUseCase,
    UserRepository,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY, CreateUserUseCase, SaveUserAvatarUseCase],
})
export class UserModule {}
