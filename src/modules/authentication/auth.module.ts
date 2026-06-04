import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './infrastructure/entity/auth.entity';
import { AuthController } from './interfaces/http/auth.controller';
import { CreateCredentialsUseCase } from './useCase/create-credentials.usecase';
import { AUTH_REPOSITORY } from './domain/repositories/auth.repository';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { TOKEN_GENERATOR } from './domain/generator/token.generator';
import { JwtTokenGenerator } from './infrastructure/generator/jwt-token.generator';
import { JwtModule } from '@nestjs/jwt';
import { LoginUseCase } from './useCase/login.usecase';
import { RoleController } from './interfaces/http/role.conroller';
import { CreateRoleUseCase } from './useCase/create-role.usecase';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository';
import { RoleRepository } from './infrastructure/repositories/role.repository';
import { Role } from './infrastructure/entity/role.entity';
import { ListRolesUseCase } from './useCase/list-role.usecase';
import { UpdateRoleUseCase } from './useCase/update-role.usecase';
import { DeleteRoleUseCase } from './useCase/delete-role.usecase';
import { AssignRoleUseCase } from './useCase/assign-role.usecase';
import { PermissionEntity } from './infrastructure/entity/permission.entity';
import { AuthRbacSeedService } from './infrastructure/seed/auth-rbac.seed';
import { AuthGuard } from './interfaces/guard/auth.guard';
import { PermissionsGuard } from './interfaces/guard/permissions.guard';
import { ListPermissionsUseCase } from './useCase/list-permissions.usecase';
import { SetRolePermissionsUseCase } from './useCase/set-role-permissions.usecase';
import { GetMeUseCase } from './useCase/get-me.usecase';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity, Role, PermissionEntity]),
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: '1234',
      secretOrPrivateKey: '1234',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController, RoleController],
  providers: [
    CreateCredentialsUseCase,
    LoginUseCase,
    CreateRoleUseCase,
    ListRolesUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    AssignRoleUseCase,
    ListPermissionsUseCase,
    SetRolePermissionsUseCase,
    GetMeUseCase,
    AuthRbacSeedService,
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: RoleRepository,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [AUTH_REPOSITORY, ROLE_REPOSITORY],
})
export class AuthModule {}
