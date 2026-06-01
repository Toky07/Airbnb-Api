import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/authentication/auth.module';
import { AuthEntity } from './modules/authentication/infrastructure/entity/auth.entity';
import { UserEntity } from './modules/user/infrastructure/entities/user.entity';
import { Role } from './modules/authentication/infrastructure/entity/role.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      entities: [AuthEntity, UserEntity, Role],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
