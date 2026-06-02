import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteMediasByEntityUseCase } from './applications/useCase/deleteMediasByEntity.usecase';
import { GetMediasByEntityUseCase } from './applications/useCase/getMediasByEntity.usecase';
import { SaveEntityMediasUseCase } from './applications/useCase/saveEntityMedias.usecase';
import { MediaOrmEntity } from './infrastructure/entities/media-orm.entity';
import {
  MEDIA_REPOSITORY,
  MediaRepository,
} from './infrastructure/repositories/media.repository';
import {
  LOCAL_STORAGE_SERVICE,
  LocalStorageService,
} from './services/localStorage.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaOrmEntity])],
  controllers: [],
  providers: [
    GetMediasByEntityUseCase,
    DeleteMediasByEntityUseCase,
    SaveEntityMediasUseCase,
    {
      provide: MEDIA_REPOSITORY,
      useClass: MediaRepository,
    },
    {
      provide: LOCAL_STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [
    GetMediasByEntityUseCase,
    DeleteMediasByEntityUseCase,
    SaveEntityMediasUseCase,
  ],
})
export class MediaModule {}
