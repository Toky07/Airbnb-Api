import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaOrmEntity } from './infrastructure/entities/media-orm.entity';
import {
  MEDIA_REPOSITORY,
  MediaRepository,
} from './infrastructure/repositories/media.repository';
import type { IMediaRepository } from './domain/repositories/media.repository';
import {
  LOCAL_STORAGE_SERVICE,
  LocalStorageService,
} from './services/localStorage.service';
import type { ILocalStorageService } from './services/localStorage.service';
import { MediaBootstrap } from './media.bootstrap';
import { CommandBus } from '@src/shared/useCase/bus/bus';
import { QueryBus } from '@src/shared/useCase/bus/query-bus';
import { SaveEntityMediasCommand } from './applications/useCase/commands/SaveEntityMediasCommand';
import { SyncEntityMediasCommand } from './applications/useCase/commands/SyncEntityMediasCommand';
import { DeleteMediasByEntityCommand } from './applications/useCase/commands/DeleteMediasByEntityCommand';
import { GetMediasByEntityQuery } from './applications/useCase/queries/GetMediasByEntityQuery';

@Module({
  imports: [TypeOrmModule.forFeature([MediaOrmEntity])],
  controllers: [],
  providers: [
    {
      provide: MEDIA_REPOSITORY,
      useClass: MediaRepository,
    },
    {
      provide: LOCAL_STORAGE_SERVICE,
      useClass: LocalStorageService,
    },
  ],
  exports: [LOCAL_STORAGE_SERVICE],
})
export class MediaModule implements OnModuleInit {
  constructor(
    @Inject(MEDIA_REPOSITORY)
    private readonly mediaRepository: IMediaRepository,
    @Inject(LOCAL_STORAGE_SERVICE)
    private readonly storage: ILocalStorageService,
  ) {}

  onModuleInit() {
    const bootstrap = MediaBootstrap.create({
      mediaRepository: this.mediaRepository,
      storage: this.storage,
    });

    CommandBus.register(
      SaveEntityMediasCommand,
      bootstrap.saveEntityMediasCommandHandler,
    );
    CommandBus.register(
      SyncEntityMediasCommand,
      bootstrap.syncEntityMediasCommandHandler,
    );
    CommandBus.register(
      DeleteMediasByEntityCommand,
      bootstrap.deleteMediasByEntityCommandHandler,
    );

    QueryBus.register(
      GetMediasByEntityQuery,
      bootstrap.getMediasByEntityQueryHandler,
    );
  }
}
