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

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity]),
    JwtModule.register({
      global: true,
      secret: '1234',
      secretOrPrivateKey: '1234',
      signOptions: { expiresIn: '1h' },
    }),
],
  controllers: [AuthController],
  providers: [
    CreateCredentialsUseCase,
    LoginUseCase,
    {
        provide: AUTH_REPOSITORY,
        useClass: AuthRepository,
    },
    {
        provide: TOKEN_GENERATOR,
        useClass: JwtTokenGenerator,
    },
  ],
})
export class AuthModule {}
