import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../authentication/auth.module';
import { AccountActivationModule } from '../account-activation/account-activation.module';
import { AssignUserRolesUseCase } from './application/useCase/assignUserRoles.usecase';
import { RegisterHostUseCase } from './application/useCase/register-host.usecase';
import { CreateUserUseCase } from './application/useCase/createuser.usecase';
import { DeleteUserUseCase } from './application/useCase/deleteUser.usecase';
import { FindUserUseCase } from './application/useCase/findUser.usecase';
import { ListUsersUseCase } from './application/useCase/listeUser.usecase';
import { ListUserOptionsUseCase } from './application/useCase/listUserOptions.usecase';
import { UpdateUserUseCase } from './application/useCase/updateUser.usecase';
import { UpdateMyProfileUseCase } from './application/useCase/update-my-profile.usecase';
import { SaveUserAvatarUseCase } from './application/useCase/saveUserAvatar.usecase';
import { UserController } from './interfaces/http/user.controller';
import { USER_REPOSITORY, UserRepository } from './infrastructure/repositories/user.repository';
import { cartUserProvider } from './infrastructure/adapters/cart-user.adapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/entities/user.entity';
import { AuthEntity } from '../authentication/infrastructure/entity/auth.entity';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthEntity]),
    MediaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => AccountActivationModule),
  ],
  controllers: [UserController],
  providers: [
    AssignUserRolesUseCase,
    RegisterHostUseCase,
    ListUsersUseCase,
    ListUserOptionsUseCase,
    FindUserUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UpdateMyProfileUseCase,
    DeleteUserUseCase,
    SaveUserAvatarUseCase,
    UserRepository,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    cartUserProvider,
  ],
  exports: [
    USER_REPOSITORY,
    cartUserProvider,
    CreateUserUseCase,
    SaveUserAvatarUseCase,
    RegisterHostUseCase,
    UpdateMyProfileUseCase,
  ],
})
export class UserModule {}
