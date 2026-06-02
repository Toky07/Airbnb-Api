import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/authentication/auth.module';
import { AuthEntity } from './modules/authentication/infrastructure/entity/auth.entity';
import { UserEntity } from './modules/user/infrastructure/entities/user.entity';
import { Role } from './modules/authentication/infrastructure/entity/role.entity';
import { PropertiesModule } from './modules/properties/properties.module';
import { PropertyEntity } from './modules/properties/infrastructure/entities/property-entity.entity';
import { RoomsModule } from './modules/rooms/room.module';
import { MediaOrmEntity } from './modules/media/infrastructure/entities/media-orm.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      synchronize: true,
      autoLoadEntities: true,
      entities: [AuthEntity, UserEntity, Role, PropertyEntity, MediaOrmEntity],
    }),
    UserModule,
    AuthModule,
    PropertiesModule,
    RoomsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
