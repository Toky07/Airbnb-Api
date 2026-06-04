import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/authentication/auth.module';
import { AuthEntity } from './modules/authentication/infrastructure/entity/auth.entity';
import { UserEntity } from './modules/user/infrastructure/entities/user.entity';
import { Role } from './modules/authentication/infrastructure/entity/role.entity';
import { PermissionEntity } from './modules/authentication/infrastructure/entity/permission.entity';
import { PropertiesModule } from './modules/properties/properties.module';
import { PropertyEntity } from './modules/properties/infrastructure/entities/property-entity.entity';
import { RoomsModule } from './modules/rooms/room.module';
import { MediaOrmEntity } from './modules/media/infrastructure/entities/media-orm.entity';
import { ImportModule } from './modules/import/import.module';
import { HostModule } from './modules/host/host.module';
import { MailModule } from './modules/mail/mail.module';
import { EmailOrmEntity } from './modules/mail/infrastructure/entities/email.orm-entity';
import { AccountActivationModule } from './modules/account-activation/account-activation.module';
import { PasswordSetupTokenOrmEntity } from './modules/account-activation/infrastructure/entities/password-setup-token.orm-entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      autoLoadEntities: true,
      entities: [
        AuthEntity,
        UserEntity,
        Role,
        PermissionEntity,
        PropertyEntity,
        MediaOrmEntity,
        EmailOrmEntity,
        PasswordSetupTokenOrmEntity,
      ],
    }),
    UserModule,
    AuthModule,
    PropertiesModule,
    RoomsModule,
    ImportModule,
    HostModule,
    MailModule,
    AccountActivationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
