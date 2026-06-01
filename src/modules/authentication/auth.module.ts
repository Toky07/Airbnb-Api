import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity, Role]),
    JwtModule.register({
      global: true,
      secret: '1234',
      secretOrPrivateKey: '1234',
      signOptions: { expiresIn: '1h' },
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
    }
  ],
})
export class AuthModule {}
